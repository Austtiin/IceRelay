DB Scheme


IceReports (CORE TABLE)
CREATE TABLE IceReports (
    ReportId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,

    LakeName NVARCHAR(100) NULL,

    IceThicknessIn FLOAT NOT NULL,

    MeasurementType NVARCHAR(20) NOT NULL
        CHECK (MeasurementType IN ('Measured', 'Observed')),

    SurfaceType NVARCHAR(20) NOT NULL
        CHECK (SurfaceType IN ('Clear', 'Snow', 'Slush', 'Refrozen')),

    Notes NVARCHAR(500) NULL,

    ConfidenceScore INT NOT NULL DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ExpiresAt DATETIME2 NOT NULL,

    AnonymousSessionHash NVARCHAR(64) NULL,

    IsFlagged BIT NOT NULL DEFAULT 0,

    CONSTRAINT PK_IceReports PRIMARY KEY (ReportId)
);





Indexes on IceReports
CREATE INDEX IX_IceReports_Location
ON IceReports (Latitude, Longitude);

CREATE INDEX IX_IceReports_CreatedAt
ON IceReports (CreatedAt DESC);

CREATE INDEX IX_IceReports_LakeName
ON IceReports (LakeName);



ReportFlags (Optional but Included)

CREATE TABLE ReportFlags (
    FlagId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    ReportId UNIQUEIDENTIFIER NOT NULL,
    Reason NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_ReportFlags PRIMARY KEY (FlagId),
    CONSTRAINT FK_ReportFlags_Report
        FOREIGN KEY (ReportId) REFERENCES IceReports(ReportId)
        ON DELETE CASCADE
);



Relationships (Very Simple)
IceReports (1) ──── (many) ReportFlags