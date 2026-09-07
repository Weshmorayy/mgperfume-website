# Special Guide: Multi-Platform Deployment Handbook

This guide provides exhaustive, zero-guesswork instructions for deploying static or containerized instances of websites generated from this master template.

---

## 1. Hostinger VPS without Coolify (NGINX Static Export)

### Step 1: Generate Static Export
```bash
NEXT_OUTPUT=export npm run build
```
This produces a 100% static output in `./out/`.

### Step 2: Transfer Files to VPS
```bash
rsync -avz --delete ./out/ user@vps_ip:/var/www/client-site/out/
```

### Step 3: Configure NGINX
Copy the included `nginx.conf` to your VPS `/etc/nginx/sites-available/client-site`:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name client-domain.fr www.client-domain.fr;
    root /var/www/client-site/out;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json image/svg+xml;

    # Next.js Static Caching
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Clean HTML Routing
    location / {
        try_files $uri $uri/ $uri.html /index.html =404;
    }
}
```
Enable the site and reload NGINX:
```bash
sudo ln -s /etc/nginx/sites-available/client-site /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Step 4: Provision SSL with Certbot
```bash
sudo certbot --nginx -d client-domain.fr -d www.client-domain.fr
```

---

## 2. Coolify (Docker Multi-Stage Deployment)

1. **Create Resource**: Select **Application** ➡️ **Public / Private Git Repository**.
2. **Build Pack**: Coolify will automatically detect the root `Dockerfile`.
3. **Environment Variables**:
   - `NEXT_PUBLIC_SITE_URL=https://client-domain.fr`
   - `PORT=3000`
4. **Port Mapping**: Map internal port `3000` to your desired domain in Coolify.
5. **Deploy**: Trigger deployment.

---

## 3. Netlify

1. Connect Git repository.
2. Build Settings:
   - Build Command: `NEXT_OUTPUT=export npm run build`
   - Publish Directory: `out`
3. Environment Variables:
   - `NEXT_PUBLIC_SITE_URL=https://client-domain.fr`

---

## 4. Vercel

1. Import project repository.
2. Framework Preset: `Next.js`.
3. Configure `NEXT_PUBLIC_SITE_URL` in Project Settings.
4. Deploy with zero additional configuration.
