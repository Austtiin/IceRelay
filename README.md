# Ice Relay

Ice Relay is a community-reporting project for lake ice observations in the Upper Midwest. Reports are submitted by users and are unverified; they do not determine whether ice is safe.

## What is in this repository

- `icethick/` — Next.js 16 frontend, configured for static export to Azure Static Web Apps
- `api/` — .NET 10 isolated Azure Functions API backed by Azure SQL
- `DB_Schema.md` — current database schema notes
- `DEPLOYMENT.md` — deployment configuration and release steps

The map includes shortcuts for Minnesota, Wisconsin, Michigan, Iowa, North Dakota, and South Dakota. These shortcuts only move the map; report coverage depends on community submissions.

## Local development

Requirements: Node.js 24 LTS, .NET 10 SDK, and Azure Functions Core Tools v4.

```powershell
cd icethick
npm ci
```

Local config templates are provided at `icethick/.env.example` and `api/local.settings.example.json`. The ignored `icethick/.env.local` and `api/local.settings.json` are pre-created with local URLs and blank credential placeholders. Add a Mapbox token to render the map, a development SQL connection string to use database-backed API routes, and start Azurite (or set a development Storage connection) for the Functions host. Analytics IDs are blank locally by default to avoid recording development activity.

Start the frontend with `npm run dev`. In a second terminal, run `func start` from `api/`. Alternatively, run `npm run dev:all` from `icethick/`.

To check the frontend:

```powershell
cd icethick
npm run lint
npm run build
```

## Deployment

The frontend GitHub Actions workflow builds and publishes `icethick/out` to Azure Static Web Apps. The Functions workflow deploys `api/` to the `ice-relay-func` Function App. Both use GitHub Actions secrets; see [DEPLOYMENT.md](./DEPLOYMENT.md).

## API status

The frontend currently uses report submission, lake-name search, map-bounds queries, and lake detection. The nearby-report and per-lake report endpoints are placeholders and currently return mock data; do not use them as a source of real conditions.

Lake search and map data are limited to reports from the previous 180 days. Report expiry and retention are an area to align before increasing coverage or redeploying.

## Safety

Ice conditions vary within a single body of water and change with weather, ice quality, currents, and other local factors. Ice Relay reports are signals from the community, not verified safety guidance. Follow the relevant state agency's current advice, check conditions yourself, and stay off the ice when uncertain.
