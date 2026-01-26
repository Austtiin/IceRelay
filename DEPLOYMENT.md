# Azure Deployment Configuration

## Current Setup

### Frontend (Next.js Static Web App)
- **Location**: `/icethick` folder
- **Build Output**: `out` folder (static export)
- **Deployment**: Azure Static Web Apps

### Backend (Azure Functions)
- **Location**: `/api` folder
- **Runtime**: .NET 8
- **Deployment**: Azure Functions App

## Deployment Steps

### 1. Deploy Azure Functions Backend

The API needs to be deployed separately to Azure Functions:

```bash
cd api
func azure functionapp publish <YOUR_FUNCTION_APP_NAME>
```

Or use the Azure portal to deploy from GitHub.

### 2. Update Frontend Environment Variables

Before deploying the frontend, update the production API URL:

1. Edit `icethick/.env.production`
2. Replace `NEXT_PUBLIC_API_URL` with your Azure Functions URL:
   ```
   NEXT_PUBLIC_API_URL=https://<YOUR_FUNCTION_APP_NAME>.azurewebsites.net/api
   ```

### 3. Deploy Static Web App (Automatic)

The frontend is automatically deployed via GitHub Actions when you push to `main` branch.

**Workflow file**: `.github/workflows/azure-static-web-apps-calm-pebble-096a9a410.yml`

Configuration:
- `app_location: "/icethick"` - Source code folder
- `output_location: "out"` - Build output folder (Next.js static export)
- `api_location: ""` - Empty because API is deployed separately

### 4. Configure Static Web App Settings (Azure Portal)

~~In the Azure Portal for your Static Web App:~~

~~1. Go to **Configuration** → **Application settings**~~
~~2. Add:~~
   ~~- Name: `NEXT_PUBLIC_API_URL`~~
   ~~- Value: `https://<YOUR_FUNCTION_APP_NAME>.azurewebsites.net/api`~~

**UPDATE**: This step is NOT needed for Next.js static exports. Environment variables must be configured as **GitHub Secrets** instead (see Environment Variables section below).

## Local Development

```bash
# Terminal 1: Start Azure Functions
cd api
func start

# Terminal 2: Start Next.js
cd icethick
npm run dev

# Or use concurrently (from icethick folder):
npm run dev:all
```

## Troubleshooting

### "Cannot find default file" Error
- Ensure `next.config.ts` has `output: 'export'`
- Ensure workflow has `output_location: "out"`
- Run `npm run build` locally to verify `out` folder is created

### API Errors in Production
- Verify Azure Functions app is running
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS settings in Azure Functions allow your Static Web App domain

### Build Failures
- Ensure all TypeScript errors are fixed locally first
- Check GitHub Actions logs for specific errors
- Verify Node.js version matches (check package.json engines if specified)

## Architecture

```
GitHub Repository
├── icethick/              → Next.js App (Static Web App)
│   ├── out/              → Build output (generated)
│   └── .env.production   → Production env vars
├── api/                  → Azure Functions (.NET 8)
└── .github/workflows/    → CI/CD pipeline
```

## Environment Variables

### Development (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:7071/api
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYXN0cGhlbnMxMDA2IiwiYSI6ImNta3VxcDMyNzFqd3UzZG9kemVucmdudmMifQ.GtH22K3wSgDiILPgQN0SdQ
```

### Production (GitHub Secrets)

**IMPORTANT**: For Next.js static exports (`output: 'export'`), environment variables must be available at **build time**, not runtime. Azure Static Web App environment variables are runtime-only and won't work for static exports.

#### Setup GitHub Secrets:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `NEXT_PUBLIC_API_URL`: Your Azure Functions URL
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox access token

The GitHub Actions workflow automatically injects these during the build step.

**Note**: Do NOT use Azure Static Web App Configuration settings for these variables—they won't be accessible during build time for static exports.

## Notes

- Static Web App deployment is automatic via GitHub Actions
- Azure Functions must be deployed manually or via separate pipeline
- Google Analytics tracking ID: G-WBV3R0RG7F (already configured)
- React Strict Mode: Enabled for better development practices
