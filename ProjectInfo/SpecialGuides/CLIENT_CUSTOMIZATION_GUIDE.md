# Special Guide: 30-Minute Client Customization Handbook

Follow this checklist to transform this master template into a fully customized, client-ready website in under 30 minutes.

---

## Step 1: Duplicate & Setup Repository (2 mins)
```bash
cp -r website-template client-mon-entreprise
cd client-mon-entreprise
npm install
```

---

## Step 2: Configure Client Information (15 mins)
Open `src/config/site.ts` and fill in:
1. **Identity & Legal**:
   - `name`, `shortName`, `domain`, `url`
   - `legal.companyName`, `legal.siret`, `legal.rcsCity`, `legal.directorPublication`
2. **Contact Coordinates**:
   - `contact.phone`, `contact.phoneDisplay`, `contact.email`
   - `contact.address` (street, city, postal code)
   - `contact.openingHours`
3. **Hero & Value Proposition**:
   - `hero.badge`, `hero.title`, `hero.titleHighlight`, `hero.subtitle`
4. **Content Sections**:
   - `services.items`: 4–6 client services with appropriate Lucide icons.
   - `portfolio.items`: 3–6 real client realization summaries.
   - `testimonials.items`: 3–5 real customer reviews.
   - `faq.items`: 4–6 client specific questions & answers.

---

## Step 3: Brand Colors & Design Tokens (5 mins)
If the client has a specific brand color palette:
1. Open `src/app/globals.css`.
2. Update the `--brand-50` to `--brand-950` CSS variables with their hex codes.

---

## Step 4: Replace Images (5 mins)
1. Add client project photos to `public/images/projects/`.
2. Add partner/certification logos to `public/images/clients/`.
3. Add a 1200x630px social card to `public/images/og-default.jpg`.

---

## Step 5: Test & Validate (3 mins)
```bash
npm run type-check
NEXT_OUTPUT=export npm run build
```
Verify that `out/` is generated cleanly without errors.
