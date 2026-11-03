# Ice Relay SQL setup

Run [api/sql/001-initialize.sql](api/sql/001-initialize.sql) in your **existing target
Azure SQL database** before deploying the updated API. It creates the two tables and
indexes if absent. It is repeat-safe, transactional, and contains no seed reports.
It does not create a SQL server, database, credentials, firewall rules, or backups.

From the repository root, using `sqlcmd` and a Microsoft Entra identity authorized
to create/alter tables:

```powershell
sqlcmd -S "tcp:<server-name>.database.windows.net,1433" -d "<database-name>" -G -b -i ".\api\sql\001-initialize.sql"
```

Alternatively, open the SQL file in the Azure SQL query editor and run its complete
contents against the intended database. Use a separate administrative identity for
schema setup; the application should not be a database owner.

## `dbo.IceReports`

| Column | SQL type | Required/default | Purpose |
| --- | --- | --- | --- |
| `ReportId` | `UNIQUEIDENTIFIER` | Not null, `NEWID()`, primary key | Stable report identifier |
| `Latitude` | `DECIMAL(9,6)` | Not null, -90 through 90 | Reported latitude |
| `Longitude` | `DECIMAL(9,6)` | Not null, -180 through 180 | Reported longitude |
| `LakeName` | `NVARCHAR(100)` | Nullable for legacy records | Lake name; the submission API requires it |
| `IceThicknessIn` | `FLOAT` | Not null, 0 through 50 | Thickness in inches; the current browser form requires a positive measurement |
| `MeasurementType` | `NVARCHAR(20)` | Not null, `Measured` or `Observed` | Contributor's measurement claim, not independent verification |
| `SurfaceType` | `NVARCHAR(20)` | Not null, `Clear`, `Snow`, `Slush`, or `Refrozen` | Reported surface; browser `snow-covered` maps to `Snow` |
| `Notes` | `NVARCHAR(2000)` | Nullable | Notes plus encoded location and condition labels |
| `ConfidenceScore` | `INT` | Not null, default 1 | Legacy field; not calculated or shown as a safety score |
| `CreatedAt` | `DATETIME2` | Not null, `SYSUTCDATETIME()` | UTC submission time |
| `ExpiresAt` | `DATETIME2` | Not null, greater than `CreatedAt` | API sets submission time plus 180 days |
| `AnonymousSessionHash` | `NVARCHAR(64)` | Nullable | HMAC client identifier; no raw IP stored here |
| `IsFlagged` | `BIT` | Not null, default 0 | Administrative exclusion from public queries |

Indexes cover `(Latitude, Longitude)`, descending `CreatedAt`, and
`(LakeName, CreatedAt DESC)` for new databases. An existing same-named lake index
is preserved rather than rebuilt automatically. These are ordinary indexes,
not SQL spatial indexes or a comprehensive lake catalog.

### Notes compatibility

The API preserves its existing encoding:

```text
Firsthand notes | Conditions: Thin ice, Pressure cracks | Location: North access
```

It returns the separate `Notes`, `IceQuality`, and `Location` properties to the
frontend. Notes are limited to 500 user-entered characters, location to 200,
and conditions to ten entries of at most 50 characters. The old `NVARCHAR(500)`
column could truncate the combined payload. The setup widens a smaller existing
NVARCHAR notes field to 2000 characters, without shrinking a larger/MAX field or
rewriting existing reports. No new condition/nearby-report tables are necessary.
The exact measurement method is not stored separately in the current schema.

### Existing databases

Take a backup and inspect the target first. The script checks for required legacy
columns and validates existing rows when adding constraints. It stops and rolls
back on incompatible/missing columns or data that fails a new constraint; it does
not delete data or invent values to force the migration through. Review such
differences manually. The script is not a universal repair for arbitrary schemas.

## `dbo.ReportFlags`

| Column | SQL type | Required/default |
| --- | --- | --- |
| `FlagId` | `UNIQUEIDENTIFIER` | Not null, `NEWID()`, primary key |
| `ReportId` | `UNIQUEIDENTIFIER` | Not null, foreign key to `IceReports.ReportId` |
| `Reason` | `NVARCHAR(100)` | Not null |
| `CreatedAt` | `DATETIME2` | Not null, `SYSUTCDATETIME()` |

The foreign key deletes related flags if an administrator deletes a report.
`ReportId` is indexed. This table is reserved for administrative/future moderation
work; **there is no public flag-submission endpoint**. The map links to the contact
page instead of promising an unimplemented flag feature.

## Runtime permissions and visibility

The API needs `SELECT` and `INSERT` on `dbo.IceReports`. Once a database user/login
has been provisioned, an administrator can grant only those permissions:

```sql
GRANT SELECT, INSERT ON OBJECT::dbo.IceReports TO [your-existing-api-database-user];
```

Keep moderation and schema-change permissions separate. Provision the chosen SQL
authentication method, network access, and backups outside this script.

All public report/search/detection queries exclude flagged rows, expired rows,
and reports older than 180 days. The homepage returns at most six observations;
map bounds, nearby, and per-lake endpoints return at most 100. Nearby queries use
great-circle distance and accept a radius greater than zero and at most 500 km.
Empty results are real empty results, not sample data.

Expiry hides a report; it does not delete it. No automated retention/deletion job
is implemented. Review storage retention and the published privacy policy before
launch; a visible 180-day observation is not evidence of current ice conditions.
