# Ice Relay seasonal readiness

## What we found

- The Git repository has no commits dated in 2025. Its history starts on January 15, 2026; the last project commits before this refresh were January 28, 2026. The prior baseline is the community-reporting app, map, lake search, reporting API, SEO/legal pages, and a 180-day report window.
- The frontend and API are separate deployments: a Next.js static export on Azure Static Web Apps and an Azure Functions API on `ice-relay-func`.
- The prior setup targeted .NET 8, used older isolated-worker packages, built the Function app rather than publishing it, and used Node 20 in the frontend workflow.

## Completed in this refresh

- [x] Move the Functions project to .NET 10 isolated with Functions Worker 2.52 and the current `Azure.Functions.Sdk`.
- [x] Update the SQL client and pin a patched cryptography dependency; the .NET vulnerability audit is clear.
- [x] Update the frontend to React 19.3, current React type packages, and current compatible minor/patch releases; Next.js 16.4 is already current.
- [x] Set CI to Node 24 and .NET 10; publish the Functions output and use the separate Function App deployment.
- [x] Remove the stale Static Web Apps `apiRuntime` setting: this repo does not deploy an API through Static Web Apps.
- [x] Place `staticwebapp.config.json` in the exported public assets and verify it is present in the Static Web Apps artifact.
- [x] Prepare SEO metadata, page canonicals, Open Graph/Twitter cards, robots, and the 11-URL sitemap for the requested `icerelay.net` apex domain.
- [x] Refresh mobile presentation, state map shortcuts, lake-report submission/error handling, safety messaging, official resource links, and project documentation.
- [x] `npm ci`, the Next.js static build, full ESLint, `npm audit`, a clean .NET publish, and the .NET package vulnerability audit pass.
- [x] The main pages fit narrow/mobile emulation without horizontal overflow; the safety guide's small-screen heading/card overflow was corrected.

## Before production redeployment

- [x] Remove decorative emoji and generic location/report button icons; retain functional close controls and text-based notification severity.
- [x] Verify all 11 sitemap routes respond locally, robots/sitemap return HTTP 200, and a nonexistent URL returns the custom 404 with `noindex`. Configure SWA's `responseOverrides.404` to avoid soft 404s; verify the deployed response separately.
- [x] Add explicit MN DNR citations and non-affiliation disclosure, and document exactly which public build variables and private Function connection strings belong in each environment.
- [x] Resolve the MUI/Emotion hydration mismatch with a per-render Emotion cache and Next.js server-inserted style registry. Verified initial loads of the safety guide, home, lake search, contact, and custom 404 without browser page errors; no hydration suppression was added.
- [x] Restore the existing homepage photo, use Segoe UI with system fallbacks in CSS and MUI, simplify the website presentation, and wire all documented public build variables through frontend CI.
- [x] Verify the restored hero image loads, font styles apply, mobile navigation opens, the add-lake confirmation still works, and the missing-Mapbox state offers lake search in the running development browser.
- [ ] Rerun full frontend lint and production build after the latest website/configuration changes. The development browser compiled and rendered them, but command-specific build/lint authorization was unavailable.
- [ ] **Complete IceRelay.net domain cutover.** The latest public check found an apex DNS A record, no `www` web record, and an HTTPS timeout. Verify DNS points to the production Static Web App, attach and validate the apex domain there, and confirm HTTPS. Decide whether to serve `www` (and permanently redirect it to the apex); if `icerelay.app` is controlled, preserve it with path-preserving permanent redirects. Update Mapbox URL restrictions, API CORS, Search Console verification/sitemap submission, the Analytics web-stream URL, and AdSense domain configuration. Confirm the currently published `support@icerelay.app` address remains monitored before changing it.
- [ ] **Confirm the live Function App plan and settings.** Select the correct Azure subscription and verify the OS/plan, Functions runtime v4, and `FUNCTIONS_WORKER_RUNTIME=dotnet-isolated`. .NET 10 is not supported on Linux Consumption; Linux-hosted .NET 10 requires Flex Consumption or another supported plan. No production deployment has been run.
- [ ] **Put public API traffic behind a protected gateway.** The current Function triggers are anonymous; route the site through API Management or an equivalent gateway with distributed throttling, request-size controls, monitoring, and restrictions that prevent direct-origin bypass. CORS is not an abuse-control boundary.
- [ ] **Reconcile and migrate the database before rebuilding it.** There is no executable SQL schema/migration in the repository. Back up the current database, inspect its live tables/indexes/data, compare them with the API queries, then review and apply a versioned migration.
- [ ] After the plan and gateway are confirmed, deploy the Function app and smoke-test report listing, submission, lake search/detection, and map bounds. Confirm SQL connectivity, CORS for the Static Web App origin, and the production gateway/Mapbox build variables.
- [ ] Run the responsive checks on real iOS Safari and Android Chrome devices at common widths. Browser emulation reports a narrower CSS viewport than requested, so it is not a substitute for device testing.
- [ ] Replace the mock-data implementations of `/api/reports/nearby` and `/api/reports/lake/{lakeName}`, or remove/disable those routes until real SQL-backed behavior exists.
- [ ] Revisit the 180-day report retention/search window. Ice observations can become stale far sooner; agree on a freshness policy before relying on broader coverage.
- [ ] Verify and add official safety resources for Michigan, Iowa, and South Dakota before presenting those states as fully covered; only Minnesota, Wisconsin, and North Dakota sources were confirmed in the last review.
- [ ] Tighten the broad Static Web Apps Content Security Policy after inventorying the required Mapbox, analytics, fonts, and ad origins.
