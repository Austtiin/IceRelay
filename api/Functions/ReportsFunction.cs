using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using IceRelay.Api.Models;
using Microsoft.Data.SqlClient;
using System.Security.Cryptography;

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
        _logger.LogInformation("Getting all ice reports");

        try
        {
            var connectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection") 
                ?? Environment.GetEnvironmentVariable("SqlConnectionString");
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            // Get the 6 most recent reports that haven't expired
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
                FROM IceReports
                WHERE ExpiresAt > SYSUTCDATETIME()
                ORDER BY CreatedAt DESC;";

            await using var command = new SqlCommand(sql, connection);
            await using var reader = await command.ExecuteReaderAsync();

            var reports = new List<IceReport>();
            while (await reader.ReadAsync())
            {
                // Parse location and ice quality from Notes if present
                var notes = reader["Notes"] as string;
                string? location = null;
                List<string>? iceQuality = null;

                if (!string.IsNullOrWhiteSpace(notes))
                {
                    // Extract location if present (format: "Location: value")
                    if (notes.Contains("Location:"))
                    {
                        var locationMatch = System.Text.RegularExpressions.Regex.Match(notes, @"Location:\s*([^|]+)");
                        if (locationMatch.Success)
                        {
                            location = locationMatch.Groups[1].Value.Trim();
                        }
                    }

                    // Extract ice quality conditions if present (format: "Conditions: value1, value2")
                    if (notes.Contains("Conditions:"))
                    {
                        var conditionsMatch = System.Text.RegularExpressions.Regex.Match(notes, @"Conditions:\s*([^|]+)");
                        if (conditionsMatch.Success)
                        {
                            var conditions = conditionsMatch.Groups[1].Value.Trim();
                            iceQuality = conditions.Split(',').Select(c => c.Trim()).ToList();
                        }
                    }
                }

                // Read CreatedAt and specify it's UTC (database stores UTC)
                var createdAtUtc = DateTime.SpecifyKind(
                    reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    DateTimeKind.Utc
                );

                var report = new IceReport
                {
                    Id = reader["ReportId"].ToString(),
                    LakeName = reader["LakeName"] as string,
                    Thickness = Convert.ToDouble(reader["IceThicknessIn"]),
                    Location = location,
                    Latitude = Convert.ToDouble(reader["Latitude"]),
                    Longitude = Convert.ToDouble(reader["Longitude"]),
                    SurfaceType = (reader["SurfaceType"] as string)?.ToLower() ?? "clear",
                    IsMeasured = (reader["MeasurementType"] as string) == "Measured",
                    CreatedAt = createdAtUtc,
                    IceQuality = iceQuality
                };

                reports.Add(report);
            }

            _logger.LogInformation($"Retrieved {reports.Count} reports from database");
            
            // Log the order of reports being returned with detailed timestamp info
            for (int i = 0; i < reports.Count && i < 6; i++)
            {
                var createdTicks = reports[i].CreatedAt.Ticks;
                _logger.LogInformation($"Report[{i}]: {reports[i].LakeName} - CreatedAt: {reports[i].CreatedAt:O} (Ticks: {createdTicks})");
            }
            
            // Log if there's an ordering issue
            if (reports.Count >= 2)
            {
                var isDescending = reports[0].CreatedAt >= reports[1].CreatedAt;
                _logger.LogInformation($"Order check: First report is {(isDescending ? "NEWER" : "OLDER")} than second - {(isDescending ? "CORRECT" : "WRONG")}");
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            // Cache recent reports for 1 hour; other APIs remain uncached
            response.Headers.Add("Cache-Control", "public, max-age=3600");
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
        _logger.LogInformation("Getting reports within map bounds");

        try
        {
            // Parse query parameters
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            if (!double.TryParse(query["north"], out var north) ||
                !double.TryParse(query["south"], out var south) ||
                !double.TryParse(query["east"], out var east) ||
                !double.TryParse(query["west"], out var west))
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteStringAsync("Invalid bounds parameters");
                return errorResponse;
            }

            double.TryParse(query["zoom"], out var zoom);

            var connectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection") 
                                 ?? Environment.GetEnvironmentVariable("SqlConnectionString");

            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not found");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database configuration error");
                return errorResponse;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            // Get reports within bounds, limit to 100
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
                FROM IceReports
                WHERE ExpiresAt > SYSUTCDATETIME()
                  AND Latitude BETWEEN @south AND @north
                  AND Longitude BETWEEN @west AND @east
                ORDER BY CreatedAt DESC;";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@north", north);
            command.Parameters.AddWithValue("@south", south);
            command.Parameters.AddWithValue("@east", east);
            command.Parameters.AddWithValue("@west", west);

            await using var reader = await command.ExecuteReaderAsync();

            var reports = new List<IceReport>();
            while (await reader.ReadAsync())
            {
                // Parse location and ice quality from Notes if present
                var notes = reader["Notes"] as string;
                string? location = null;
                List<string>? iceQuality = null;

                if (!string.IsNullOrWhiteSpace(notes))
                {
                    if (notes.Contains("Location:"))
                    {
                        var locationMatch = System.Text.RegularExpressions.Regex.Match(notes, @"Location:\s*([^|]+)");
                        if (locationMatch.Success)
                        {
                            location = locationMatch.Groups[1].Value.Trim();
                        }
                    }

                    if (notes.Contains("Conditions:"))
                    {
                        var conditionsMatch = System.Text.RegularExpressions.Regex.Match(notes, @"Conditions:\s*([^|]+)");
                        if (conditionsMatch.Success)
                        {
                            var conditions = conditionsMatch.Groups[1].Value.Trim();
                            iceQuality = conditions.Split(',').Select(c => c.Trim()).ToList();
                        }
                    }
                }

                // Read CreatedAt and specify it's UTC
                var createdAtUtc = DateTime.SpecifyKind(
                    reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    DateTimeKind.Utc
                );

                var report = new IceReport
                {
                    Id = reader["ReportId"].ToString(),
                    LakeName = reader["LakeName"] as string,
                    Thickness = Convert.ToDouble(reader["IceThicknessIn"]),
                    Location = location,
                    Latitude = Convert.ToDouble(reader["Latitude"]),
                    Longitude = Convert.ToDouble(reader["Longitude"]),
                    SurfaceType = (reader["SurfaceType"] as string)?.ToLower() ?? "clear",
                    IsMeasured = (reader["MeasurementType"] as string) == "Measured",
                    CreatedAt = createdAtUtc,
                    IceQuality = iceQuality
                };

                reports.Add(report);
            }

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

        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var reportRequest = JsonSerializer.Deserialize<CreateReportRequest>(requestBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (reportRequest == null)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Invalid request body");
            return badResponse;
        }

        // Validate required fields
        if (reportRequest.Latitude == 0 || reportRequest.Longitude == 0)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Latitude and Longitude are required");
            return badResponse;
        }

        if (reportRequest.Thickness < 0 || reportRequest.Thickness > 50)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Thickness must be between 0 and 50 inches");
            return badResponse;
        }

        if (string.IsNullOrWhiteSpace(reportRequest.SurfaceType))
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Surface type is required");
            return badResponse;
        }

        try
        {
            // Get connection string from environment
            var connectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection") 
                ?? Environment.GetEnvironmentVariable("SqlConnectionString");
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }

            // Generate anonymous session hash from IP
            var ipAddress = req.Headers.TryGetValues("X-Forwarded-For", out var values) 
                ? values.FirstOrDefault() ?? "unknown"
                : "unknown";
            var sessionHash = GenerateSessionHash(ipAddress);

            // Insert into SQL database
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var sql = @"
                INSERT INTO IceReports (
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
                    DATEADD(HOUR, 24, SYSUTCDATETIME()),
                    @SessionHash
                );";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Latitude", reportRequest.Latitude);
            command.Parameters.AddWithValue("@Longitude", reportRequest.Longitude);
            command.Parameters.AddWithValue("@LakeName", reportRequest.Lake ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@IceThicknessIn", reportRequest.Thickness);
            command.Parameters.AddWithValue("@MeasurementType", reportRequest.IsMeasured ? "Measured" : "Observed");
            
            // Map surface type to DB values (capitalize first letter)
            var surfaceType = reportRequest.SurfaceType.ToLower() switch
            {
                "clear" => "Clear",
                "snow" => "Snow",
                "slush" => "Slush",
                "refrozen" => "Refrozen",
                "snow-covered" => "Snow",
                _ => "Clear" // Default fallback
            };
            command.Parameters.AddWithValue("@SurfaceType", surfaceType);
            
            // Combine notes with ice quality and location
            var notesText = reportRequest.Notes ?? "";
            if (reportRequest.IceQuality != null && reportRequest.IceQuality.Any())
            {
                var qualityText = string.Join(", ", reportRequest.IceQuality);
                notesText = string.IsNullOrWhiteSpace(notesText) 
                    ? $"Conditions: {qualityText}"
                    : $"{notesText} | Conditions: {qualityText}";
            }
            if (!string.IsNullOrWhiteSpace(reportRequest.Location))
            {
                notesText = string.IsNullOrWhiteSpace(notesText)
                    ? $"Location: {reportRequest.Location}"
                    : $"{notesText} | Location: {reportRequest.Location}";
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

            _logger.LogInformation($"Report created successfully: ID={insertedId}, Lake={reportRequest.Lake}");

            // Return created report
            var report = new IceReport
            {
                Id = insertedId,
                LakeName = reportRequest.Lake,
                Thickness = reportRequest.Thickness,
                Location = reportRequest.Location,
                Latitude = reportRequest.Latitude,
                Longitude = reportRequest.Longitude,
                SurfaceType = reportRequest.SurfaceType,
                IsMeasured = reportRequest.IsMeasured,
                Method = reportRequest.Method,
                IceQuality = reportRequest.IceQuality,
                Notes = reportRequest.Notes,
                CreatedAt = createdAt ?? DateTime.UtcNow,
                IpAddress = ipAddress
            };

            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(report);
            return response;
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "SQL error creating report");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync($"Database error: {ex.Message}");
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
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(ipAddress));
        return Convert.ToBase64String(hashBytes)[..16]; // Take first 16 chars
    }

    [Function("GetNearbyReports")]
    public async Task<HttpResponseData> GetNearbyReports(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reports/nearby")] HttpRequestData req)
    {
        _logger.LogInformation("Getting nearby ice reports");

        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var nearbyRequest = JsonSerializer.Deserialize<NearbyReportsRequest>(requestBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (nearbyRequest == null)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Invalid request body");
            return badResponse;
        }

        // TODO: Query Cosmos DB with geospatial query
        // For now, return mock data
        var mockReports = new List<IceReport>
        {
            new IceReport
            {
                Id = "1",
                LakeName = "Lake Minnetonka",
                Thickness = 5.5,
                Location = "West shore",
                Latitude = 44.9237,
                Longitude = -93.5633,
                SurfaceType = "clear",
                IsMeasured = true,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            }
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(mockReports);
        return response;
    }

    [Function("GetLakeReports")]
    public async Task<HttpResponseData> GetLakeReports(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reports/lake/{lakeName}")] HttpRequestData req,
        string lakeName)
    {
        _logger.LogInformation($"Getting reports for lake: {lakeName}");

        // TODO: Query Cosmos DB by lake name
        var mockReports = new List<IceReport>
        {
            new IceReport
            {
                Id = "1",
                LakeName = lakeName,
                Thickness = 8.0,
                Location = "North shore",
                SurfaceType = "clear",
                IsMeasured = true,
                CreatedAt = DateTime.UtcNow.AddHours(-3)
            }
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(mockReports);
        return response;
    }

    [Function("DetectLakeByLocation")]
    public async Task<HttpResponseData> DetectLakeByLocation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reports/detect-lake")] HttpRequestData req)
    {
        _logger.LogInformation("Detecting lake by GPS coordinates");

        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        _logger.LogInformation($"Request body: {requestBody}");
        
        var detectRequest = JsonSerializer.Deserialize<DetectLakeRequest>(requestBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (detectRequest == null)
        {
            _logger.LogWarning("Invalid request body - failed to deserialize");
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Invalid request body");
            return badResponse;
        }

        _logger.LogInformation($"Searching for lakes near: Lat={detectRequest.Latitude}, Lng={detectRequest.Longitude}");

        try
        {
            var connectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection") 
                ?? Environment.GetEnvironmentVariable("SqlConnectionString");
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Database connection string not configured");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Database connection not configured");
                return errorResponse;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            // First, let's check what's actually in the database
            var debugSql = @"
                SELECT TOP 10
                    LakeName,
                    Latitude,
                    Longitude,
                    CreatedAt,
                    ExpiresAt
                FROM IceReports
                ORDER BY CreatedAt DESC;";
            
            await using var debugCommand = new SqlCommand(debugSql, connection);
            await using var debugReader = await debugCommand.ExecuteReaderAsync();
            
            _logger.LogInformation("=== DATABASE CONTENTS (Last 10 reports) ===");
            while (await debugReader.ReadAsync())
            {
                _logger.LogInformation($"Lake: {debugReader["LakeName"]}, Lat: {debugReader["Latitude"]}, Lng: {debugReader["Longitude"]}, Expires: {debugReader["ExpiresAt"]}");
            }
            await debugReader.CloseAsync();

            // Find lakes within ~500m radius (approximately 0.005 degrees)
            // Return all matching lakes sorted by report count and recency
            var sql = @"
                SELECT 
                    LakeName,
                    AVG(Latitude) as AvgLatitude,
                    AVG(Longitude) as AvgLongitude,
                    COUNT(*) as ReportCount,
                    MAX(CreatedAt) as LastReportDate
                FROM IceReports
                WHERE LakeName IS NOT NULL 
                    AND LakeName != ''
                    AND ExpiresAt > SYSUTCDATETIME()
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
        _logger.LogInformation("Searching lake names");

        var query = req.Query["q"] ?? "";
        
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Query must be at least 2 characters");
            return badResponse;
        }

        try
        {
            var connectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection") 
                ?? Environment.GetEnvironmentVariable("SqlConnectionString");
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
                FROM IceReports
                WHERE LakeName IS NOT NULL 
                    AND LakeName != ''
                    AND LakeName LIKE @Query
                    AND ExpiresAt > SYSUTCDATETIME()
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
}
