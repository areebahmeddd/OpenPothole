# OpenPothole - AI Development Guide

## Project Overview

OpenPothole is a minimalist, community-driven pothole reporting platform for Bangalore built with Next.js 15, TypeScript, and Tailwind CSS. The platform enables anonymous pothole reporting with real-time mapping, community verification, and Open311-compatible APIs.

### Core Architecture

- Frontend: Next.js 15 with App Router, React 19, TypeScript
- Styling: Tailwind CSS v4 with custom design system
- Maps: Leaflet.js with OpenStreetMap tiles
- UI Components: Radix UI primitives with shadcn/ui
- State Management: SWR for data fetching
- Deployment: Vercel with static generation

## Development Setup

### Prerequisites

- Node.js 22+
- npm

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Commands

```bash
# Install dependencies
npm ci

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Format code
npm run format
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/reports/        # API routes (GET, POST)
│   ├── map/               # Interactive map page
│   ├── potholes/[id]/     # Individual report pages
│   ├── report/            # Report creation form
│   ├── globals.css        # Global styles & design tokens
│   └── layout.tsx         # Root layout with theme provider
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── PotholeMap.tsx    # Leaflet map component
│   ├── StatsCard.tsx     # Statistics display
│   └── MorphingText.tsx  # Animated text component
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
└── types/                # TypeScript type definitions
```

## Code Style & Conventions

### TypeScript

- Strict mode enabled with comprehensive type checking
- Use `interface` for object shapes, `type` for unions/primitives
- Prefer explicit return types for functions
- Use `as const` for literal types

### React Patterns

- Functional components with hooks
- Use `"use client"` directive for client-side components
- Prefer `useState` and `useEffect` for local state
- Use SWR for server state management
- Implement proper error boundaries

### Styling

- Tailwind CSS v4 with custom design tokens
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Implement smooth animations with custom keyframes

### Component Structure

```tsx
// Component file structure
interface ComponentProps {
  // Props with JSDoc comments
}

export default function Component({ prop }: ComponentProps) {
  // Hooks at the top
  // Event handlers
  // Render logic
  return <div className="tailwind-classes">{/* JSX content */}</div>;
}
```

## Design System

### Color Palette

- Primary: `#8b5e3c` (warm brown)
- Success: `#16a34a` (green)
- Warning: `#f59e0b` (amber)
- Danger: `#ef4444` (red)
- Background: `#faf7f2` (warm white)

### Typography

- Font: Geist Sans (primary), Geist Mono (code)
- Base size: 16px with 1.6 line-height
- Scale: Responsive typography with Tailwind classes

### Spacing & Layout

- Border radius: 10px (`--radius: 0.625rem`)
- Grid system: CSS Grid and Flexbox
- Breakpoints: Mobile-first with sm, md, lg, xl

## API Design

The API design is compatible with the [Open311 standard](https://www.open311.org/) for civic issue reporting, ensuring compatibility with government systems and third-party integrations.

### Report Data Model

```typescript
interface Report {
  id: string; // BLR-XXXX format
  photos?: string[]; // Base64 image data
  lat: number; // Latitude
  lng: number; // Longitude
  address?: string; // Human-readable address
  description?: string; // Optional description
  severity: number; // 1-5 scale
  status: "new" | "acknowledged" | "fixed" | "verified";
  createdAt: number; // Unix timestamp
  verifications: {
    // Community verification counts
    fixed: number;
    notFixed: number;
  };
}
```

### API Endpoints

- `GET /api/reports` - List all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/stats` - Platform statistics
- `GET /api/reports/[id]` - Individual report details

## Key Features Implementation

### 1. Photo Upload

- Multiple file support with drag-and-drop
- Base64 encoding for immediate preview
- EXIF stripping for privacy
- File validation (image types, size limits)

### 2. Location Services

- GPS auto-detection with fallback to manual selection
- OpenStreetMap integration for address lookup
- Interactive map for precise positioning
- Privacy protection with location aggregation

### 3. Real-time Map

- Leaflet.js with custom markers
- Status-based coloring (red/yellow/green/blue)
- Clustering for dense areas
- Responsive design with mobile optimization

### 4. Community Verification

- Anonymous voting system
- Status transitions based on consensus
- Dispute resolution mechanism
- Anti-spam measures with rate limiting

## Security & Privacy

### Data Protection

- No user authentication required
- Anonymous reporting with device fingerprinting
- EXIF data removal from uploaded images
- Location privacy with 10m grid aggregation

### Input Validation

- Client-side validation for UX
- Server-side sanitization for security
- Rate limiting on all endpoints
- File type restrictions for uploads

## Performance Optimization

### Core Web Vitals

- LCP < 2.5s: Optimized image loading and code splitting
- FID < 100ms: Minimal JavaScript execution
- CLS < 0.1: Stable layout with proper sizing

### Optimization Strategies

- Dynamic imports for heavy components (Leaflet)
- Image optimization with Next.js Image component
- Code splitting by route and feature
- SWR caching for API responses

## Testing Guidelines

### Component Testing

- Use React Testing Library for component tests
- Mock external dependencies (Leaflet, geolocation)
- Test user interactions and accessibility
- Verify responsive behavior

### Integration Testing

- Test complete user flows (report → map → verification)
- Mock API responses with realistic data
- Test error states and edge cases
- Verify cross-browser compatibility

## Deployment

### Vercel Configuration

- Static generation for optimal performance
- Edge functions for API routes
- Automatic deployments from main branch
- Environment variables for configuration

### Build Process

- TypeScript compilation with strict checking
- Tailwind CSS purging for minimal bundle
- Image optimization and compression
- Source maps for debugging

## Common Patterns

### Error Handling

```tsx
const { toast } = useToast();

try {
  await submitReport(data);
  toast({ title: "Success", description: "Report submitted" });
} catch (error) {
  toast({
    title: "Error",
    description: "Failed to submit report",
    variant: "destructive",
  });
}
```

### Loading States

```tsx
const { data, isLoading, error } = useSWR("/api/reports", fetcher);

if (isLoading) return <Skeleton className="h-32 w-full" />;
if (error) return <ErrorMessage error={error} />;
return <ReportList reports={data} />;
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid layout */}
</div>
```

## Git Workflow

### Branch Strategy

- `production` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `hotfix/*` - Critical fixes

### Commit Convention

```
feat: add photo upload functionality
fix: resolve map marker positioning issue
docs: update API documentation
style: improve button hover states
refactor: extract map component logic
```

## Troubleshooting

### Common Issues

1. Leaflet not loading: Check CDN availability and CORS settings
2. Geolocation denied: Implement graceful fallback to manual selection
3. Image upload fails: Verify file size limits and MIME types
4. Map not rendering: Ensure container has defined dimensions

### Debug Tools

- React DevTools for component inspection
- SWR DevTools for data fetching debugging
- Browser DevTools for performance analysis
- Vercel Analytics for production monitoring

## Contributing

### Code Quality

- ESLint configuration for code standards
- Prettier for consistent formatting
- TypeScript strict mode for type safety
- Accessibility testing with screen readers
- Follow [WCAG 2.1 AA guidelines](https://www.wcag.com/developers/) for web accessibility

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation if needed
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval
