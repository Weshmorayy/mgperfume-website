# Issue [001]: Static Export Failure on Metadata Routes

- **Date & Time**: 28-08-2026 08:25
- **Severity**: Medium
- **Category**: Next.js Build / Static HTML Export
- **Status**: Resolved

## 1. Symptom & Error Log
When running `NEXT_OUTPUT=export npm run build`, Next.js exited with code 1:
```text
Error: export const dynamic = "force-static"/export const revalidate not configured on route "/manifest.webmanifest" with "output: export".
[Error: Failed to collect page data for /manifest.webmanifest]
```

## 2. Root Cause
In Next.js 15 App Router, dynamic route handlers such as `manifest.ts`, `sitemap.ts`, and `robots.ts` default to dynamic server execution unless explicitly tagged as static when `output: 'export'` is active.

## 3. Solution & Code Diff
Added `export const dynamic = 'force-static';` to all route handlers:
- `src/app/manifest.ts`
- `src/app/sitemap.ts`
- `src/app/robots.ts`

```diff
+ export const dynamic = 'force-static';
  export default function manifest(): MetadataRoute.Manifest { ... }
```

## 4. Prevention & Rules
Whenever adding new route handlers (`route.ts`, `sitemap.ts`, `robots.ts`, etc.) to this master template, always declare `export const dynamic = 'force-static'` to ensure compatibility with both static SSG export and standalone server builds.
