# Special Guide: Image Workflow & Asset Optimization

## 1. Directory Structure & Conventions
All static client images must be placed in `public/images/`:

| Directory | Purpose | Example |
| :--- | :--- | :--- |
| `public/images/` | Root general branding assets | `og-default.jpg`, `logo.svg` |
| `public/images/projects/` | Case studies & portfolio photos | `project-haussmann.webp` |
| `public/images/clients/` | Badges, partner emblems, client logos | `qualibat-cert.webp` |
| `public/images/optimized/` | Compressed WebP / AVIF assets | `hero-bg.webp` |

---

## 2. Formatting & Dimension Standards
- **Format**: Always convert photos to `.webp` for maximum compression and performance.
- **Hero Showcase**: `1200 x 900 px` (4:3 ratio, max 150 KB).
- **Portfolio Cards**: `800 x 500 px` (16:10 ratio, max 80 KB).
- **OpenGraph Social Preview**: `1200 x 630 px` (JPG / WebP, max 200 KB).

---

## 3. How to Reference Images
In Next.js components or `src/config/site.ts`, reference images using absolute root paths starting from `/images/`:
```typescript
image: '/images/projects/project-haussmann.webp',
imageAlt: 'Rénovation d’un appartement Haussmannien à Paris',
```
