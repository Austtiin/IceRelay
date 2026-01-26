using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;

namespace IceRelay.Api.Helpers;

public class RateLimiter
{
    private static readonly ConcurrentDictionary<string, RateLimitEntry> _requestLog = new();
    private static readonly ConcurrentDictionary<string, ReportLimitEntry> _reportLog = new();
    private static DateTime _lastCleanup = DateTime.UtcNow;

    // Rate limits
    private const int MAX_REQUESTS_PER_MINUTE = 60;  // API calls
    private const int MAX_REPORTS_PER_HOUR = 5;      // Report submissions
    private const int MAX_REPORTS_PER_DAY = 10;      // Report submissions per day

    public static bool IsRateLimited(string ipAddress, out string? errorMessage)
    {
        CleanupOldEntries();

        var clientKey = HashIpAddress(ipAddress);
        var now = DateTime.UtcNow;

        // Check request rate (general API calls)
        if (_requestLog.TryGetValue(clientKey, out var entry))
        {
            var recentRequests = entry.Timestamps.Where(t => t > now.AddMinutes(-1)).ToList();
            
            if (recentRequests.Count >= MAX_REQUESTS_PER_MINUTE)
            {
                errorMessage = "Rate limit exceeded. Please slow down your requests.";
                return true;
            }

            // Update entry
            entry.Timestamps = recentRequests;
            entry.Timestamps.Add(now);
        }
        else
        {
            _requestLog[clientKey] = new RateLimitEntry
            {
                Timestamps = new List<DateTime> { now }
            };
        }

        errorMessage = null;
        return false;
    }

    public static bool CanSubmitReport(string ipAddress, out string? errorMessage)
    {
        CleanupOldEntries();

        var clientKey = HashIpAddress(ipAddress);
        var now = DateTime.UtcNow;

        if (_reportLog.TryGetValue(clientKey, out var entry))
        {
            var reportsLastHour = entry.ReportTimestamps.Count(t => t > now.AddHours(-1));
            var reportsLastDay = entry.ReportTimestamps.Count(t => t > now.AddHours(-24));

            if (reportsLastHour >= MAX_REPORTS_PER_HOUR)
            {
                errorMessage = $"You can only submit {MAX_REPORTS_PER_HOUR} reports per hour. Please try again later.";
                return false;
            }

            if (reportsLastDay >= MAX_REPORTS_PER_DAY)
            {
                errorMessage = $"You can only submit {MAX_REPORTS_PER_DAY} reports per day. Please try again tomorrow.";
                return false;
            }

            // Update entry
            entry.ReportTimestamps = entry.ReportTimestamps.Where(t => t > now.AddHours(-24)).ToList();
            entry.ReportTimestamps.Add(now);
        }
        else
        {
            _reportLog[clientKey] = new ReportLimitEntry
            {
                ReportTimestamps = new List<DateTime> { now }
            };
        }

        errorMessage = null;
        return true;
    }

    public static bool IsRecentDuplicate(string ipAddress, double latitude, double longitude, out string? errorMessage)
    {
        var clientKey = HashIpAddress(ipAddress);
        var now = DateTime.UtcNow;

        if (_reportLog.TryGetValue(clientKey, out var entry))
        {
            // Check for duplicate report in the same location within last 5 minutes
            var recentNearby = entry.ReportLocations
                .Where(loc => loc.Timestamp > now.AddMinutes(-5))
                .Where(loc => CalculateDistance(latitude, longitude, loc.Latitude, loc.Longitude) < 0.1) // Within 100 meters
                .Any();

            if (recentNearby)
            {
                errorMessage = "You recently submitted a report at this location. Please wait at least 5 minutes before submitting another report from the same spot.";
                return true;
            }

            // Add this location
            entry.ReportLocations.Add(new ReportLocation
            {
                Latitude = latitude,
                Longitude = longitude,
                Timestamp = now
            });

            // Clean old locations
            entry.ReportLocations = entry.ReportLocations.Where(loc => loc.Timestamp > now.AddHours(-1)).ToList();
        }

        errorMessage = null;
        return false;
    }

    private static string HashIpAddress(string ipAddress)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(ipAddress + "IceRelay_Salt_2026"));
        return Convert.ToBase64String(hash);
    }

    private static void CleanupOldEntries()
    {
        // Run cleanup every 10 minutes
        if ((DateTime.UtcNow - _lastCleanup).TotalMinutes < 10)
            return;

        var cutoff = DateTime.UtcNow.AddHours(-24);

        // Clean request log
        foreach (var kvp in _requestLog.Where(x => x.Value.Timestamps.All(t => t < cutoff)))
        {
            _requestLog.TryRemove(kvp.Key, out _);
        }

        // Clean report log
        foreach (var kvp in _reportLog.Where(x => x.Value.ReportTimestamps.All(t => t < cutoff)))
        {
            _reportLog.TryRemove(kvp.Key, out _);
        }

        _lastCleanup = DateTime.UtcNow;
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // Earth's radius in kilometers
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
}

public class RateLimitEntry
{
    public List<DateTime> Timestamps { get; set; } = new();
}

public class ReportLimitEntry
{
    public List<DateTime> ReportTimestamps { get; set; } = new();
    public List<ReportLocation> ReportLocations { get; set; } = new();
}

public class ReportLocation
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime Timestamp { get; set; }
}
