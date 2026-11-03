using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using IceRelay.Api.Models;
using IceRelay.Api.Helpers;
using Microsoft.Data.SqlClient;

namespace IceRelay.Api.Functions;

public class ReportsFunction
{
    private readonly ILogger<ReportsFunction> _logger;

    public ReportsFunction(ILogger<ReportsFunction> logger)
    {
        _logger = logger;
    }

    [Function("GetReports")]
    public async Task<HttpResponseData> GetReports(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reports")] HttpRequestData req)
    {
        var rateLimitResponse = await ApplyRequestRateLimit(req);
        if (rateLimitResponse is not null) return rateLimitResponse;

        _logger.LogInformation("Getting all ice reports");

        try
        {
            var connectionString = GetConnectionString();
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            // Get the 6 most recent reports from the last 180 days
            var sql = @"
                SELECT TOP 6
                    ReportId,
                    LakeName,
                    Latitude,
                    Longitude,
                    IceThicknessIn,
                    MeasurementType,
                    SurfaceType,
                    Notes,
                    CreatedAt
                FROM dbo.IceReports
                WHERE CreatedAt > DATEADD(DAY, -180, SYSUTCDATETIME())
                  AND ExpiresAt > SYSUTCDATETIME() AND IsFlagged = 0
                ORDER BY CreatedAt DESC;";

            await using var command = new SqlCommand(sql, connection);
            var reports = await ReadReportsAsync(command);

            _logger.LogInformation($"Retrieved {reports.Count} reports from database");
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(reports);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reports");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("An error occurred while retrieving reports");
            return errorResponse;
        }
    }

    [Function("GetReportsInBounds")]
    public async Task<HttpResponseData> GetReportsInBounds(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reports/bounds")] HttpRequestData req)
    {
        var rateLimitResponse = await ApplyRequestRateLimit(req);
        if (rateLimitResponse is not null) return rateLimitResponse;

        _logger.LogInformation("Getting reports within map bounds");

        try
        {
            // Parse query parameters
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            if (!TryParseCoordinate(query["north"], out var north) ||
                !TryParseCoordinate(query["south"], out var south) ||
                !TryParseCoordinate(query["east"], out var east) ||
                !TryParseCoordinate(query["west"], out var west) ||
                north > 90 || south < -90 || south > north ||
                east > 180 || east < -180 || west > 180 || west < -180)
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteStringAsync("Invalid bounds parameters");
                return errorResponse;
            }

            double.TryParse(query["zoom"], out var zoom);

            var connectionString = GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not found");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database configuration error");
                return errorResponse;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            // Get reports within bounds from the last 180 days, limit to 100
            var sql = @"
                SELECT TOP 100
                    ReportId,
                    LakeName,
                    Latitude,
                    Longitude,
                    IceThicknessIn,
                    MeasurementType,
                    SurfaceType,
                    Notes,
                    CreatedAt
                FROM dbo.IceReports
                WHERE CreatedAt > DATEADD(DAY, -180, SYSUTCDATETIME())
                  AND ExpiresAt > SYSUTCDATETIME() AND IsFlagged = 0
                  AND Latitude BETWEEN @south AND @north
                  AND ((@west <= @east AND Longitude BETWEEN @west AND @east)
                    OR (@west > @east AND (Longitude >= @west OR Longitude <= @east)))
                ORDER BY CreatedAt DESC;";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@north", north);
            command.Parameters.AddWithValue("@south", south);
            command.Parameters.AddWithValue("@east", east);
            command.Parameters.AddWithValue("@west", west);

            var reports = await ReadReportsAsync(command);

            _logger.LogInformation($"Retrieved {reports.Count} reports within bounds");

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(reports);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving bounded reports");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("An error occurred while retrieving reports");
            return errorResponse;
        }
    }

    [Function("CreateReport")]
    public async Task<HttpResponseData> CreateReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reports")] HttpRequestData req)
    {
        _logger.LogInformation("Creating new ice report");

        var rateLimitResponse = await ApplyRequestRateLimit(req);
        if (rateLimitResponse is not null) return rateLimitResponse;
        var ipAddress = GetClientIpAddress(req);

        var (reportRequest, requestError) = await ReadRequestAsync<CreateReportRequest>(req);
        if (requestError is not null) return requestError;
        if (reportRequest is null) throw new InvalidOperationException("Request validation returned no value.");

        // Validate required fields
        if (!IsValidLocation(reportRequest.Latitude, reportRequest.Longitude) ||
            reportRequest.Latitude == 0 || reportRequest.Longitude == 0)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Latitude and Longitude are required");
            return badResponse;
        }

        if (!double.IsFinite(reportRequest.Thickness) || reportRequest.Thickness < 0 || reportRequest.Thickness > 50)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Thickness must be between 0 and 50 inches");
            return badResponse;
        }

        var surfaceType = reportRequest.SurfaceType?.ToLowerInvariant() switch
        {
            "clear" => "Clear",
            "snow" or "snow-covered" => "Snow",
            "slush" => "Slush",
            "refrozen" => "Refrozen",
            _ => null
        };
        if (surfaceType is null)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Surface type must be clear, snow, slush, or refrozen");
            return badResponse;
        }

        // Validate and sanitize lake name
        var lakeValidation = ContentValidator.ValidateLakeName(reportRequest.Lake);
        if (!lakeValidation.IsValid)
        {
            _logger.LogWarning($"Invalid lake name: {reportRequest.Lake}");
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync(lakeValidation.ErrorMessage!);
            return badResponse;
        }
        var cleanedLakeName = lakeValidation.CleanedText!;

        var cleanedQuality = new List<string>();
        if (reportRequest.IceQuality is not null)
        {
            if (reportRequest.IceQuality.Count > 10)
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteStringAsync("At most 10 ice conditions may be included");
                return badResponse;
            }
            foreach (var condition in reportRequest.IceQuality)
            {
                var validation = ContentValidator.ValidateText(condition, "Ice condition", 50);
                if (!validation.IsValid || string.IsNullOrWhiteSpace(validation.CleanedText))
                {
                    var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badResponse.WriteStringAsync(validation.ErrorMessage ?? "Ice conditions must not be empty");
                    return badResponse;
                }
                cleanedQuality.Add(validation.CleanedText);
            }
        }

        // Validate and sanitize location
        string? cleanedLocation = null;
        if (!string.IsNullOrWhiteSpace(reportRequest.Location))
        {
            var locationValidation = ContentValidator.ValidateText(reportRequest.Location, "Location", 200);
            if (!locationValidation.IsValid)
            {
                _logger.LogWarning($"Invalid location text: {reportRequest.Location}");
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteStringAsync(locationValidation.ErrorMessage!);
                return badResponse;
            }
            cleanedLocation = locationValidation.CleanedText;
        }

        // Validate and sanitize notes
        string? cleanedNotes = null;
        if (!string.IsNullOrWhiteSpace(reportRequest.Notes))
        {
            var notesValidation = ContentValidator.ValidateText(reportRequest.Notes, "Notes", 500);
            if (!notesValidation.IsValid)
            {
                _logger.LogWarning($"Invalid notes text: {reportRequest.Notes}");
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteStringAsync(notesValidation.ErrorMessage!);
                return badResponse;
            }
            cleanedNotes = notesValidation.CleanedText;
        }

        if (!RateLimiter.CanSubmitReport(ipAddress, out var reportLimitError))
        {
            _logger.LogWarning("Report submission limit exceeded");
            var errorResponse = req.CreateResponse(HttpStatusCode.TooManyRequests);
            await errorResponse.WriteStringAsync(reportLimitError!);
            errorResponse.Headers.Add("Retry-After", "3600");
            return errorResponse;
        }

        if (RateLimiter.IsRecentDuplicate(ipAddress, reportRequest.Latitude, reportRequest.Longitude, out var duplicateError))
        {
            _logger.LogWarning("Duplicate report detected");
            var errorResponse = req.CreateResponse(HttpStatusCode.Conflict);
            await errorResponse.WriteStringAsync(duplicateError!);
            return errorResponse;
        }

        try
        {
            // Get connection string from environment
            var connectionString = GetConnectionString();
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }

            // Generate anonymous session hash from IP
            var sessionHash = GenerateSessionHash(ipAddress);

            // Insert into SQL database
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var sql = @"
                INSERT INTO dbo.IceReports (
                    Latitude,
                    Longitude,
                    LakeName,
                    IceThicknessIn,
                    MeasurementType,
                    SurfaceType,
                    Notes,
                    ExpiresAt,
                    AnonymousSessionHash
                )
                OUTPUT INSERTED.ReportId, INSERTED.CreatedAt
                VALUES (
                    @Latitude,
                    @Longitude,
                    @LakeName,
                    @IceThicknessIn,
                    @MeasurementType,
                    @SurfaceType,
                    @Notes,
                    DATEADD(DAY, 180, SYSUTCDATETIME()),
                    @SessionHash
                );";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Latitude", reportRequest.Latitude);
            command.Parameters.AddWithValue("@Longitude", reportRequest.Longitude);
            command.Parameters.AddWithValue("@LakeName", cleanedLakeName);
            command.Parameters.AddWithValue("@IceThicknessIn", reportRequest.Thickness);
            command.Parameters.AddWithValue("@MeasurementType", reportRequest.IsMeasured ? "Measured" : "Observed");
            
            command.Parameters.AddWithValue("@SurfaceType", surfaceType);
            
            // Combine notes with ice quality and location (using cleaned values)
            var notesText = cleanedNotes ?? "";
            if (cleanedQuality.Count > 0)
            {
                var qualityText = string.Join(", ", cleanedQuality);
                notesText = string.IsNullOrWhiteSpace(notesText) 
                    ? $"Conditions: {qualityText}"
                    : $"{notesText} | Conditions: {qualityText}";
            }
            if (!string.IsNullOrWhiteSpace(cleanedLocation))
            {
                notesText = string.IsNullOrWhiteSpace(notesText)
                    ? $"Location: {cleanedLocation}"
                    : $"{notesText} | Location: {cleanedLocation}";
            }
            command.Parameters.AddWithValue("@Notes", string.IsNullOrWhiteSpace(notesText) ? (object)DBNull.Value : notesText);
            command.Parameters.AddWithValue("@SessionHash", sessionHash);

            await using var reader = await command.ExecuteReaderAsync();
            
            string? insertedId = null;
            DateTime? createdAt = null;
            if (await reader.ReadAsync())
            {
                insertedId = reader["ReportId"].ToString();
                createdAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"));
            }
            if (insertedId is null || createdAt is null)
                throw new InvalidOperationException("The report insert did not return an identifier and timestamp.");

            _logger.LogInformation($"Report created successfully: ID={insertedId}, Lake={cleanedLakeName}");

            // Return created report
            var report = new IceReport
            {
                Id = insertedId,
                LakeName = cleanedLakeName,
                Thickness = reportRequest.Thickness,
                Location = cleanedLocation,
                Latitude = reportRequest.Latitude,
                Longitude = reportRequest.Longitude,
                SurfaceType = surfaceType.ToLowerInvariant(),
                IsMeasured = reportRequest.IsMeasured,
                Method = reportRequest.Method,
                IceQuality = cleanedQuality,
                Notes = cleanedNotes,
                CreatedAt = DateTime.SpecifyKind(createdAt.Value, DateTimeKind.Utc)
            };

            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(report);
            return response;
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "SQL error creating report");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("Could not save the report. Please try again later.");
            return errorResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating report");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("An unexpected error occurred");
            return errorResponse;
        }
    }

    private static string GenerateSessionHash(string ipAddress)
    {
        return RateLimiter.HashClientIdentifier(ipAddress);
    }

    [Function("GetNearbyReports")]
    public async Task<HttpResponseData> GetNearbyReports(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reports/nearby")] HttpRequestData req)
    {
        var rateLimitResponse = await ApplyRequestRateLimit(req);
        if (rateLimitResponse is not null) return rateLimitResponse;

        _logger.LogInformation("Getting nearby ice reports");

        var (nearbyRequest, requestError) = await ReadRequestAsync<NearbyReportsRequest>(req);
        if (requestError is not null) return requestError;
        if (nearbyRequest is null) throw new InvalidOperationException("Request validation returned no value.");

        if (!IsValidLocation(nearbyRequest.Latitude, nearbyRequest.Longitude) ||
            !double.IsFinite(nearbyRequest.RadiusKm) || nearbyRequest.RadiusKm <= 0 || nearbyRequest.RadiusKm > 500)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Provide valid coordinates and a radius greater than 0 and at most 500 km");
            return badResponse;
        }

        try
        {
            var connectionString = GetConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            var sql = @"
                SELECT TOP 100 ReportId, LakeName, Latitude, Longitude, IceThicknessIn,
                    MeasurementType, SurfaceType, Notes, CreatedAt
                FROM dbo.IceReports
                CROSS APPLY (SELECT
                    SIN(RADIANS(CONVERT(FLOAT, Latitude))) * SIN(RADIANS(@Latitude))
                    + COS(RADIANS(CONVERT(FLOAT, Latitude))) * COS(RADIANS(@Latitude))
                    * COS(RADIANS(CONVERT(FLOAT, Longitude) - @Longitude)) AS CosineDistance
                ) AS angular
                CROSS APPLY (SELECT 6371.0 * ACOS(CASE
                    WHEN CosineDistance > 1 THEN 1
                    WHEN CosineDistance < -1 THEN -1
                    ELSE CosineDistance END) AS DistanceKm
                ) AS distance
                WHERE CreatedAt > DATEADD(DAY, -180, SYSUTCDATETIME())
                  AND ExpiresAt > SYSUTCDATETIME() AND IsFlagged = 0
                  AND Latitude BETWEEN @South AND @North
                  AND DistanceKm <= @RadiusKm
                ORDER BY DistanceKm, CreatedAt DESC;";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.Add("@Latitude", System.Data.SqlDbType.Float).Value = nearbyRequest.Latitude;
            command.Parameters.Add("@Longitude", System.Data.SqlDbType.Float).Value = nearbyRequest.Longitude;
            command.Parameters.Add("@RadiusKm", System.Data.SqlDbType.Float).Value = nearbyRequest.RadiusKm;
            var latitudeDelta = nearbyRequest.RadiusKm / 110.0;
            command.Parameters.Add("@South", System.Data.SqlDbType.Float).Value = Math.Max(-90, nearbyRequest.Latitude - latitudeDelta);
            command.Parameters.Add("@North", System.Data.SqlDbType.Float).Value = Math.Min(90, nearbyRequest.Latitude + latitudeDelta);
            var reports = await ReadReportsAsync(command);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(reports);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving nearby reports");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("Could not load nearby reports. Please try again later.");
            return errorResponse;
        }

    }

    [Function("GetLakeReports")]
    public async Task<HttpResponseData> GetLakeReports(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reports/lake/{lakeName}")] HttpRequestData req,
        string lakeName)
    {
        var rateLimitResponse = await ApplyRequestRateLimit(req);
        if (rateLimitResponse is not null) return rateLimitResponse;

        _logger.LogInformation($"Getting reports for lake: {lakeName}");

        if (string.IsNullOrWhiteSpace(lakeName) || lakeName.Trim().Length > 100)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Provide a lake name of at most 100 characters");
            return badResponse;
        }

        try
        {
            var connectionString = GetConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            var sql = @"
                SELECT TOP 100 ReportId, LakeName, Latitude, Longitude, IceThicknessIn,
                    MeasurementType, SurfaceType, Notes, CreatedAt
                FROM dbo.IceReports
                WHERE LakeName = @LakeName
                  AND CreatedAt > DATEADD(DAY, -180, SYSUTCDATETIME())
                  AND ExpiresAt > SYSUTCDATETIME() AND IsFlagged = 0
                ORDER BY CreatedAt DESC;";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.Add("@LakeName", System.Data.SqlDbType.NVarChar, 100).Value = lakeName.Trim();
            var reports = await ReadReportsAsync(command);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(reports);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lake reports");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("Could not load lake reports. Please try again later.");
            return errorResponse;
        }
    }

    [Function("DetectLakeByLocation")]
    public async Task<HttpResponseData> DetectLakeByLocation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reports/detect-lake")] HttpRequestData req)
    {
        var rateLimitResponse = await ApplyRequestRateLimit(req);
        if (rateLimitResponse is not null) return rateLimitResponse;

        _logger.LogInformation("Detecting lake by GPS coordinates");

        var (detectRequest, requestError) = await ReadRequestAsync<DetectLakeRequest>(req);
        if (requestError is not null) return requestError;
        if (detectRequest is null) throw new InvalidOperationException("Request validation returned no value.");
        if (!IsValidLocation(detectRequest.Latitude, detectRequest.Longitude))
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Provide valid latitude and longitude");
            return badResponse;
        }

        _logger.LogInformation($"Searching for lakes near: Lat={detectRequest.Latitude}, Lng={detectRequest.Longitude}");

        try
        {
            var connectionString = GetConnectionString();
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            // Find lakes within ~500m radius (approximately 0.005 degrees)
            // Return all matching lakes sorted by report count and recency
            var sql = @"
                SELECT 
                    LakeName,
                    AVG(Latitude) as AvgLatitude,
                    AVG(Longitude) as AvgLongitude,
                    COUNT(*) as ReportCount,
                    MAX(CreatedAt) as LastReportDate
                FROM dbo.IceReports
                WHERE LakeName IS NOT NULL 
                    AND LakeName != ''
                    AND CreatedAt > DATEADD(DAY, -180, SYSUTCDATETIME())
                    AND ExpiresAt > SYSUTCDATETIME() AND IsFlagged = 0
                    AND Latitude BETWEEN @Lat - 0.005 AND @Lat + 0.005
                    AND Longitude BETWEEN @Lng - 0.005 AND @Lng + 0.005
                GROUP BY LakeName
                ORDER BY ReportCount DESC, MAX(CreatedAt) DESC;";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Lat", detectRequest.Latitude);
            command.Parameters.AddWithValue("@Lng", detectRequest.Longitude);

            _logger.LogInformation($"=== SEARCH PARAMETERS ===");
            _logger.LogInformation($"User Location: Lat={detectRequest.Latitude}, Lng={detectRequest.Longitude}");
            _logger.LogInformation($"Search range: Lat {detectRequest.Latitude - 0.005} to {detectRequest.Latitude + 0.005}");
            _logger.LogInformation($"Search range: Lng {detectRequest.Longitude - 0.005} to {detectRequest.Longitude + 0.005}");

            await using var reader = await command.ExecuteReaderAsync();
            
            var lakes = new List<LakeSuggestion>();
            
            _logger.LogInformation("=== QUERY RESULTS ===");
            while (await reader.ReadAsync())
            {
                var lakeName = reader["LakeName"].ToString();
                var avgLat = Convert.ToDouble(reader["AvgLatitude"]);
                var avgLng = Convert.ToDouble(reader["AvgLongitude"]);
                var reportCount = Convert.ToInt32(reader["ReportCount"]);
                var distanceKm = CalculateDistance(
                    detectRequest.Latitude, detectRequest.Longitude,
                    avgLat, avgLng
                );

                _logger.LogInformation($"MATCH: {lakeName} | Lat={avgLat}, Lng={avgLng} | Distance={distanceKm:F3}km | Reports={reportCount}");

                lakes.Add(new LakeSuggestion
                {
                    LakeName = lakeName,
                    Latitude = avgLat,
                    Longitude = avgLng,
                    ReportCount = reportCount,
                    LastReportDate = reader["LastReportDate"] as DateTime?,
                    DistanceKm = distanceKm
                });
            }
            
            _logger.LogInformation($"=== TOTAL MATCHES: {lakes.Count} ===");
            
            if (lakes.Count > 0)
            {
                // Sort by distance first (closest first), then by report count
                lakes = lakes.OrderBy(l => l.DistanceKm).ThenByDescending(l => l.ReportCount).ToList();
                
                _logger.LogInformation($"Returning {lakes.Count} lake(s). Closest: {lakes[0].LakeName} at {lakes[0].DistanceKm:F3}km");
                
                // Return the closest lake as primary suggestion
                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(lakes[0]);
                return response;
            }
            else
            {
                // No lake found nearby
                _logger.LogInformation("No lake found within 500m search radius");
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteStringAsync("No lake found at this location. You can be the first to report!");
                return notFoundResponse;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error detecting lake");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("An error occurred while detecting lake");
            return errorResponse;
        }
    }

    [Function("SearchLakeNames")]
    public async Task<HttpResponseData> SearchLakeNames(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reports/search-lakes")] HttpRequestData req)
    {
        var rateLimitResponse = await ApplyRequestRateLimit(req);
        if (rateLimitResponse is not null) return rateLimitResponse;

        _logger.LogInformation("Searching lake names");

        var query = req.Query["q"] ?? "";
        
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2 || query.Length > 100)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Query must be between 2 and 100 characters");
            return badResponse;
        }

        try
        {
            var connectionString = GetConnectionString();
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            // Search for lake names that match the query
            var sql = @"
                SELECT TOP 10
                    LakeName,
                    AVG(Latitude) as AvgLatitude,
                    AVG(Longitude) as AvgLongitude,
                    COUNT(*) as ReportCount,
                    MAX(CreatedAt) as LastReportDate
                FROM dbo.IceReports
                WHERE LakeName IS NOT NULL 
                    AND LakeName != ''
                    AND LakeName LIKE @Query
                    AND CreatedAt > DATEADD(DAY, -180, SYSUTCDATETIME())
                    AND ExpiresAt > SYSUTCDATETIME() AND IsFlagged = 0
                GROUP BY LakeName
                ORDER BY ReportCount DESC, MAX(CreatedAt) DESC;";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Query", $"%{query}%");

            var suggestions = new List<LakeSuggestion>();
            await using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                suggestions.Add(new LakeSuggestion
                {
                    LakeName = reader["LakeName"].ToString(),
                    Latitude = Convert.ToDouble(reader["AvgLatitude"]),
                    Longitude = Convert.ToDouble(reader["AvgLongitude"]),
                    ReportCount = Convert.ToInt32(reader["ReportCount"]),
                    LastReportDate = reader["LastReportDate"] as DateTime?
                });
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(suggestions);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching lake names");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("An error occurred while searching");
            return errorResponse;
        }
    }

    private static string? GetConnectionString()
    {
        var azureConnection = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection");
        return !string.IsNullOrWhiteSpace(azureConnection)
            ? azureConnection
            : Environment.GetEnvironmentVariable("SqlConnectionString");
    }

    private static bool IsValidLocation(double latitude, double longitude) =>
        double.IsFinite(latitude) && double.IsFinite(longitude) &&
        latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;

    private static bool TryParseCoordinate(string? value, out double coordinate) =>
        double.TryParse(value, System.Globalization.NumberStyles.Float,
            System.Globalization.CultureInfo.InvariantCulture, out coordinate) && double.IsFinite(coordinate);

    private async Task<(T? Value, HttpResponseData? Error)> ReadRequestAsync<T>(HttpRequestData req) where T : class
    {
        const int maxBodyBytes = 16384;
        var buffer = new byte[maxBodyBytes + 1];
        var length = 0;
        while (length < buffer.Length)
        {
            var read = await req.Body.ReadAsync(buffer.AsMemory(length));
            if (read == 0) break;
            length += read;
        }
        if (length > maxBodyBytes)
        {
            _logger.LogWarning("HTTP request body exceeded the 16 KiB limit");
            var response = req.CreateResponse(HttpStatusCode.RequestEntityTooLarge);
            await response.WriteStringAsync("Request body must not exceed 16 KiB");
            return (null, response);
        }
        try
        {
            var value = JsonSerializer.Deserialize<T>(buffer.AsSpan(0, length), new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            if (value is not null) return (value, null);
        }
        catch (JsonException)
        {
            _logger.LogWarning("Invalid JSON request body");
        }
        var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
        await badResponse.WriteStringAsync("Provide a valid JSON request body");
        return (null, badResponse);
    }

    private static async Task<List<IceReport>> ReadReportsAsync(SqlCommand command)
    {
        await using var reader = await command.ExecuteReaderAsync();
        var reports = new List<IceReport>();
        while (await reader.ReadAsync())
        {
            var storedNotes = reader["Notes"] as string;
            string? location = null;
            List<string>? quality = null;
            var noteParts = new List<string>();
            foreach (var part in (storedNotes ?? "").Split(" | ", StringSplitOptions.RemoveEmptyEntries))
            {
                if (part.StartsWith("Location:", StringComparison.Ordinal))
                    location = part["Location:".Length..].Trim();
                else if (part.StartsWith("Conditions:", StringComparison.Ordinal))
                    quality = part["Conditions:".Length..].Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
                else
                    noteParts.Add(part);
            }
            reports.Add(new IceReport
            {
                Id = reader["ReportId"].ToString(),
                LakeName = reader["LakeName"] as string,
                Latitude = Convert.ToDouble(reader["Latitude"]),
                Longitude = Convert.ToDouble(reader["Longitude"]),
                Thickness = Convert.ToDouble(reader["IceThicknessIn"]),
                SurfaceType = (reader["SurfaceType"] as string)?.ToLowerInvariant(),
                IsMeasured = (reader["MeasurementType"] as string) == "Measured",
                CreatedAt = DateTime.SpecifyKind(reader.GetDateTime(reader.GetOrdinal("CreatedAt")), DateTimeKind.Utc),
                Location = location,
                IceQuality = quality,
                Notes = noteParts.Count > 0 ? string.Join(" | ", noteParts) : null
            });
        }
        return reports;
    }

    // Helper function to calculate distance between two GPS coordinates in kilometers
    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // Earth's radius in kilometers
        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);
        
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * Math.PI / 180.0;
    }

    private static string GetClientIpAddress(HttpRequestData req)
    {
        if (!req.Headers.TryGetValues("X-Forwarded-For", out var values))
        {
            return "unknown";
        }

        var forwardedChain = values.FirstOrDefault();
        var lastAddress = forwardedChain?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .LastOrDefault();

        return IPAddress.TryParse(lastAddress, out var address)
            ? address.ToString()
            : "unknown";
    }

    private static async Task<HttpResponseData?> ApplyRequestRateLimit(HttpRequestData req)
    {
        var ipAddress = GetClientIpAddress(req);
        if (!RateLimiter.IsRateLimited(ipAddress, out var errorMessage))
        {
            return null;
        }

        var response = req.CreateResponse(HttpStatusCode.TooManyRequests);
        response.Headers.Add("Retry-After", "60");
        await response.WriteStringAsync(errorMessage!);
        return response;
    }
}
