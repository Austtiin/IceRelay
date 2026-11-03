# Ice Relay

Ice Relay is a community-reporting project for lake ice observations in the Upper Midwest. Reports are submitted by users and are unverified; they do not determine whether ice is safe.

## What is in this repository

- `icethick/` — Next.js 16 frontend, configured for static export to Azure Static Web Apps
- `api/` — .NET 10 isolated Azure Functions API backed by Azure SQL
- `api/sql/001-initialize.sql` — repeat-safe table/index setup and legacy notes-capacity migration
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
npm test
npm run build
npm run verify:export
```

## Deployment

The frontend GitHub Actions workflow builds and publishes `icethick/out` to Azure Static Web Apps. The Functions workflow deploys `api/` to the `ice-relay-func` Function App. Both use GitHub Actions secrets; see [DEPLOYMENT.md](./DEPLOYMENT.md).

## API status

The frontend uses report submission, lake-name search, map bounds, and lake detection.
Nearby and per-lake endpoints also query real SQL data; no sample reports are returned.
Apply `api\sql\001-initialize.sql` before deploying the updated API.

Public queries exclude flagged/expired reports and records older than 180 days.
Expiry hides reports but does not delete stored records; align storage retention
and the published privacy policy before launch.

## Safety

Ice conditions vary within a single body of water and change with weather, ice quality, currents, and other local factors. Ice Relay reports are signals from the community, not verified safety guidance. Follow the relevant state agency's current advice, check conditions yourself, and stay off the ice when uncertain.

## Public website and community growth

The homepage introduces the project, links to regional map views, and encourages firsthand
observations. `/contribute/` explains the reporting workflow, what makes a useful report,
and how people can introduce the project to their local community. Report calls to action
reuse the existing submission form; no account or pre-existing lake listing is required.
API failures must remain distinct from an empty report list.

Page metadata uses `icethick/lib/metadata.ts` to keep canonical, Open Graph, and Twitter
titles, descriptions, and URLs aligned. The root includes WebSite structured data;
resource pages have matching breadcrumb structured data. Add public routes to
`icethick/lib/site.ts`; `app/sitemap.ts` and `app/robots.ts` generate discovery
files using the same site origin. `verify:export` checks the actual built output.

`/resources/`, `/community-ice-reports/`, and `/report-poor-ice-conditions/` explain
the reporting process and its limits. The current form requires a positive
firsthand thickness measurement, not a visual guess or a hazard-only submission.
Maps expose notes and conditions; unimplemented flag buttons now link to contact.

### SEO and backlink priorities

1. **Measure discovery after deployment.** Verify ownership in Google Search Console and
   Bing Webmaster Tools, submit the sitemap, and monitor indexing, relevant lake-search
   queries, mobile performance, and organic visits. A sitemap or structured data alone
   does not guarantee indexing or better rankings.
2. **Earn relevant recommendations.** Ask lake associations, fishing clubs, local bait
   shops, and regional outdoor publications to consider linking to the homepage or
   reporting guide from genuinely relevant resource pages. Explain that reports are
   unverified. Do not claim partnerships or endorsements without permission.
3. **Make sharing useful.** Offer a short, factual introduction: "Ice Relay collects
   community ice thickness observations across the Upper Midwest. Reports are unverified,
   not safety assessments. Browse local observations or contribute a firsthand report."
   Request permission before sharing in groups. Avoid bought links, link exchanges,
   mass comments, and duplicate promotional pages. Linking out to state agencies is a
   useful citation, not an inbound backlink.
4. **Build indexable lake content only from real data.** The interactive map's query-string
   views are navigation shortcuts, not separate indexable lake pages. A future lake-page
   feature should have stable URLs, meaningful server-rendered observations, report dates,
   source limitations, unique metadata, and sitemap entries. Align report retention
   and establish meaningful lake content first; never publish mock conditions or
   thin state/lake doorway pages for SEO.
5. **Improve reporting quality before expanding claims.** Prioritize report freshness,
   corrections/moderation, accessible submission dialogs, and reliable submission
   feedback. Encourage new observations, not duplicate reports or risky trips onto ice.
   Track successful contributions rather than rewarding submission volume alone.

These are follow-up outreach and product priorities, not completed backlink placements
or search-console configuration. Publishing the code does not perform those external actions.

## Production settings and release checks

See [DB_Schema.md](./DB_Schema.md) for all SQL columns and the command to initialize
the database. See [DEPLOYMENT.md](./DEPLOYMENT.md) and
`api/azure.settings.example.json` for the exact Functions settings and a user-run
Azure CLI command. Real SQL, storage, and HMAC credentials stay in Key Vault or
protected backend settings, never in `NEXT_PUBLIC_*` or source control.

The static CSP restricts resource origins and removes `unsafe-eval`, while retaining
inline script/style support needed by this static Next.js/Emotion build. The build
adds the configured API origin and makes PR preview responses `noindex`. HSTS,
anti-framing, referrer, permissions, and MIME-sniffing headers are configured.
Verify actual headers, HTTPS, 404 status, maps, consent, and API behavior after
deployment; a local build does not verify Azure configuration or DNS.
