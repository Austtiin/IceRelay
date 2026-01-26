namespace IceRelay.Api.Models;

public class IceReport
{
    public string? Id { get; set; }
    public string? LakeName { get; set; }
    public double Thickness { get; set; }
    public string? Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? SurfaceType { get; set; }
    public bool IsMeasured { get; set; }
    public string? Method { get; set; }
    public List<string>? IceQuality { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? IpAddress { get; set; }
    public int ReportCount { get; set; } = 1;
}

public class CreateReportRequest
{
    public string? Lake { get; set; }
    public double Thickness { get; set; }
    public string? Location { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string SurfaceType { get; set; } = "clear";
    public bool IsMeasured { get; set; }
    public string Method { get; set; } = "visual";
    public List<string>? IceQuality { get; set; }
    public string? Notes { get; set; }
    public bool UseGPS { get; set; }
}

public class NearbyReportsRequest
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RadiusKm { get; set; } = 50;
}

public class LakeReportsRequest
{
    public string LakeName { get; set; } = "";
}

public class LakeSuggestion
{
    public string? LakeName { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int ReportCount { get; set; }
    public double DistanceKm { get; set; }
    public DateTime? LastReportDate { get; set; }
}

public class DetectLakeRequest
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
