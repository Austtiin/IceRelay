# Ice Relay 🧊

Community-driven ice thickness reporting app for the Midwest. Real-time data from fellow ice enthusiasts.

## Project Structure

```
IceThicknessMN/
├── icethick/          # Next.js frontend (Static Web App)
│   ├── app/           # Next.js 16 app directory
│   ├── lib/           # API client and utilities
│   └── public/        # Static assets
└── api/               # Azure Functions API (.NET 8)
    ├── Functions/     # HTTP-triggered functions
    └── Models/        # Data models
```

## Prerequisites

- **Node.js** 18+ and npm
- **.NET 8 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Azure Functions Core Tools** - Install via:
  ```bash
  npm install -g azure-functions-core-tools@4 --unsafe-perm true
  ```
  Or on Windows:
  ```bash
  winget install Microsoft.Azure.FunctionsCoreTools
  ```

## Quick Start

### Option 1: Run Both Services Together (Recommended)

```bash
cd icethick
npm install
npm run dev:all
```

This runs both:
- Frontend: http://localhost:3000
- API: http://localhost:7071/api

### Option 2: Run Separately

**Terminal 1 - Frontend:**
```bash
cd icethick
npm install
npm run dev
```

**Terminal 2 - API:**
```bash
cd api
dotnet restore
func start
```

## API Endpoints

### Get All Reports
```bash
GET http://localhost:7071/api/reports
```

### Create Report
```bash
POST http://localhost:7071/api/reports
Content-Type: application/json

{
  "lake": "Lake Minnetonka",
  "thickness": 8.5,
  "surfaceType": "clear",
  "isMeasured": true,
  "latitude": 44.9237,
  "longitude": -93.5633
}
```

### Get Nearby Reports
```bash
POST http://localhost:7071/api/reports/nearby
Content-Type: application/json

{
  "latitude": 44.9237,
  "longitude": -93.5633,
  "radiusKm": 50
}
```

### Get Reports by Lake
```bash
GET http://localhost:7071/api/reports/lake/Lake%20Minnetonka
```

## Building for Production

### Frontend (Static Export)
```bash
cd icethick
npm run build
```
Output will be in `icethick/out/` directory

### API
```bash
cd api
dotnet build --configuration Release
```

## Deployment

This project is designed for **Azure Static Web Apps** with integrated API support:

1. Frontend deploys as static site
2. API deploys as Azure Functions backend
3. Routes automatically configured (`/api/*` → Azure Functions)

### Deploy to Azure

```bash
# Using Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy
```

Or connect your GitHub repo to Azure Static Web Apps for automatic CI/CD.

## Technology Stack

### Frontend
- **Next.js 16** - React framework with static export
- **Material UI** - Component library
- **TypeScript** - Type safety

### Backend
- **.NET 8** - Runtime
- **Azure Functions** - Serverless compute
- **Cosmos DB** (Coming soon) - NoSQL database for reports

## Features

✅ Community ice thickness reports  
✅ GPS-based location tracking  
✅ Free-text lake names (crowd-sourced)  
✅ Real-time API integration  
✅ Static site with serverless API  
✅ Material UI design system  
✅ Mobile-responsive  

🚧 Coming Soon:
- Azure Cosmos DB integration
- Interactive map view
- Geospatial queries
- Rate limiting & abuse prevention
- User suggestions ("Are you at Lake X?")

## Development Notes

### Frontend Configuration
- `next.config.ts` configured for static export (`output: 'export'`)
- Development proxy forwards `/api/*` to `http://localhost:7071/api/*`
- Production routes handled by Azure Static Web Apps

### API Configuration
- Uses .NET 8 isolated worker model
- CORS enabled for development
- HTTP-triggered functions (no authentication required for v1)

### Data Model
Reports are stored with:
- Optional lake name (free text)
- GPS coordinates (lat/lng)
- Ice thickness
- Surface type (clear, snow-covered, slush, refrozen)
- Measurement method
- Timestamp

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

Created by [@Austtiin](https://github.com/Austtiin)

## Safety Disclaimer

⚠️ **Ice Relay provides community signals, not permission to venture onto ice.** Always verify conditions yourself before going on the ice. Ice thickness can vary significantly and conditions change rapidly. Your safety is your responsibility.
