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
  isHero?: boolean;
  inStock?: boolean;
}

export type PaymentMethod = 'paytech' | 'whatsapp' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  ref_command: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  shipping_zone_id: string;
  shipping_zone_name: string;
  shipping_cost: number;
  subtotal: number;
  total_amount: number;
  items: OrderItem[];
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  paytech_token?: string;
  paytech_redirect_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteBackup {
  id: string;
  backup_name: string;
  products_data: PerfumeProduct[];
  banners_data: EditorialBanner[];
  shipping_data: ShippingZone[];
  faqs_data: FAQItem[];
  contact_data: SiteConfig['contact'];
  social_data: SiteConfig['social'];
  created_at?: string;
  updated_at?: string;
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
  objectPosition?: string;
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
