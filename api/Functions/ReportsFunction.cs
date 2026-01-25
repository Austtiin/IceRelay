using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using IceRelay.Api.Models;

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

        // TODO: Query from Cosmos DB
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
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                IceQuality = new List<string> { "Foot traffic only" }
            },
            new IceReport
            {
                Id = "2",
                LakeName = "White Bear Lake",
                Thickness = 11,
                Location = "East bay",
                Latitude = 45.0847,
                Longitude = -93.0166,
                SurfaceType = "snow-covered",
                IsMeasured = true,
                CreatedAt = DateTime.UtcNow.AddHours(-5)
            }
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(mockReports);
        return response;
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

        // Validate thickness
        if (reportRequest.Thickness < 0 || reportRequest.Thickness > 50)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Thickness must be between 0 and 50 inches");
            return badResponse;
        }

        // Create report
        var report = new IceReport
        {
            Id = Guid.NewGuid().ToString(),
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
            CreatedAt = DateTime.UtcNow,
            IpAddress = req.Headers.TryGetValues("X-Forwarded-For", out var values) 
                ? values.FirstOrDefault() 
                : "unknown"
        };

        // TODO: Save to Cosmos DB
        _logger.LogInformation($"Report created: {report.Id} for {report.LakeName}");

        var response = req.CreateResponse(HttpStatusCode.Created);
        await response.WriteAsJsonAsync(report);
        return response;
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
}
