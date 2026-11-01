# Ice Relay Web App

The Ice Relay frontend is a Next.js static export deployed to Azure Static Web Apps. It displays community-submitted ice thickness reports and links to official safety guidance; a report is not a safety assessment.

## Features

- Recent community reports and an interactive Mapbox map
- Lake-name search backed by the reports API
- State map shortcuts for Minnesota, Wisconsin, Michigan, Iowa, North Dakota, and South Dakota
- GPS-based report submission with no account required
- Official safety resources and a safety guide

State shortcuts only change the map view. The amount and recency of reports varies by location.

## Local Development

Requirements: Node.js 24 LTS, .NET 10 SDK, and Azure Functions Core Tools v4.

Next.js 16's default browser targets include Chrome/Edge 111+, Firefox 111+, and Safari 16.4+ (including iOS Safari).

```powershell
npm ci
npm run dev
```

In another terminal, run the API:

```powershell
cd ..\api
func start
```

Or run both processes from this directory with `npm run dev:all`.

Create `.env.local` in this directory with build-time settings:

```text
NEXT_PUBLIC_API_URL=http://localhost:7071/api
NEXT_PUBLIC_MAPBOX_TOKEN=<your Mapbox public token>
```

The API also needs a local Functions setting named `SqlConnectionString`. Do not commit credentials.

## Build and Deployment

```powershell
npm run lint
npm run build
```

The static export is written to `out/`. GitHub Actions builds and deploys this directory to Azure Static Web Apps. The .NET 10 isolated Functions API is deployed separately; see the repository-level [deployment guide](../DEPLOYMENT.md).

`NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAPBOX_TOKEN` must be available as GitHub Actions secrets during the frontend build because they are embedded in the static site.

## Data and Safety Notes

- Lake search suggestions are derived from reports currently in the API database; a lake without reports may not appear in search.
- The map and search API currently limit report data to the previous 180 days.
- Nearby-report and lake-detail API routes still return placeholder data; the current UI uses lake search and map-bounds queries instead.
- Ice thickness and surface observations are unverified, location-specific, and may become outdated quickly. Consult the responsible state agency and use your own judgment. Never treat a report as permission to go onto the ice.
