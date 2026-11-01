# Ice Relay API

.NET 10 isolated Azure Functions API for Ice Relay ice thickness reporting with Azure SQL Database.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
- Azure SQL Database

## Setup

1. **Install dependencies**:
   ```bash
   dotnet restore
   ```

2. **Configure local settings**:
   - Copy `local.settings.example.json` to the ignored `local.settings.json`
   - Set `SqlConnectionString` to your development Azure SQL database
   - Keep `AzureWebJobsStorage=UseDevelopmentStorage=true` and run Azurite locally, or use a development Storage account
   - Set `RATE_LIMIT_HASH_SECRET` to a unique random local value

3. **Check the database schema**:
   - `DB_Schema.md` at the repository root describes the intended tables and indexes.
   - There is no checked-in executable schema or migration script. Compare the live database schema against the queries in `Functions/ReportsFunction.cs` before creating or replacing production tables.

4. **Run locally**:
   ```bash
   func start
   ```
   The API will be available at `http://localhost:7071`

## API Endpoints

### Create Report
**POST** `/api/reports`

Creates a new ice thickness report.

**Required fields:**
- `latitude` (number): GPS latitude (-90 to 90)
- `longitude` (number): GPS longitude (-180 to 180)
- `thickness` (number): Ice thickness in inches (0-50)
- `surfaceType` (string): Type of ice surface (clear, snow, slush, refrozen)
- `isMeasured` (boolean): Whether the thickness was measured or estimated

**Optional fields:**
- `lake` (string): Lake name
- `location` (string): Description of specific location
- `notes` (string): Additional notes
- `iceQuality` (array): Conditions like ["Pressure cracks", "Clear ice"]
- `method` (string): Measurement method (visual, drill, auger)

**Example request:**
```json
{
  "latitude": 44.9112,
  "longitude": -93.5087,
  "thickness": 8,
  "surfaceType": "Snow",
  "isMeasured": true,
  "lake": "Lake Minnetonka",
  "notes": "Snow cover, walking only"
}
```

**Response:** `201 Created` with created report object

### Get Reports
**GET** `/api/reports`

Returns all active reports (not yet expired).

**Response:** `200 OK` with array of reports

### Get Nearby Reports
**POST** `/api/reports/nearby`

Placeholder route that currently returns hard-coded sample data. Do not rely on it for live nearby reports.

**Request body:**
```json
{
  "latitude": 44.9112,
  "longitude": -93.5087,
  "radiusKm": 25
}
```

**Response:** `200 OK` with array of reports

### Get Reports by Lake
**GET** `/api/reports/lake/{lakeName}`

Placeholder route that currently returns hard-coded sample data. Do not rely on it for live per-lake reports.

The production frontend currently uses the reports list and map-bounds endpoints instead of these routes.

**Response:** `200 OK` with array of reports

## Database Schema

See the root-level `DB_Schema.md` for the current design notes. These notes are not a migration script; production database changes should be versioned as reviewed SQL migrations before application.

**Key fields:**
- Reports and map/search queries currently retain the previous 180 days; `ExpiresAt` is set 180 days after submission.
- Anonymous session hash for rate limiting
- Geospatial indexes for location queries
- Validation constraints on thickness, lat/lng ranges

## Development

**Build:**
```bash
dotnet build
```

**Run with watch:**
```bash
func start --csharp
```

**Test with frontend:**
```bash
# Terminal 1: Start API
cd api
func start

# Terminal 2: Start frontend (in new terminal)
cd icethick
npm run dev
```

Frontend proxy automatically routes `/api/*` to `http://localhost:7071/api/*`

## Deployment

This API is deployed separately from the Azure Static Web App:

1. Push code to GitHub to validate the build, or manually dispatch the Functions workflow to deploy after confirming the host plan supports .NET 10.
2. GitHub Actions publishes the isolated Functions app to `ice-relay-func`.
3. Configure the Static Web App's build-time `NEXT_PUBLIC_API_URL` to point to the public API gateway, and configure gateway/Function App CORS for the deployed site origin. Do not expose the Function App origin as the production browser endpoint unless an equivalent gateway protects it.

The Function App must use Functions runtime v4 and the `dotnet-isolated` worker. Before deploying to Linux, verify the hosting plan supports .NET 10: Linux Consumption does not, while Flex Consumption is supported.

**Environment variables needed in production:**
- `SQLAZURECONNSTR_DefaultConnection` or `SqlConnectionString`: Azure SQL Database connection string
- `RATE_LIMIT_HASH_SECRET`: randomly generated secret used to HMAC client identifiers; store in Function App settings or Key Vault
- `AzureWebJobsStorage`: Function host/runtime storage configuration (not application queue/blob storage)
- `FUNCTIONS_WORKER_RUNTIME=dotnet-isolated`
- `FUNCTIONS_EXTENSION_VERSION=~4`
- Application Insights is not used; no `APPLICATIONINSIGHTS_CONNECTION_STRING` is required.

## Security

- Per-worker in-memory limits: 60 API requests/minute, 5 valid reports/hour, and 10/day per client identifier, plus a 100-meter duplicate-location window of 5 minutes
- Limits reset on cold starts and are not coordinated across scaled-out instances; use API Management or an equivalent gateway for production-wide throttling and request-size limits
- HTTP triggers are anonymous; route production traffic through the protected gateway and prevent direct-origin bypass where practical. CORS alone is not an access-control boundary.
- Client IP detection depends on trusted forwarding headers; restrict direct Function access and validate the gateway header chain before launch
- Input validation on all fields
- SQL injection protection via parameterized queries
- Client identifiers are HMAC-hashed with `RATE_LIMIT_HASH_SECRET`; the raw IP is not returned in report responses
- CORS configured for production domain
- Report expiry is currently 180 days; align this policy with the product's freshness requirements before extending regional coverage.
