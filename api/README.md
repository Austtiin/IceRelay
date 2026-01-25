# Ice Relay API

Azure Functions API for Ice Relay application.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local)

## Installation

```bash
# Install Azure Functions Core Tools (if not already installed)
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Or on Windows with winget
winget install Microsoft.Azure.FunctionsCoreTools
```

## Running Locally

```bash
# Navigate to the api folder
cd api

# Restore dependencies
dotnet restore

# Start the functions
func start
```

The API will be available at `http://localhost:7071/api/`

## Available Endpoints

### Get All Reports
```
GET http://localhost:7071/api/reports
```

### Create Report
```
POST http://localhost:7071/api/reports
Content-Type: application/json

{
  "lake": "Lake Minnetonka",
  "thickness": 8.5,
  "location": "North shore",
  "latitude": 44.9237,
  "longitude": -93.5633,
  "surfaceType": "clear",
  "isMeasured": true,
  "method": "hand-auger",
  "iceQuality": ["Foot traffic only"],
  "notes": "Good ice near the dock",
  "useGPS": true
}
```

### Get Nearby Reports
```
POST http://localhost:7071/api/reports/nearby
Content-Type: application/json

{
  "latitude": 44.9237,
  "longitude": -93.5633,
  "radiusKm": 50
}
```

### Get Reports by Lake
```
GET http://localhost:7071/api/reports/lake/Lake%20Minnetonka
```

## Development

Currently using in-memory mock data. Next steps:

1. Add Azure Cosmos DB connection
2. Implement geospatial queries
3. Add rate limiting
4. Add validation and sanitization
5. Implement abuse prevention

## Building

```bash
dotnet build
```

## Deployment

This API is designed to be deployed as part of an Azure Static Web App with integrated API support.
