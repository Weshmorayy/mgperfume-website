import type { Metadata, Viewport } from 'next';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { generatePageMetadata } from '@/lib/seo';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0A0908',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = generatePageMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <SchemaOrg />
      </head>
      <body className="min-h-screen bg-[#0A0908] text-[#FBF8F3] antialiased">
        {children}
      </body>
    </html>
  );
}
