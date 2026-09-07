/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_OUTPUT === 'export';

const nextConfig = {
  // Output mode: 'export' for static SSG (Netlify/Hostinger static), 'standalone' for Docker/Coolify/VPS
  output: isStaticExport ? 'export' : (process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined),
  
  // Power Next.js with clean trailing slashes if exported statically
  trailingSlash: isStaticExport,
  
  images: {
    // Unoptimized allows local images to load instantly and reliably in both dev and SSG
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Security headers & compression
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
