# Ice Relay 📡

**Ice thickness across the Midwest** - Real-world ice reports from the community. No account required. Stay safe this winter.

## 🎯 The Concept

Ice Relay is a community-driven platform providing real-time ice thickness data across the Midwest. Unlike official DNR charts, you get actual measurements from people on the ice - submitted anonymously, validated by the community, and designed for quick access in freezing conditions.

## 🎨 Design

- **Mobile-First**: Cold fingers friendly UI
- **Color Palette**:
  - Primary Dark: `#495867` - Headers, navigation
  - Primary Medium: `#577399` - Buttons, safe ice
  - Primary Light: `#BDD5EA` - Map overlays, cards
  - Background: `#F7F7FF` - Main page
  - Alert Red: `#FE5F55` - Danger warnings (used sparingly for impact)

## ✨ Features

### What Users Can Do:
- 📏 **Report Ice Thickness** in inches
- 📍 **Tag Location** via GPS or lake name  
- 🧊 **Select Surface Type**: Clear ice, Snow-covered, Slush, Refrozen
- 💬 **Optional Notes**: "ATV broke through", "Pressure cracks", "Foot traffic only"
- ✅ **No Account Required** - Submit anonymously

### What Makes It Valuable:
- 🌐 **Real-World Reports** - Not just DNR charts
- ✓✓ **Trust Score** - Confidence based on multiple reports
- ⏱️ **Report Decay** - Older reports (24-48hr+) flagged for verification
- 📱 **Mobile-First** - Designed for cold fingers
- 🎯 **5-Tier Safety Scale** - Clear activity guidelines

## 📋 The IceLine Rules

These principles make Ice Relay trustworthy:

1. **⚠️ No Guarantees** - Ice conditions change hourly. This is a signal, not permission.
2. **📏 Report What You Measured** - If you didn't drill it, mark it as observed not measured.
3. **⏱️ Recent Reports Matter More** - Reports decay over time. After 24-48 hours, verify current conditions.
4. **✓✓ More Reports = More Confidence** - One report = caution. Multiple matching reports = higher confidence.
5. **🚫 Anonymous, Not Reckless** - Troll or false reports get auto-flagged by the system.

## 🧊 Ice Safety Scale (5-Tier System)

| Thickness | Activity | Safety Level |
|-----------|----------|--------------|
| 🔴 0-3" | No foot traffic | STAY OFF |
| 🟠 4-6" | Foot only | Walking only, extreme caution |
| 🟡 7-9" | Snowmobile | Light vehicles OK |
| 🟢 10-12" | ATV | ATVs generally safe |
| 🔵 12+" | Truck (still risky) | Heavy vehicles possible |
   # Top navigation with branding
│   │   ├── Navigation.tsx          # Side menu
│   │   ├── Footer.tsx              # Legal disclaimers
│   │   ├── ReportCard.tsx          # Ice reports with trust scores
│   │   └── SubmitReportForm.tsx    # Enhanced submission form
│   ├── globals.css                 # 5-tier color system
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main page with IceLine Rules
├── public/
│   └── IceRelay.png                # Brand logo
└── package.json
```

## 🎯 Roadmap

- [ ] Integrate real map with Midwest coverage (Leaflet/Mapbox)
- [ ] Backend API with PostgreSQL/Supabase
- [ ] GPS coordinate tagging
- [ ] Auto-flag system for suspicious reports
- [ ] Weather integration (temp, wind data)
- [ ] Lake detail pages with 7-day history
- [ ] PWA support for offline access
- [ ] Push notifications for dangerous conditions
- [ ] Expand to Wisconsin, Michigan, Minnesota, Iowa
├── app/
│   ├── components/
│   │   ├── Header.tsx           # Top navigation bar
│ This is a signal, not permission.** Always verify ice safety personally before venturing out. This application is provided for informational purposes only. The creators, contributors, and maintainers assume NO liability for any injuries, damages, or losses resulting from the use of this information.

**Use at your own risk.** Ice safety is the sole responsibility of each individual. When in doubt, stay off the ice.

## 🔥 What Makes Ice Relay Different

✅ **No DNR Lag** - Real people, real measurements, right now  
✅ **Trust Scores** - See confidence level based on multiple reports  
✅ **Report Decay** - Old data gets flagged automatically  
✅ **Activity-Specific** - Not just "safe/unsafe" - specific to your activity  
✅ **Anonymous** - No account barriers, no friction  
✅ **Cold-Weather UX** - Big buttons, quick actions, minimal typing
│   │   └── SubmitReportForm.tsx # Report submission form
│   ├── globals.css              # Global styles & CSS variables
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── public/                      # Static assets
└── package.json
```

## 🎯 Roadmap

- [ ] Integrate real map (Leaflet/Mapbox)
- [ ] Backend API with database (PostgreSQL/Supabase)
- [ ] User authentication (optional)
- [ ] Lake detail pages with 7-day history charts
- [ ] Push notifications for unsafe conditions
- [ ] PWA support for offline access
- [ ] Weather integration
- [ ] Ice fishing reports

## ⚖️ Legal Disclaimer

**All information is subject to change.** Ice thickness data is crowd-sourced, estimated, and may not be accurate or current. Ice conditions can vary significantly across a lake and can change rapidly due to weather conditions.

**Always verify ice safety personally before venturing out.** This application is provided for informational purposes only. The creators, contributors, and maintainers assume NO liability for any injuries, damages, or losses resulting from the use of this information.

**Use at your own risk.** Ice safety is the sole responsibility of each individual. When in doubt, stay off the ice.

## 👨‍💻 Author

Created by [Austtiin](https://github.com/Austtiin)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## Learn More About Next.jsvelopment server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
