# Issue [003]: Mobile Android Session Reset & Next.js Local Origin Detection

- **Date & Time**: 11-09-2026 11:15
- **Severity**: Medium
- **Category**: Auth & PayTech Gateway
- **Status**: Resolved

## 1. Symptom & Error Log
1. **Admin Session Reset**: On mobile browsers and pull-to-refresh, refreshing the admin panel reset `isAuthenticated` to false, kicking the user back to the login screen.
2. **PayTech Redirection**: Clicking "Payer en ligne" in local dev redirected to `https://0.0.0.0:3000/commande-confirmee` instead of the domain `https://www.mg-perfume.com`.

## 2. Root Cause
1. `sessionStorage` in mobile browsers is volatile across refreshes and background tab switching, and `isAuthenticated` was initialized to false without an async checking state, causing a login flash.
2. `req.nextUrl.origin` on 0.0.0.0 hosts resolved to 0.0.0.0 instead of prioritizing `NEXT_PUBLIC_SITE_URL`.

## 3. Solution & Code Diff
1. Upgraded admin auth to check both `localStorage` and `sessionStorage` with an `isAuthChecking` loader to prevent login screen flicker.
2. Priority-ordered origin detection:
```diff
- const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://mgperfume.sn';
+ const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || 'https://www.mg-perfume.com';
```

## 4. Prevention & Rules
- Always persist administrative dashboard states and active tabs in `localStorage`.
- Set canonical URLs using environment variables as primary fallback in server-side API routes.
