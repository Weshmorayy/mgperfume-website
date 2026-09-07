# [3] Code, Architecture & Conventions Guide

## 1. Component Architecture & Rendering Strategy
- **Server Components by Default**: All layout and section components remain React Server Components unless client interactivity is required.
- **Client Components (`'use client'`)**:
  - `src/components/layout/MobileNav.tsx` (drawer state, backdrop, body scroll lock).
  - `src/components/sections/FAQ.tsx` (accordion state toggle).
  - `src/components/sections/ContactForm.tsx` (form submission state & validation).
  - `src/app/error.tsx` (error boundary retry).

---

## 2. Configuration-Driven Philosophy
Do **not** hardcode text, business facts, phone numbers, or URLs inside JSX. All dynamic data must flow from `siteConfig`:

```tsx
import { siteConfig } from '@/config/site';

export function MySection() {
  const { contact } = siteConfig;
  return <a href={`tel:${contact.phone}`}>{contact.phoneDisplay}</a>;
}
```

---

## 3. UI Primitive Specifications (`src/components/ui/`)

### Container (`Container.tsx`)
```tsx
import { Container } from '@/components/ui/Container';
<Container size="lg">{/* content */}</Container>
```
Sizes: `sm` (max-w-3xl), `md` (max-w-5xl), `lg` (max-w-7xl), `xl` (max-w-8xl), `full`.

### Section (`Section.tsx`)
```tsx
import { Section } from '@/components/ui/Section';
<Section id="services" badge="Nos Services" title="Ce que nous faisons" background="subtle">
  {/* children */}
</Section>
```
Background options: `white`, `subtle`, `dark`, `brand`.

### Button (`Button.tsx`)
```tsx
import { Button } from '@/components/ui/Button';
// As a link
<Button href="#contact" variant="primary" size="md">Demander un devis</Button>
// As a button
<Button type="submit" variant="glow" size="lg">Envoyer</Button>
```
Variants: `primary`, `secondary`, `outline`, `ghost`, `glow`.

### Badge (`Badge.tsx`)
```tsx
import { Badge } from '@/components/ui/Badge';
<Badge variant="primary" size="md">Artisanat Certifié</Badge>
```
Variants: `primary`, `secondary`, `outline`, `surface`.

---

## 4. Class Merging Convention
Always merge Tailwind utility classes with `cn()` from `@/lib/utils`:
```tsx
import { cn } from '@/lib/utils';
<div className={cn('base-class', conditional && 'active-class', className)} />
```

---

## 5. Coding Standards & Import Aliases
- Use TypeScript strict mode without `any`.
- Use the `@/*` alias mapped to `./src/*`.
- Standard import order:
  1. React and Next.js built-ins (`react`, `next/image`, `next/link`).
  2. Third-party packages (`lucide-react`, `clsx`).
  3. Internal configuration & types (`@/config/*`, `@/types`).
  4. Internal components (`@/components/*`).
  5. Utilities & styles (`@/lib/*`, CSS).
