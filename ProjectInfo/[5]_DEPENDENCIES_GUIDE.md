# [5] Dependencies & Configuration Guide

## 1. Dependency Rationale & Package Audit
This template enforces a strict minimal-dependency philosophy to achieve sub-second load times and zero supply-chain bloat.

### Production Dependencies
| Package | Version | Justification |
| :--- | :--- | :--- |
| `next` | `^15.2.1` | Core React framework, App Router, SSG export engine |
| `react` / `react-dom` | `^19.0.0` | React core library |
| `lucide-react` | `^1.16.0` | Standardized SVG icon set (tree-shakeable) |
| `clsx` | `^2.1.1` | Lightweight conditional className utility |
| `tailwind-merge` | `^3.0.2` | Conflict-free Tailwind class resolution |

### Dev Dependencies
| Package | Version | Justification |
| :--- | :--- | :--- |
| `tailwindcss` | `^3.4.17` | Utility-first CSS generation |
| `postcss` / `autoprefixer`| `^8.5.3` / `^10.4.20` | CSS processing and vendor prefixing |
| `typescript` | `^5.8.2` | Static type safety and developer productivity |
| `@types/*` | `^19.x` / `^22.x` | TypeScript type definitions |

---

## 2. Configuration Inventory
- `next.config.mjs`: Handles output mode (`export` vs `standalone`), trailing slash rules, image optimization bypass for static hosting, and security headers.
- `tailwind.config.ts`: Defines custom theme extensions, brand tokens (`brand-*`, `surface-*`), and keyframe animations (`fade-in`, `fade-up`).
- `tsconfig.json`: Strict TypeScript settings with ES2022 target and path aliases (`@/*`).
- `Dockerfile`: Multi-stage build (Alpine Node 20) generating an unprivileged production runner for Coolify and VPS containers.
- `nginx.conf`: NGINX web server configuration with Brotli/Gzip compression, aggressive caching for `/_next/static/`, and clean routing for static exports.
