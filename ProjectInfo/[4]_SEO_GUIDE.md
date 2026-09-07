# [4] SEO, Structured Data & Indexing Guide

## 1. Automated SEO Architecture
The master template is built from the ground up for French local search performance and technical SEO compliance.

### A. Dynamic Metadata Generation (`src/lib/seo.ts`)
The `generatePageMetadata()` helper centralizes meta tags, OpenGraph images, Twitter summaries, canonical URLs, and robots directives:
```typescript
import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'Nos Réalisations & Chantiers',
  description: 'Découvrez notre portfolio de créations sur mesure.',
  path: '/realisations',
});
```

### B. Structured Data JSON-LD (`src/components/seo/SchemaOrg.tsx`)
Injected directly into the root layout `<head>`:
1. **LocalBusiness / Organization**:
   - Company name, SIRET, address, phone, email, price range (`€€€`), opening hours, geo coordinates.
2. **FAQPage Schema**:
   - Automatically maps all items defined in `siteConfig.faq.items` into Google FAQ Rich Snippets.

### C. Dynamic Sitemaps & Robots Handlers
- `src/app/sitemap.ts`: Dynamic XML sitemap pointing to `siteConfig.url`.
- `src/app/robots.ts`: Allows all public crawlers, blocks private `/api/` endpoints, and references the XML sitemap.
- Note: Both files declare `export const dynamic = 'force-static';` to enable seamless static HTML export.

---

## 2. French Local SEO Best Practices
1. **NAP Consistency (Name, Address, Phone)**: Ensure `siteConfig.contact.address` and `siteConfig.contact.phone` match the client's Google Business Profile (Fiche Établissement) identically.
2. **Geographical Keywords**: Include target city, département, and region inside `siteConfig.keywords` and `siteConfig.description`.
3. **Structured Social Proof**: Maintain verified client reviews with 5-star ratings in `siteConfig.testimonials`.
