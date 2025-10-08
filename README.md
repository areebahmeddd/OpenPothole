# 🧠 Project Description

**OpenPothole** (A project under Open India Initiative) is a minimalist, community-driven pothole reporting platform for Bangalore, inspired by the [Open311 standard](https://www.open311.org). It enables anyone to report potholes without login, see them on a public map, and verify fixes through community participation. The goal is radical transparency, mobile-first UX, and Gen‑Z friendly design.

Built with Next.js + TypeScript, Tailwind, Leaflet/OpenStreetMap, and Firestore.

### Key Features

- **Frictionless Reporting**: No login. Snap a photo, auto-capture GPS, submit.
- **Interactive Map**: Real-time markers with clustering, filters, and photo/details view.
- **Community Verification**: Crowd validation of fixes; disputes revert status.
- **Transparency by Default**: All reports public; shareable report pages.
- **Mobile‑First PWA**: Installable, offline-friendly, background sync, push-ready.
- **Open311‑Ready APIs**: Service discovery and request endpoints for future gov integration.
- **Anti‑Spam**: Device fingerprinting, rate‑limiting, required photo evidence.

## 🗂️ Project Structure

```
.
├── public/                     # Static assets (manifest, icons, robots, sitemap)
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── api/
│   │   │   └── reports/        # Report CRUD + stats routes
│   │   ├── map/                # /map page
│   │   ├── potholes/[id]/      # Individual report page
│   │   └── report/             # Report creation page
│   ├── components/             # UI components (map, stats, header, footer, ui/*)
│   ├── hooks/                  # Custom hooks (toast, mobile)
│   └── lib/                    # Utilities
├── .github/workflows/          # CI (build + Vercel deploy)
├── .devcontainer/              # Dev container config
├── Dockerfile                  # Node container for production
├── package.json                # Scripts & dependencies
└── next.config.mjs             # Next.js configuration
```

## ⚙️ Setup for Development

1. Environment variables (create `.env`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

2. Install dependencies

```bash
npm ci
```

3. Run the dev server

```bash
npm run dev
```

4. Dev Container (optional)

- Open in VS Code and "Reopen in Container" using `.devcontainer/devcontainer.json` (Node 22).

## 🌐 Public API (Open311-inspired)

```ts
// GET /api/services.json
interface Service {
  service_code: string;
  service_name: string;
  description: string;
  metadata: boolean;
  type: "realtime" | "batch" | "blackbox";
  keywords: string[];
  group: string;
}

// POST /api/requests.json
interface ServiceRequest {
  service_code: string;
  lat: number;
  long: number;
  address_string?: string;
  description?: string;
  media_url?: string;
}

// GET /api/requests.json
interface ServiceRequestResponse {
  service_request_id: string;
  status: "open" | "closed";
  service_name: string;
  service_code: string;
  description: string;
  requested_datetime: string;
  updated_datetime: string;
  lat: number;
  long: number;
  media_url: string;
}
```

## 🔐 Security & Privacy

- No login required; anonymous reporting
- Strip EXIF from photos; coarse location grid for privacy
- Input validation, rate limiting, and secure file uploads

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 👥 Authors

- [Areeb Ahmed](https://github.com/areebahmeddd)
