import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

interface PageSeoProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  image,
  noIndex = false,
}: PageSeoProps = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.brandName}` : siteConfig.name;
  const pageDescription = description || siteConfig.description;
  const pageImage = image ? `${siteConfig.url}${image}` : `${siteConfig.url}/images/brand/logo.png`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: siteConfig.url,
      siteName: siteConfig.brandName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: siteConfig.brandName,
        },
      ],
      type: 'website',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}
