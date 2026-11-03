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
   - Run `sql\001-initialize.sql` against the intended database before deploying this API.
   - The script creates tables/indexes, widens legacy notes storage without deleting reports, and stops on incompatible data/schema.
   - See `DB_Schema.md` at the repository root for every column and the `sqlcmd` command.

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
- `lake` (string): Lake name, at most 100 characters

**Optional fields:**
- `isMeasured` (boolean): Contributor's measurement claim; defaults to false at the API boundary. The browser requires a measured, positive thickness.
- `location` (string): Description of specific location, at most 200 characters
- `notes` (string): Additional notes, at most 500 characters
- `iceQuality` (array): Up to ten condition labels, each at most 50 characters
- `method` (string): Accepted for client compatibility, but not persisted separately

**Example request:**
```json
{
  "latitude": 44.9112,
  "longitude": -93.5087,
  "thickness": 8,
  "surfaceType": "Snow",
  "isMeasured": true,
  "lake": "Lake Minnetonka",
  "notes": "Snow cover near the north access"
}
```

**Response:** `201 Created` with created report object

### Get Reports
**GET** `/api/reports`

Returns the six newest unflagged, unexpired reports from the previous 180 days.

**Response:** `200 OK` with array of reports

### Get Nearby Reports
**POST** `/api/reports/nearby`

Returns up to 100 real database reports within the requested great-circle radius,
nearest first. Coordinates must be finite and in range; radius must be greater
than zero and at most 500 km. Excludes expired, flagged, and older-than-180-day rows.

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

Returns up to 100 real, unflagged, unexpired reports for the exact lake name,
newest first, within the previous 180 days. Empty results do not establish
anything about a lake's conditions.

The production frontend currently uses the reports list and map-bounds endpoints instead of these routes.

**Response:** `200 OK` with array of reports

## Database Schema

### Managed identity authentication

SqlClient 7 requires `Microsoft.Data.SqlClient.Extensions.Azure` for Entra
authentication modes in connection strings. Keep this package reference when
updating dependencies; the core SqlClient package alone cannot provide managed
identity authentication.

For an Azure-hosted Function App with system-assigned identity enabled, use:

```text
Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<database>;Authentication=Active Directory Managed Identity;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

No client ID or password is required for system-assigned identity. An Entra
administrator must create the matching external database user and grant
`SELECT, INSERT` on `dbo.IceReports`; SQL network access is also required.
After adding/updating the authentication package, redeploy the API, not just
the frontend or its settings.

See root-level `DB_Schema.md` and the executable `sql\001-initialize.sql`.
Back up and inspect an existing database before applying it.

**Key fields:**
- Public queries show at most the previous 180 days; `ExpiresAt` is set 180 days after submission. This hides reports, not deletes them.
- Anonymous HMAC client identifier, never the raw IP
- Ordinary latitude/longitude, recency, and lake-name indexes
- Validation constraints on thickness, coordinates, surface/measurement type, and expiry
- Combined notes storage is 2000 characters; public responses split notes, location, and condition labels

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

Set the frontend's ignored `.env.local` API base to `http://localhost:7071/api`
and configure local Functions CORS for `http://localhost:3000`. There is no
automatic Next.js development API proxy.

## Deployment

This API is deployed separately from the Azure Static Web App:

1. Confirm the target plan supports .NET 10 and run the SQL migration first.
2. The `main_relay-func.yml` workflow publishes the isolated Functions app to `relay-func` on pushes to `main` or manual dispatch.
3. Configure the Static Web App's build-time `NEXT_PUBLIC_API_URL` to point to the public API gateway, and configure gateway/Function App CORS for the deployed site origin. Do not expose the Function App origin as the production browser endpoint unless an equivalent gateway protects it.

The Function App must use Functions runtime v4 and the `dotnet-isolated` worker. Before deploying to Linux, verify the hosting plan supports .NET 10: Linux Consumption does not, while Flex Consumption is supported.

**Environment variables needed in production:**
- `SQLAZURECONNSTR_DefaultConnection` or `SqlConnectionString`: Azure SQL Database connection string
- `RATE_LIMIT_HASH_SECRET`: randomly generated secret used to HMAC client identifiers; store in Function App settings or Key Vault
- `AzureWebJobsStorage`: Function host/runtime storage configuration (not application queue/blob storage)
- `FUNCTIONS_WORKER_RUNTIME=dotnet-isolated`
- `FUNCTIONS_EXTENSION_VERSION=~4`
- `FUNCTIONS_REQUEST_BODY_SIZE_LIMIT=32768`: host-level 32 KiB hard cap; application JSON readers enforce 16 KiB. Use a gateway limit of 16 KiB for consistent 413 responses before Functions binding (oversized binding errors can have a host-specific error status).
- Application Insights is not used; no `APPLICATIONINSIGHTS_CONNECTION_STRING` is required.

Copy `azure.settings.example.json` to the ignored `azure.settings.local.json`,
replace **every** `YOUR-VAULT` URI with an existing secret reference, and apply:

```powershell
az functionapp config appsettings set --subscription "<subscription-id>" --resource-group "<resource-group>" --name "relay-func" --settings "@api\azure.settings.local.json" --output none
```

Run that command from the repository root after authenticating Azure CLI. The
example is a template, not live configuration. Key Vault references require the
Function App's managed identity to have permission to read the referenced secrets
and network access to the vault. Store the encrypted SQL connection string,
host storage connection, and at least 32 random bytes (Base64-encoded) for the
HMAC secret in the vault. Never commit real values or use placeholders in a live app.
`SQLAZURECONNSTR_DefaultConnection` takes precedence over `SqlConnectionString`;
configure one SQL source, or ensure the preferred one is updated.

## Security

- Per-worker in-memory limits: 60 API requests/minute, 5 valid reports/hour, and 10/day per client identifier, plus a 100-meter duplicate-location window of 5 minutes
- Limits reset on cold starts and are not coordinated across scaled-out instances; use API Management or an equivalent gateway for production-wide throttling and request-size limits
- HTTP triggers are anonymous; route production traffic through the protected gateway and prevent direct-origin bypass where practical. CORS alone is not an access-control boundary.
- Client IP detection depends on trusted forwarding headers; restrict direct Function access and validate the gateway header chain before launch
- Input validation on all fields
- SQL injection protection via parameterized queries
- Client identifiers are HMAC-hashed with `RATE_LIMIT_HASH_SECRET`; the raw IP is not returned in report responses
- Configure CORS for the intended production domain; this repository does not verify live CORS settings
- Report expiry is currently 180 days; align this policy with the product's freshness requirements before extending regional coverage.
- Application-generated HTTP responses carry `nosniff`, `Cache-Control: no-store`,
  and `X-Robots-Tag: noindex, nofollow`. Configure equivalent behavior on the
  gateway for host-generated errors. Static Web App global headers do not
  automatically secure API responses.
- Malformed JSON and oversized application payloads have explicit error responses;
  database details are logged server-side rather than exposed in creation errors.
