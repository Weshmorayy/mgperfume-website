import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.brandName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0908',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/images/brand/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
