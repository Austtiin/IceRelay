using System.Security.Cryptography;
using System.Text;

namespace IceRelay.Api.Helpers;

public static class RateLimiter
{
    private static readonly object SyncRoot = new();
    private static readonly Dictionary<string, RateLimitEntry> RequestLog = new();
    private static readonly Dictionary<string, ReportLimitEntry> ReportLog = new();
    private static DateTime _lastCleanup = DateTime.UtcNow;

    private const int MaxRequestsPerMinute = 60;
    private const int MaxReportsPerHour = 5;
    private const int MaxReportsPerDay = 10;

    public static bool IsRateLimited(string ipAddress, out string? errorMessage)
    {
        lock (SyncRoot)
        {
            var now = DateTime.UtcNow;
            CleanupOldEntries(now);

            var clientKey = HashIpAddress(ipAddress);
            if (!RequestLog.TryGetValue(clientKey, out var entry))
            {
                entry = new RateLimitEntry();
                RequestLog[clientKey] = entry;
            }

            entry.Timestamps = entry.Timestamps.Where(t => t > now.AddMinutes(-1)).ToList();
            if (entry.Timestamps.Count >= MaxRequestsPerMinute)
            {
                errorMessage = "Rate limit exceeded. Please slow down your requests.";
                return true;
            }

            entry.Timestamps.Add(now);
            errorMessage = null;
            return false;
        }
    }

    public static bool CanSubmitReport(string ipAddress, out string? errorMessage)
    {
        lock (SyncRoot)
        {
            var now = DateTime.UtcNow;
            CleanupOldEntries(now);

            var clientKey = HashIpAddress(ipAddress);
            if (!ReportLog.TryGetValue(clientKey, out var entry))
            {
                entry = new ReportLimitEntry();
                ReportLog[clientKey] = entry;
            }

            entry.ReportTimestamps = entry.ReportTimestamps.Where(t => t > now.AddHours(-24)).ToList();
            var reportsLastHour = entry.ReportTimestamps.Count(t => t > now.AddHours(-1));
            if (reportsLastHour >= MaxReportsPerHour)
            {
                errorMessage = $"You can only submit {MaxReportsPerHour} reports per hour. Please try again later.";
                return false;
            }

            if (entry.ReportTimestamps.Count >= MaxReportsPerDay)
            {
                errorMessage = $"You can only submit {MaxReportsPerDay} reports per day. Please try again tomorrow.";
                return false;
            }

            entry.ReportTimestamps.Add(now);
            errorMessage = null;
            return true;
        }
    }

    public static bool IsRecentDuplicate(string ipAddress, double latitude, double longitude, out string? errorMessage)
    {
        lock (SyncRoot)
        {
            var clientKey = HashIpAddress(ipAddress);
            var now = DateTime.UtcNow;
            if (ReportLog.TryGetValue(clientKey, out var entry))
            {
                entry.ReportLocations = entry.ReportLocations
                    .Where(location => location.Timestamp > now.AddHours(-1))
                    .ToList();

                var recentNearby = entry.ReportLocations.Any(location =>
                    location.Timestamp > now.AddMinutes(-5) &&
                    CalculateDistance(latitude, longitude, location.Latitude, location.Longitude) < 0.1);

                if (recentNearby)
                {
                    errorMessage = "You recently submitted a report at this location. Please wait at least 5 minutes before submitting another report from the same spot.";
                    return true;
                }

                entry.ReportLocations.Add(new ReportLocation
                {
                    Latitude = latitude,
                    Longitude = longitude,
                    Timestamp = now
                });
            }

            errorMessage = null;
            return false;
        }
    }

    public static string HashClientIdentifier(string clientIdentifier) => HashIpAddress(clientIdentifier);

    private static string HashIpAddress(string ipAddress)
    {
        var secret = Environment.GetEnvironmentVariable("RATE_LIMIT_HASH_SECRET");
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("RATE_LIMIT_HASH_SECRET is not configured.");
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(ipAddress));
        return Convert.ToBase64String(hash);
    }

    private static void CleanupOldEntries(DateTime now)
    {
        if ((now - _lastCleanup).TotalMinutes < 10)
        {
            return;
        }

        var cutoff = now.AddHours(-24);
        foreach (var key in RequestLog
            .Where(item => item.Value.Timestamps.All(timestamp => timestamp < cutoff))
            .Select(item => item.Key)
            .ToArray())
        {
            RequestLog.Remove(key);
        }

        foreach (var key in ReportLog
            .Where(item =>
                item.Value.ReportTimestamps.All(timestamp => timestamp < cutoff) &&
                item.Value.ReportLocations.All(location => location.Timestamp < cutoff))
            .Select(item => item.Key)
            .ToArray())
        {
            ReportLog.Remove(key);
        }

        _lastCleanup = now;
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371;
        var latitudeDelta = (lat2 - lat1) * Math.PI / 180;
        var longitudeDelta = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(latitudeDelta / 2) * Math.Sin(latitudeDelta / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(longitudeDelta / 2) * Math.Sin(longitudeDelta / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return earthRadiusKm * c;
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
