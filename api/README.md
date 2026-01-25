# Ice Relay API

.NET 8 Azure Functions API for Ice Relay ice thickness reporting with Azure SQL Database.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local)
- Azure SQL Database

## Setup

1. **Install dependencies**:
   ```bash
   dotnet restore
   ```

2. **Configure database connection**:
   - Update `local.settings.json` with your SQL connection string
   - The `SqlConnectionString` should point to your Azure SQL Database

3. **Create database table**:
   - Connect to your Azure SQL Database
   - Run the SQL script in `database-schema.sql` to create the `IceReports` table

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

Gets reports within a radius of a location.

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

Gets all reports for a specific lake.

**Response:** `200 OK` with array of reports

## Database Schema

See `database-schema.sql` for the complete schema.

**Key fields:**
- Reports expire after 24 hours (`ExpiresAt` field)
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

This API is designed to be deployed as part of an Azure Static Web App:

1. Push code to GitHub
2. Azure Static Web Apps automatically deploys the Functions
3. The `/api/*` routes are automatically routed to the Functions backend

**Environment variables needed in production:**
- `SqlConnectionString`: Azure SQL Database connection string

## Security

- Rate limiting by IP address (via `AnonymousSessionHash`)
- Input validation on all fields
- SQL injection protection via parameterized queries
- CORS configured for production domain
- Reports automatically expire after 24 hours
