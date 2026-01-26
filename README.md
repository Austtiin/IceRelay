# Ice Relay 🧊

**Community-driven ice thickness reporting for Minnesota lakes.** Share real-time ice conditions with fellow ice enthusiasts and help keep our community safe.

🌐 **Live Site:** [icerelay.com](https://icerelay.com)  
📍 **Focused on:** Minnesota lakes and ice fishing spots

---

## 🎯 About Ice Relay

Ice Relay is an open-source platform that connects ice anglers and outdoor enthusiasts through community-sourced ice thickness reports. By sharing real-time conditions, we help everyone make informed decisions about ice safety.

### Key Features
- 📊 **Real-Time Reports** - View recent ice thickness measurements from the community
- 🗺️ **Interactive Map** - See reports on an interactive Mapbox-powered map
- 📍 **Location-Based** - Find reports near you with GPS integration
- ⚡ **Fast & Responsive** - Static site generation for lightning-fast loading
- 🔒 **Content Moderation** - Automated profanity filtering and spam protection
- 📱 **Mobile-First** - Optimized for use in the field

---

## 🏗️ Project Structure

```
IceThicknessMN/
├── icethick/                    # Next.js Frontend (Static Web App)
│   ├── app/                     # Next.js 16 App Router
│   │   ├── components/          # Reusable React components
│   │   ├── map/                 # Interactive map page
│   │   ├── near-me/             # Location-based reports
│   │   └── [pages]/             # Policy & info pages
│   ├── lib/                     # API client & utilities
│   └── public/                  # Static assets (sitemap, robots.txt)
│
└── api/                         # Azure Functions Backend (.NET 8)
    ├── Functions/               # HTTP-triggered serverless functions
    │   └── ReportsFunction.cs   # CRUD operations for reports
    ├── Models/                  # Data models & entities
    │   └── IceReport.cs         # Ice report schema
    └── Helpers/                 # Content validation & utilities
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | 18+ | [Download](https://nodejs.org/) |
| **npm** | 8+ | Included with Node.js |
| **.NET SDK** | 8.0 | [Download](https://dotnet.microsoft.com/download/dotnet/8.0) |
| **Azure Functions Core Tools** | 4.x | See below |

### Installing Azure Functions Core Tools

**macOS/Linux:**
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

**Windows (via winget):**
```bash
winget install Microsoft.Azure.FunctionsCoreTools
```

**Windows (via npm):**
```bash
npm install -g azure-functions-core-tools@4
```

---

## 🚀 Quick Start

### Option 1: Run Both Services Together (Recommended)

Get up and running with a single command:

```bash
cd icethick
npm install
npm run dev:all
```

This starts:
- ✅ **Frontend:** [http://localhost:3000](http://localhost:3000)
- ✅ **API:** [http://localhost:7071/api](http://localhost:7071/api)

### Option 2: Run Services Separately

**Terminal 1 - Frontend:**
```bash
cd icethick
npm install
npm run dev
```
Frontend runs on: [http://localhost:3000](http://localhost:3000)

**Terminal 2 - Backend API:**
```bash
---

## 📡 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports` | Retrieve all ice thickness reports |
| `POST` | `/api/reports` | Submit a new ice thickness report |
| `POST` | `/api/reports/nearby` | Find reports near GPS coordinates |
| `GET` | `/api/reports/lake/{name}` | Get reports for a specific lake |

### Example Requests

**Get All Reports**
```bash
GET http://localhost:7071/api/reports
```

**Submit New Report**
```bash
POST http://localhost:7071/api/reports
Content-Type: application/json

{
  "lake": "Lake Minnetonka",
  "thickness": 8.5,
  "surfaceType": "clear",
  "isMeasured": true,
  "latitude": 44.9237,
  "longitude": -93.5633,
  "notes": "Checked near Big Island"
}
```

**Find Nearby Reports (50km radius)**
```bash
POST http://localhost:7071/api/reports/nearby
Content-Type: application/json

{
  "latitude": 44.9237,
  "longitude": -93.5633,
  "radiusKm": 50
}
```
**Frontend (Static Site)**
```bash
cd icethick
npm run build
```
📦 Output: `icethick/out/` directory (ready for deployment)

**Backend API**
```bash
cd api
dotnet build --configuration Release
```
📦 Output: `api/bin/Release/net8.0/`

---

## 🚢 Deployment

Ice Relay is designed for **Azure Static Web Apps** with seamless Azure Functions integration:

| Component | Technology | Route |
|-----------|-----------|-------|
| Frontend | Static HTML/CSS/JS | `/*` |
| Backend API | Azure Functions (.NET 8) | `/api/*` |

### Deploy to Azure

**Option 1: GitHub Actions (Recommended)**
1. Fork this repository
2. Create an Azure Static Web App resource
3. Connect your GitHub repository
4. Azure automatically sets up CI/CD

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Mapbox GL JS** | Interactive mapping |
| **Material-UI** | Component library |
| **CSS Custom Properties** | Theme & styling |

### Backend
| Technology | Purpose |
|------------|---------|
| **.NET 8 Isolated** | Modern .NET runtime |
| **Azure Functions** | Serverless HTTP APIs |
| **Azure Cosmos DB** | NoSQL database (planned) |
| **Content Validation** | Profanity & spam filtering |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Azure Static Web Apps** | Frontend hosting & routing |
| **Azure Functions** | Backend API runtime |
| **GitHub Actions** | CI/CD pipeline |

---

## ✨ Features

### Current Features
- ✅ **Community Ice Reports** - Submit and view ice thickness data
- ✅ **Interactive Map View** - Mapbox-powered geographic visualization
- ✅ **Location-Based Search** - Find reports near you
- ✅ **Content Moderation** - Automated profanity and spam filtering
- ✅ **GPS Integration** - Precise location tracking
- ✅ **Mobile Responsive** - Optimized for field use
- ✅ **Static Site Generation** - Fast loading times
- ✅ **Safety Guidelines** - Comprehensive ice safety information
- ✅ **Google AdSense** - Compliant with acceptable use policies

### 🚧 Roadmap
- [ ] **Azure Cosmos DB** - Scalable NoSQL data storage
---

## 🧪 Development Notes

### Frontend Configuration
- **Static Export:** `output: 'export'` in `next.config.ts`
- **Development Proxy:** Forwards `/api/*` → `http://localhost:7071/api/*`
- **Production Routing:** Handled by Azure Static Web Apps
- **Environment:** `.env.local` for Mapbox token

### Backend Configuration
- **.NET 8 Isolated Worker:** Modern Azure Functions runtime
- **CORS:** Enabled for local development
- **No Authentication:** Open API for v1 (rate limiting planned)
- **Content Validation:** Profanity filter with 20+ terms, 7 spam patterns

### Data Model
```typescript
interface IceReport {
  lake?: string;           // Optional lake name (free-form)
  latitude: number;        // GPS latitude
  longitude: number;       // GPS longitude
  thickness: number;       // Ice thickness in inches
  surfaceType: string;     // 'clear' | 'snow' | 'slush' | 'refrozen'
  isMeasured: boolean;     // true = measured, false = estimated
  notes?: string;          // Optional user notes
  timestamp: Date;         // Auto-generated report time
}
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **✍️ Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to your branch (`git push origin feature/amazing-feature`)
5. **🎯 Open** a Pull Request

### Areas We Need Help
- 🐛 Bug reports and fixes
- 💡 Feature suggestions
- 📖 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌍 Internationalization (i18n)

**Found a bug?** [Open an issue](https://github.com/Austtiin/IceRelay/issues)  
**Have a feature idea?** [Start a discussion](https://github.com/Austtiin/IceRelay/issues)

---

## 📜 License

Ice Relay is open-source software created by [Austin Stephens](https://AustinStephens.me).

---

## ⚠️ Safety Disclaimer

**IMPORTANT:** Ice Relay provides community-sourced data, **NOT permission** to venture onto ice.

- ❄️ **Always verify conditions yourself** before going on the ice
- 📏 **Ice thickness varies drastically** across a single body of water
- 🌡️ **Conditions change rapidly** with temperature fluctuations
- 🛟 **Your safety is your responsibility** - no ice is 100% safe
- 🚨 **When in doubt, stay off the ice**

Read our full [Safety Guide](https://icerelay.com/safety-guide) before heading out.

---

## 📞 Contact

- 🌐 **Website:** [AustinStephens.me](https://AustinStephens.me)
- 💻 **GitHub:** [@Austtiin](https://github.com/Austtiin)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Austtiin/IceRelay/issues)
- ⭐ **Star this repo** if you find it useful!

---

<div align="center">
  <sub>Built with ❄️ by ice anglers, for ice anglers</sub>
</div>
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
