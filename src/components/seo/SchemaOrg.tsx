import React from 'react';
import { siteConfig } from '@/config/site';

export function SchemaOrg() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: siteConfig.brandName,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.city,
      addressCountry: siteConfig.country,
    },
    priceRange: '25 000 FCFA - 40 000 FCFA',
    currenciesAccepted: 'XOF',
    paymentAccepted: 'Cash, Wave, Orange Money',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
