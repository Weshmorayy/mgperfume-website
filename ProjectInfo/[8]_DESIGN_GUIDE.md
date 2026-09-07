# [8] Design Tokens, Typography & Image System

## 1. Visual Theme & Design Tokens
All core branding colors are defined as CSS variables in `src/app/globals.css` and exposed via Tailwind classes:

### Brand Palette (Primary)
- `brand-50` to `brand-200`: Subtle tint backgrounds, tag pills, active badges.
- `brand-500` / `brand-600`: Main brand action color, button backgrounds, icons, gradient headlines.
- `brand-700` to `brand-950`: High-contrast text, dark banners, footer backgrounds.

### Surface Palette (Neutrals)
- `surface-50` / `surface-100`: Light background alternating sections.
- `surface-200` / `surface-300`: Border dividers, card outlines, subtle inputs.
- `surface-700` / `surface-800` / `surface-900`: Body text, dark cards, footer containers.

---

## 2. Typography Hierarchy
- **Font Stack**:
  - Headings: `var(--font-heading)` (`Plus Jakarta Sans` / system sans)
  - Body text: `var(--font-sans)` (`Inter` / system sans)
- **Hierarchy Scale**:
  - Hero Headline: `text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight`
  - Section Titles (H2): `text-3xl sm:text-4xl font-extrabold tracking-tight`
  - Card Titles (H3): `text-xl font-bold text-surface-900`
  - Body Text: `text-sm sm:text-base text-surface-600 leading-relaxed`
  - Small / Badges: `text-xs sm:text-sm font-semibold tracking-wide`

---

## 3. Image Workflow Specification
- **Storage Locations**:
  - `public/images/projects/`: Realization photos, before/after case studies.
  - `public/images/clients/`: Partner logos, certification badges, client marks.
  - `public/images/optimized/`: Compressed WebP assets.
  - `public/images/og-default.jpg`: 1200x630px default social share card.
- **Image Formatting Rules**:
  - Hero visual: 1200 x 900 px (4:3 aspect ratio, WebP format recommended)
  - Portfolio items: 800 x 500 px (16:10 aspect ratio, WebP format recommended)
  - Always provide meaningful French `alt` descriptions in `src/config/site.ts`.
