export type ScentFamily = 'all' | 'gourmand' | 'aquatique' | 'boise' | 'floral' | 'oriental';

export interface PerfumeProduct {
  id: string;
  name: string;
  brand?: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  volume: string;
  image: string;
  family: ScentFamily;
  categoryLabel: string;
  badge?: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  description: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: PerfumeProduct;
  quantity: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
  delay: string;
}

export interface EditorialBanner {
  id: string;
  tag: string;
  title: string;
  image: string;
  alt: string;
  linkText: string;
  href: string;
  bgColor: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface SiteConfig {
  name: string;
  brandName: string;
  tagline: string;
  description: string;
  url: string;
  city: string;
  country: string;
  currency: string;
  contact: {
    phone: string;
    phoneFormatted: string;
    whatsappNumber: string;
    email: string;
    address: string;
    hours: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    whatsappChannel?: string;
  };
  shippingZones: ShippingZone[];
  editorialBanners?: EditorialBanner[];
  faqs?: FAQItem[];
  products: PerfumeProduct[];
}
