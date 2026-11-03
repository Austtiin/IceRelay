SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.IceReports', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.IceReports (
            ReportId UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_IceReports_ReportId DEFAULT NEWID(),
            Latitude DECIMAL(9,6) NOT NULL,
            Longitude DECIMAL(9,6) NOT NULL,
            LakeName NVARCHAR(100) NULL,
            IceThicknessIn FLOAT NOT NULL,
            MeasurementType NVARCHAR(20) NOT NULL,
            SurfaceType NVARCHAR(20) NOT NULL,
            Notes NVARCHAR(2000) NULL,
            ConfidenceScore INT NOT NULL CONSTRAINT DF_IceReports_ConfidenceScore DEFAULT 1,
            CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_IceReports_CreatedAt DEFAULT SYSUTCDATETIME(),
            ExpiresAt DATETIME2 NOT NULL,
            AnonymousSessionHash NVARCHAR(64) NULL,
            IsFlagged BIT NOT NULL CONSTRAINT DF_IceReports_IsFlagged DEFAULT 0,
            CONSTRAINT PK_IceReports PRIMARY KEY (ReportId)
        );
    END;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            (N'ReportId'), (N'Latitude'), (N'Longitude'), (N'LakeName'),
            (N'IceThicknessIn'), (N'MeasurementType'), (N'SurfaceType'), (N'Notes'),
            (N'ConfidenceScore'), (N'CreatedAt'), (N'ExpiresAt'),
            (N'AnonymousSessionHash'), (N'IsFlagged')
        ) AS required(ColumnName)
        WHERE COL_LENGTH(N'dbo.IceReports', required.ColumnName) IS NULL
    )
        THROW 50001, 'IceReports has an incompatible legacy schema. Compare DB_Schema.md before applying a reviewed migration; no data has been removed.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.IceReports')
          AND name = N'Notes' AND system_type_id = TYPE_ID(N'nvarchar')
    )
        THROW 50002, 'IceReports.Notes must use NVARCHAR. Review the existing schema before proceeding.', 1;

    IF COL_LENGTH(N'dbo.IceReports', N'Notes') <> -1
       AND COL_LENGTH(N'dbo.IceReports', N'Notes') < 4000
        ALTER TABLE dbo.IceReports ALTER COLUMN Notes NVARCHAR(2000) NULL;

    IF OBJECT_ID(N'dbo.CK_IceReports_Latitude', N'C') IS NULL
        ALTER TABLE dbo.IceReports WITH CHECK ADD CONSTRAINT CK_IceReports_Latitude CHECK (Latitude BETWEEN -90 AND 90);
    IF OBJECT_ID(N'dbo.CK_IceReports_Longitude', N'C') IS NULL
        ALTER TABLE dbo.IceReports WITH CHECK ADD CONSTRAINT CK_IceReports_Longitude CHECK (Longitude BETWEEN -180 AND 180);
    IF OBJECT_ID(N'dbo.CK_IceReports_Thickness', N'C') IS NULL
        ALTER TABLE dbo.IceReports WITH CHECK ADD CONSTRAINT CK_IceReports_Thickness CHECK (IceThicknessIn BETWEEN 0 AND 50);
    IF OBJECT_ID(N'dbo.CK_IceReports_MeasurementType', N'C') IS NULL
        ALTER TABLE dbo.IceReports WITH CHECK ADD CONSTRAINT CK_IceReports_MeasurementType CHECK (MeasurementType IN (N'Measured', N'Observed'));
    IF OBJECT_ID(N'dbo.CK_IceReports_SurfaceType', N'C') IS NULL
        ALTER TABLE dbo.IceReports WITH CHECK ADD CONSTRAINT CK_IceReports_SurfaceType CHECK (SurfaceType IN (N'Clear', N'Snow', N'Slush', N'Refrozen'));
    IF OBJECT_ID(N'dbo.CK_IceReports_Expiry', N'C') IS NULL
        ALTER TABLE dbo.IceReports WITH CHECK ADD CONSTRAINT CK_IceReports_Expiry CHECK (ExpiresAt > CreatedAt);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.IceReports') AND name = N'IX_IceReports_Location')
        CREATE INDEX IX_IceReports_Location ON dbo.IceReports (Latitude, Longitude);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.IceReports') AND name = N'IX_IceReports_CreatedAt')
        CREATE INDEX IX_IceReports_CreatedAt ON dbo.IceReports (CreatedAt DESC);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.IceReports') AND name = N'IX_IceReports_LakeName')
        CREATE INDEX IX_IceReports_LakeName ON dbo.IceReports (LakeName, CreatedAt DESC);

    IF OBJECT_ID(N'dbo.ReportFlags', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ReportFlags (
            FlagId UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ReportFlags_FlagId DEFAULT NEWID(),
            ReportId UNIQUEIDENTIFIER NOT NULL,
            Reason NVARCHAR(100) NOT NULL,
            CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ReportFlags_CreatedAt DEFAULT SYSUTCDATETIME(),
            CONSTRAINT PK_ReportFlags PRIMARY KEY (FlagId),
            CONSTRAINT FK_ReportFlags_Report FOREIGN KEY (ReportId)
                REFERENCES dbo.IceReports(ReportId) ON DELETE CASCADE
        );
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.ReportFlags') AND name = N'IX_ReportFlags_ReportId')
        CREATE INDEX IX_ReportFlags_ReportId ON dbo.ReportFlags (ReportId);

    COMMIT TRANSACTION;
    PRINT 'Ice Relay schema is ready. No seed reports have been created.';
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
