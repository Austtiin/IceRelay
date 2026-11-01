# Deployment

Ice Relay deploys as two separate services:

- The Next.js static export in `icethick/out/` is published to Azure Static Web Apps.
- The .NET 10 isolated Functions API in `api/` is published to the `ice-relay-func` Azure Function App.

## What must be ready

The repository defines the architecture below. This is not a verified inventory of live Azure resources; the production subscription, resource group, SQL server/database names, Storage account, and Function hosting plan have not been confirmed.

| Component | Required? | Purpose and launch requirements |
| --- | --- | --- |
| Azure subscription, resource group, and region | Yes | Choose the production subscription explicitly, group the app resources, select compatible regions, and configure owner access plus cost budgets/alerts. No subscription was selected during this refresh. |
| Azure Static Web App | Yes | Hosts the exported HTML, JavaScript, CSS, and images. Configure its deployment token, custom domain, TLS, and build-time public environment variables. There is no production Next.js/Node server or SWA-managed API in this architecture. |
| Azure Function App and hosting plan | Yes | Hosts the separate .NET 10 isolated HTTP API. Verify .NET 10 support, configure SQL and host storage, set CORS, and deploy the published Functions output. Use a supported plan such as Flex Consumption; do not assume the existing plan is compatible. |
| Azure SQL logical server and database | Yes | The logical server supplies the database endpoint/access configuration; the database stores `IceReports`. This is a managed service, not a SQL Server VM. Record the server hostname and database name, configure least-privilege access/network connectivity, verify backups, and verify tables, columns, and indexes before applying a reviewed migration. |
| Azure Storage account | Yes, for Functions | Provides host/runtime storage. Flex Consumption also needs its deployment storage configuration. No application-level image uploads, blob persistence, or queue processing are implemented; do not add an application queue just for this app. |
| Protected API gateway | Production launch gate | API Management or an equivalent protects the public API with shared throttling, request-size controls, monitoring, and origin restrictions. Ensure callers cannot bypass it through the anonymous Function origin. |
| Mapbox account and public token | Yes, for maps | Configure a public browser `pk.` token with the permissions required by the map style, URL restrictions, and usage/billing limits. No secret `sk.` token belongs in the browser. |
| Application Insights | Not used | No Application Insights connection string is required for the selected setup. |
| DNS and domain ownership | Yes | Attach `icerelay.net` to SWA, validate ownership, verify HTTPS, and decide on redirects from `www` and the previous domain. DNS records alone do not redirect requests. |
| GA4 and Microsoft Clarity | Optional | Supply public measurement/project IDs at frontend build time. Keep consent gating; configure Clarity masking/privacy and avoid sending user-submitted sensitive information to analytics. |
| Key Vault / managed identities | Recommended hardening | Store backend secrets or use supported identity-based connections. Never embed SQL, Storage, or HMAC credentials in `NEXT_PUBLIC_*`. |
| GitHub deployment credentials | Yes, for CI/CD | Configure the SWA deployment token and Function deployment identity/OIDC secrets and federated credential. Review workflow permissions before deployment. |
| Support email and privacy/legal pages | Yes, for launch | Verify the published support address works and that policies accurately describe data retention, analytics, and community-report limitations. |

You do **not** currently need a SQL Server VM, Cosmos DB, Service Bus, Redis, Kubernetes, or an application Storage queue. The code uses SQL directly for reports and lake queries. Maps use Mapbox; lake search/detection currently derives suggestions from submitted reports, not a comprehensive external lake catalog.

### Local development status

The API base is `http://localhost:7071/api`, but the last inspection found no API listener on 7071 or Azurite listeners on 10000-10002. The local SQL connection, GA ID, and Clarity ID are blank. The public Mapbox token supplied in the frontend example was moved into ignored `.env.local`; its account permissions and URL restrictions still need verification. Consequently, the website shell can run, but database-backed reports are not configured end-to-end.

To run the complete local setup:

1. Use Node 24, the .NET 10 SDK, Azure Functions Core Tools v4, and Azurite.
2. Set your development SQL connection in ignored `api\local.settings.json`. Keep `AzureWebJobsStorage=UseDevelopmentStorage=true` when using Azurite.
3. Start Azurite (for example through its VS Code extension), then run `func start` from `api`.
4. Set `NEXT_PUBLIC_MAPBOX_TOKEN=pk.<your-public-token>` in ignored `icethick\.env.local`; retain the local site/API URLs. Restrict the token to the development origin and configured production origins.
5. Run `npm run dev` from `icethick`. Restart it after environment-variable changes. `npm run dev:all` starts the frontend and Functions together, but does not start Azurite or provision SQL.
6. Verify lake search, map bounds, and a report submission against the development database. A missing token now shows a clear unavailable state with a lake-search link; it does not provide a working substitute map.

### Fixing the Mapbox configuration warning

Create or copy a **public** token in your Mapbox account. Put it in local `.env.local` for development and in the repository secret `NEXT_PUBLIC_MAPBOX_TOKEN` for deployment. A SWA runtime application setting alone cannot update this static frontend: rerun the frontend build/deployment after setting the secret. The workflow rejects a missing/non-public token before deployment.

The homepage photo is served from `icethick\public\HomeHero.jpg`; it does not need Blob Storage or Mapbox. The site uses the Segoe UI system-font stack with platform fallbacks, without distributing proprietary font files.

## Frontend

Map links retain Next.js production route prefetching. Hover, keyboard focus, or touch additionally request `/map/` prefetching and add one anonymous Mapbox API preconnection when a token is configured. This warms route/network setup without initializing a hidden map or issuing speculative report queries. Mapbox tiles and live bounds reports still load when the map opens, preserving location-specific data and avoiding unnecessary API traffic. Measure production navigation performance separately; development rendering is not a production-prefetch benchmark.

### Using `/api` on the Static Web App domain

Yes, the frontend can use `NEXT_PUBLIC_API_URL=/api` when the existing Function App is explicitly **linked as the Static Web App's backend**. Bring-your-own Functions integration requires the **SWA Standard plan**. The Function App remains a separately deployed resource with its own SQL and Storage settings; SWA proxies `/api/*` requests to it.

In Azure Portal, open the Static Web App's **APIs** settings and verify the production environment is linked to the intended Function App. The remaining Functions workflow targets `relay-func`. The repository's `api_location: ""` does not establish this link, and an `/api/*` route rule alone does not create a proxy. The user reports the production backend is linked; the live link has not been independently verified. Bring-your-own backend integration is not available for pull-request preview environments, so those need an appropriate API endpoint separately.

The frontend workflow defaults `NEXT_PUBLIC_API_URL` to `/api` when its repository secret is unset or empty. No API URL secret is required for the linked production backend. Set the secret only to override this default with a separate endpoint ending in `/api`, then rebuild. Keep `http://localhost:7071/api` in local development unless using a configured local SWA proxy. A linked backend is an alternative to a separate browser-facing API URL, not a substitute for throttling, request-size controls, or direct-origin protection.

See [Microsoft's bring-your-own Functions instructions](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own).

### Where each environment value belongs

The homepage privacy banner offers **Essential only** (optional analytics off) and **Accept all** (configured GA4/Clarity on). It links to Terms of Use, Privacy Policy, and Cookie Policy. Existing accepted/declined choices remain valid; clearing site storage makes the banner appear again.

| Setting | Ignored local file | Production destination |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `icethick\.env.local`: `http://localhost:3000` | GitHub frontend build secret: `https://icerelay.net` |
| `NEXT_PUBLIC_API_URL` | `icethick\.env.local`: `http://localhost:7071/api` | Defaults to `/api` for the linked backend; optional GitHub build secret overrides it |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `icethick\.env.local`: public `pk.` token | GitHub frontend build secret; restrict allowed origins |
| GA4 / Clarity public IDs | `icethick\.env.local`, blank unless testing analytics | GitHub frontend build secrets, optional |
| `AzureWebJobsStorage` | `api\local.settings.json`: `UseDevelopmentStorage=true` with Azurite | Function App setting: Storage connection string or supported identity configuration |
| `SqlConnectionString` | `api\local.settings.json`: development database connection | Function App setting, or `DefaultConnection` in Connection strings with SQLAzure type (exposed as `SQLAZURECONNSTR_DefaultConnection`) |
| `RATE_LIMIT_HASH_SECRET` | `api\local.settings.json`: unique local secret | Function App secret/Key Vault reference; use at least 32 random bytes |
| CORS | `Host.CORS` in `api\local.settings.json`: `http://localhost:3000` | Configure the gateway and Function App allowed origins; this is not a public frontend secret |

For connection-string-based Storage configuration, the production `AzureWebJobsStorage` format is:

```text
DefaultEndpointsProtocol=https;AccountName=<storage-account-name>;AccountKey=<private-account-key>;EndpointSuffix=core.windows.net
```

Its Blob service base is normally `https://<storage-account-name>.blob.core.windows.net`, but **there is no application setting or browser Storage base URL to add**: this app uses Storage for Functions infrastructure, not frontend file uploads. For Flex Consumption, separately configure the platform's deployment storage; do not assume `AzureWebJobsStorage` replaces that configuration.

A SQL connection-string format is:

```text
Server=tcp:<sql-server-name>.database.windows.net,1433;Initial Catalog=<database-name>;User ID=<database-user>;Password=<private-password>;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

Use actual values only in ignored local settings or protected backend configuration. Do not paste either private connection string into `.env.example`, `NEXT_PUBLIC_*`, GitHub source files, or SWA frontend settings. The checked-in examples deliberately contain no real backend credentials.

SWA **runtime application settings do not configure this exported frontend**, and the separate Function App does not inherit them. The current workflow reads the five public variables from GitHub secrets at build time. Restart local development after changing `.env.local`, and rebuild/redeploy production after changing a frontend secret.

The workflow `.github/workflows/azure-static-web-apps-delightful-river-00df62b10.yml` runs on pushes and pull requests targeting `main`. It installs dependencies, builds the static site with the public environment variables, verifies the exported homepage, 404 page, and SWA configuration, and uploads `icethick/out/` with `skip_app_build: true`. Next.js static export produces `out`, not `build`; `output_location` is empty because `app_location` already points to the export. It does not bundle the separately deployed Functions API.

The older calm-pebble workflow has been removed. The remaining workflow uses the delightful-river deployment token. Rerunning an old failed job uses its original workflow revision; push this fix to `main` to trigger a run with the corrected configuration.

Configure these GitHub Actions secrets before deployment:

- `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_RIVER_00DF62B10`
- `NEXT_PUBLIC_SITE_URL` — `https://icerelay.net`
- `NEXT_PUBLIC_API_URL` — optional; defaults to `/api` for the linked SWA backend. Set only when using a separate protected API endpoint ending in `/api`.
- `NEXT_PUBLIC_MAPBOX_TOKEN` — a public Mapbox token restricted to the deployed site domains
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — existing GA4 measurement ID `G-WBV3R0RG7F`
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — optional Microsoft Clarity project ID; create a Clarity project before setting it

All `NEXT_PUBLIC_*` values are public and embedded at build time in the static site; never place private credentials in them, and changing Azure runtime settings alone will not update them. Add these values to GitHub Actions secrets for the frontend workflow. For local development, use the ignored `icethick/.env.local`.

The local frontend file is prepopulated with the local site and API URLs and the supplied public Mapbox token. Clarity/GA remain blank locally. Keep real public tokens in ignored `.env.local` and GitHub build secrets where possible; a concurrent edit restored the public token to the tracked example, which was preserved rather than overwritten. Restrict that token's allowed origins before publishing it. GA and Clarity scripts are disabled in local builds unless their IDs are provided, and only initialize after the visitor grants analytics consent.

## Domain and SEO cutover

The site now declares `https://icerelay.net` as its canonical origin. The sitemap and robots file use that same host. Before deploying this domain change to production:

1. Add `icerelay.net` as a custom domain on the production Static Web App, complete the domain validation required by Azure, and verify HTTPS is issued.
2. Select `icerelay.net` as the canonical host. Attach `www.icerelay.net` only if you can configure a permanent HTTP 301 redirect from `www` to the apex host; DNS records alone cannot redirect browser requests.
3. If the previous `icerelay.app` domain is controlled, retain it and set a path-preserving permanent redirect to the matching `icerelay.net` URL.
4. Confirm the new site is reachable over HTTPS before publishing these canonical URLs. The latest public check found an apex DNS A record, no `www` web record, and an HTTPS timeout; verify that DNS points to the production Static Web App and that its certificate is active.
5. Rebuild and deploy the static site after confirming the linked `/api` backend (or optional `NEXT_PUBLIC_API_URL` override) and the `NEXT_PUBLIC_MAPBOX_TOKEN` build secret. Add `https://icerelay.net` to the Mapbox token's URL restrictions. A separate cross-origin API also needs the site in its CORS allowlist (and `www` only if it is intentionally served).
6. Update the Google Analytics web-stream URL, verify the domain in Google Search Console, submit `https://icerelay.net/sitemap.xml`, and confirm the AdSense site/domain configuration and `ads.txt`.
7. Verify that `support@icerelay.app` is still monitored or provision a working `@icerelay.net` support address before changing the published contact details.

## API

The workflow at `.github/workflows/main_ice-relay-func.yml` builds the Functions project on pushes to `main`. Deployment is manual: dispatch the workflow and set `deploy_to_azure` only after confirming the Function App hosting plan supports .NET 10. It targets the existing Function App `ice-relay-func`.

Configure these Function App settings:

- `FUNCTIONS_WORKER_RUNTIME=dotnet-isolated`
- `FUNCTIONS_EXTENSION_VERSION=~4`
- `AzureWebJobsStorage` — Function host storage account connection string or supported identity-based configuration. This is for the Functions host/runtime; the app code does not use Blob Storage or queues.
- `SQLAZURECONNSTR_DefaultConnection` (preferred) or `SqlConnectionString` — Azure SQL connection string. Keep this secret out of the frontend and source control.
- `RATE_LIMIT_HASH_SECRET` — a randomly generated secret (at least 32 random bytes, stored as a Function App setting or Key Vault reference) used to HMAC client identifiers before rate-limit/session tracking. Rotating it resets the per-client in-memory rate buckets.
- Application Insights is not used in the selected setup; `APPLICATIONINSIGHTS_CONNECTION_STRING` is not required.

Never put database credentials, storage credentials, or the rate-limit hash secret in frontend environment variables or commit them to the repository. Configure Function App CORS for the exact deployed origin `https://icerelay.net`; configure any alternate host only if it is intentionally served. Configure the public API gateway with the same allowed origin and make the frontend call the gateway endpoint. CORS by itself does not prevent direct calls to the Function App.

The API currently has anonymous HTTP triggers and an in-process 60-requests/minute limit per hashed client identifier on each HTTP route, plus 5 valid report submissions/hour, 10/day, and a same-client duplicate-location check. The in-memory limiter is thread-safe within one Function worker, but it resets on cold starts, is not shared across scaled-out workers, and depends on a trustworthy client IP forwarding chain. It is defense-in-depth, not a sufficient production abuse-control boundary. Before public launch, place the Function API behind Azure API Management (or an equivalent gateway) with distributed rate limits, request-size limits, monitoring, and origin restrictions. Route the frontend through that gateway and restrict direct access to the Function origin (for example, by private networking or access restrictions); CORS alone does not block direct callers.

Before deploying .NET 10, confirm the Function App hosting plan supports it. In particular, .NET 10 is not supported on Linux Consumption; Linux-hosted .NET 10 Functions require Flex Consumption or another supported plan. The live plan could not be verified from the current Azure context, so confirm it before running the deployment workflow.

For manual deployment, install Azure Functions Core Tools v4, authenticate with Azure, then run:

```powershell
cd api
func azure functionapp publish ice-relay-func
```

## Release checks

### Search and crawler checks

- The sitemap lists all 11 public page routes at the IceRelay.net canonical origin; it intentionally excludes API routes and the 404 page.
- `robots.txt` allows public pages, disallows `/api/`, and points crawlers to the sitemap. It is not an access-control mechanism.
- SWA uses `responseOverrides.404` to serve the exported `/404.html` while preserving an HTTP 404. Do not rewrite unknown URLs through `navigationFallback`: that can produce a soft 404 with HTTP 200.
- Confirm the custom 404 includes `noindex` in the production output (Next.js injects it), and verify a nonexistent URL returns HTTP 404 on the deployed domain.
- MUI styles are collected in a per-render Emotion cache and emitted through Next.js `useServerInsertedHTML`, preventing inline server style nodes from disrupting hydration. Retest initial page loads and navigation when updating MUI/Emotion.
- Page titles, descriptions, headings, and official resource links use relevant phrases such as community ice thickness reports, Minnesota lakes, and MN DNR ice safety naturally. Do not add hidden keywords, fabricated lake pages, or claim agency affiliation.
- Submit the sitemap in Google Search Console after domain/TLS verification; monitor indexing and real search queries. Relevant content and official citations help users, but backlinks to MN DNR do not guarantee ranking or transfer its authority to this site.

Run the frontend checks before publishing:

```powershell
cd icethick
npm ci
npm run lint
npm run build
```

Build the API from the repository root with:

```powershell
dotnet publish api\IceRelay.Api.csproj --configuration Release --output api\publish
```

For local development, copy `api\local.settings.example.json` to `api\local.settings.json` if needed. Set `SqlConnectionString` to a development database and use Azurite for `AzureWebJobsStorage=UseDevelopmentStorage=true`; the local settings file is ignored by Git. The checked-in `DB_Schema.md` is design/reference documentation, not an executable migration. There is currently no checked-in SQL migration or database-schema.sql file. Before rebuilding or migrating the database, take a backup, inspect the deployed schema and indexes, compare them with the API's SQL queries, and write/review a versioned migration that preserves any reports that should remain available.

Confirm both deployments are healthy and verify report listing, report submission, lake search, and map-bounds queries. The nearby-report and per-lake routes currently return placeholder data; do not treat them as production-ready. Report storage/query retention is 180 days in the current API and should be aligned with the product's freshness policy before relying on old reports.
