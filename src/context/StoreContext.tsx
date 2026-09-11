'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PerfumeProduct, EditorialBanner, ShippingZone, FAQItem, SiteConfig, Order, OrderStatus, PaymentStatus } from '@/types';
import { siteConfig } from '@/config/site';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface StoreContextType {
  products: PerfumeProduct[];
  banners: EditorialBanner[];
  shippingZones: ShippingZone[];
  faqs: FAQItem[];
  contact: SiteConfig['contact'];
  social: SiteConfig['social'];
  heroProduct: PerfumeProduct;
  selectionDuMoment: PerfumeProduct[];
  orders: Order[];
  isLoading: boolean;
  refreshStore: () => Promise<void>;
  saveProduct: (product: PerfumeProduct) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  setHeroProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleSelectionDuMoment: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveOrder: (order: Order) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (id: string, order_status: OrderStatus, payment_status?: PaymentStatus) => Promise<{ success: boolean; error?: string }>;
  deleteOrder: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<PerfumeProduct[]>(siteConfig.products);
  const [banners, setBanners] = useState<EditorialBanner[]>(siteConfig.editorialBanners || []);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(siteConfig.shippingZones);
  const [faqs, setFaqs] = useState<FAQItem[]>(siteConfig.faqs || []);
  const [contact, setContact] = useState<SiteConfig['contact']>(siteConfig.contact);
  const [social, setSocial] = useState<SiteConfig['social']>(siteConfig.social);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to normalize DB product to PerfumeProduct
  const mapDbProduct = (row: any): PerfumeProduct => {
    const heroId = (() => { try { return localStorage.getItem('mg_hero_product_id'); } catch { return null; } })();
    return {
      id: row.id,
      name: row.name,
      brand: row.brand || 'MG Perfume',
      tagline: row.tagline || '',
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      volume: row.volume || '100 ml',
      image: row.image,
      family: row.family || 'oriental',
      categoryLabel: row.category_label || 'Eau de Parfum',
      badge: row.badge || undefined,
      topNotes: Array.isArray(row.top_notes) ? row.top_notes : [],
      heartNotes: Array.isArray(row.heart_notes) ? row.heart_notes : [],
      baseNotes: Array.isArray(row.base_notes) ? row.base_notes : [],
      description: row.description || '',
      isPopular: Boolean(row.is_popular),
      isHero: heroId ? row.id === heroId : Boolean(row.is_hero),
    };
  };

  // Helper to format PerfumeProduct for DB
  // NOTE: is_hero is NOT sent to DB (column may not exist) — tracked in localStorage
  const formatProductForDb = (p: PerfumeProduct) => ({
    id: p.id,
    name: p.name,
    brand: p.brand || 'MG Perfume',
    tagline: p.tagline || '',
    price: p.price,
    original_price: p.originalPrice || null,
    volume: p.volume || '100 ml',
    image: p.image,
    family: p.family || 'oriental',
    category_label: p.categoryLabel || 'Eau de Parfum',
    badge: p.badge || null,
    top_notes: p.topNotes || [],
    heart_notes: p.heartNotes || [],
    base_notes: p.baseNotes || [],
    description: p.description || '',
    is_popular: Boolean(p.isPopular),
  });

  // Load from LocalStorage Cache first, then fetch live from Supabase
  const refreshStore = useCallback(async () => {
    // 1. Try local storage cache for instant rendering
    try {
      const cached = localStorage.getItem('mg_store_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.products && Array.isArray(parsed.products)) setProducts(parsed.products);
        if (parsed.banners && Array.isArray(parsed.banners)) setBanners(parsed.banners);
        if (parsed.shippingZones && Array.isArray(parsed.shippingZones)) setShippingZones(parsed.shippingZones);
        if (parsed.faqs && Array.isArray(parsed.faqs)) setFaqs(parsed.faqs);
      }
      const cachedOrders = localStorage.getItem('mg_orders_cache');
      if (cachedOrders) {
        const parsedOrders = JSON.parse(cachedOrders);
        if (Array.isArray(parsedOrders)) setOrders(parsedOrders);
      }
    } catch (_) {}

    // 2. Fetch live data from Supabase
    if (supabase && isSupabaseConfigured) {
      try {
        const [
          { data: dbProds, error: prodErr },
          { data: dbBanners, error: bannerErr },
          { data: dbShipping, error: shipErr },
          { data: dbFaqs, error: faqErr },
        ] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('editorial_banners').select('*').order('display_order', { ascending: true }),
          supabase.from('shipping_zones').select('*'),
          supabase.from('faqs').select('*').order('display_order', { ascending: true }),
        ]);

        if (!prodErr && dbProds && dbProds.length > 0) {
          const mapped = dbProds.map(mapDbProduct);
          setProducts(mapped);
        }

        if (!bannerErr && dbBanners && dbBanners.length > 0) {
          const mappedBanners: EditorialBanner[] = dbBanners.map(b => ({
            id: b.id,
            tag: b.tag,
            title: b.title,
            image: b.image,
            alt: b.alt || 'Bannière MG Perfume',
            linkText: b.link_text || 'Découvrir',
            href: b.href || '/boutique',
            bgColor: b.bg_color || '#171513',
            objectPosition: b.object_position || 'center',
          }));
          setBanners(mappedBanners);
        }

        if (!shipErr && dbShipping && dbShipping.length > 0) {
          setShippingZones(dbShipping);
        }

        if (!faqErr && dbFaqs && dbFaqs.length > 0) {
          setFaqs(dbFaqs.map(f => ({ q: f.q, a: f.a })));
        }

        // Fetch orders (fail silently if table not yet created)
        try {
          const { data: dbOrders, error: orderErr } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (!orderErr && dbOrders) {
            setOrders(dbOrders);
            try { localStorage.setItem('mg_orders_cache', JSON.stringify(dbOrders)); } catch (_) {}
          }
        } catch (_) {}
      } catch (err) {
        console.warn('Supabase fetch error, fallback to defaults:', err);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  // Persist cache to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'mg_store_cache',
        JSON.stringify({ products, banners, shippingZones, faqs, contact, social })
      );
    } catch (_) {}
  }, [products, banners, shippingZones, faqs, contact, social]);

  useEffect(() => {
    try {
      localStorage.setItem('mg_orders_cache', JSON.stringify(orders));
    } catch (_) {}
  }, [orders]);

  // Save product directly to Supabase & State
  const saveProduct = async (product: PerfumeProduct) => {
    try {
      setProducts(prev => {
        const index = prev.findIndex(p => p.id === product.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = product;
          return next;
        }
        return [product, ...prev];
      });

      if (supabase) {
        const dbPayload = formatProductForDb(product);
        const { error } = await supabase.from('products').upsert(dbPayload, { onConflict: 'id' });
        if (error) throw error;
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error saving product to Supabase:', err);
      return { success: false, error: err.message || 'Erreur d’enregistrement' };
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      setProducts(prev => prev.filter(p => p.id !== id));

      if (supabase) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error deleting product from Supabase:', err);
      return { success: false, error: err.message || 'Erreur de suppression' };
    }
  };

  // Set Édition Phare (1 slot strict) — tracked in localStorage (DB column may not exist)
  const setHeroProduct = async (id: string) => {
    try {
      try { localStorage.setItem('mg_hero_product_id', id); } catch (_) {}
      setProducts(prev => prev.map(p => ({ ...p, isHero: p.id === id })));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Toggle Sélection du Moment (min 2, max 4 slots)
  const toggleSelectionDuMoment = async (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return { success: false, error: 'Produit introuvable' };

    const currentPopularCount = products.filter(p => p.isPopular).length;
    const isCurrentlyPopular = Boolean(target.isPopular);

    if (isCurrentlyPopular && currentPopularCount <= 2) {
      return { 
        success: false, 
        error: 'Minimum 2 parfums requis dans la "Sélection du Moment". Veuillez en ajouter un autre avant de retirer celui-ci.' 
      };
    }

    if (!isCurrentlyPopular && currentPopularCount >= 4) {
      return { 
        success: false, 
        error: 'Limite de 4 parfums atteinte pour la "Sélection du Moment". Veuillez en désélectionner un pour faire de la place.' 
      };
    }

    const updatedProduct = { ...target, isPopular: !isCurrentlyPopular };
    return saveProduct(updatedProduct);
  };

  // Save / Register Order
  const saveOrder = async (order: Order) => {
    try {
      setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
      try {
        const cached = localStorage.getItem('mg_orders_cache');
        const list = cached ? JSON.parse(cached) : [];
        localStorage.setItem('mg_orders_cache', JSON.stringify([order, ...list.filter((o: any) => o.id !== order.id)]));
      } catch (_) {}

      if (supabase) {
        const dbPayload = {
          id: order.id,
          ref_command: order.ref_command,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          shipping_zone_id: order.shipping_zone_id,
          shipping_zone_name: order.shipping_zone_name,
          shipping_cost: order.shipping_cost,
          subtotal: order.subtotal,
          total_amount: order.total_amount,
          items: order.items,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          order_status: order.order_status,
          paytech_token: order.paytech_token || null,
          paytech_redirect_url: order.paytech_redirect_url || null,
          notes: order.notes || '',
        };
        const { error } = await supabase.from('orders').upsert(dbPayload, { onConflict: 'id' });
        if (error) {
          console.warn('Erreur Supabase sauvegarde commande (table non créée ?):', error.message);
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('Erreur saveOrder:', err);
      return { success: false, error: err.message };
    }
  };

  // Update Order Status
  const updateOrderStatus = async (id: string, order_status: OrderStatus, payment_status?: PaymentStatus) => {
    try {
      setOrders(prev =>
        prev.map(o =>
          o.id === id
            ? { ...o, order_status, ...(payment_status ? { payment_status } : {}), updated_at: new Date().toISOString() }
            : o
        )
      );

      if (supabase) {
        const updatePayload: any = {
          order_status,
          updated_at: new Date().toISOString(),
        };
        if (payment_status) updatePayload.payment_status = payment_status;

        const { error } = await supabase.from('orders').update(updatePayload).eq('id', id);
        if (error) throw error;
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Delete Order
  const deleteOrder = async (id: string) => {
    try {
      setOrders(prev => prev.filter(o => o.id !== id));
      if (supabase) {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const heroProduct = products.find(p => p.isHero) || products[0] || siteConfig.products[0];
  const popularList = products.filter(p => p.isPopular);
  const selectionDuMoment = popularList.length >= 2 ? popularList : products.slice(0, 4);

  return (
    <StoreContext.Provider
      value={{
        products,
        banners,
        shippingZones,
        faqs,
        contact,
        social,
        heroProduct,
        selectionDuMoment,
        orders,
        isLoading,
        refreshStore,
        saveProduct,
        deleteProduct,
        setHeroProduct,
        toggleSelectionDuMoment,
        saveOrder,
        updateOrderStatus,
        deleteOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
