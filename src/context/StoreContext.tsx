'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PerfumeProduct, EditorialBanner, ShippingZone, FAQItem, SiteConfig, Order, OrderStatus, PaymentStatus } from '@/types';
import { siteConfig } from '@/config/site';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isTestOrder } from '@/lib/testOrder';

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
  freeForAllDelivery: boolean;
  refreshStore: () => Promise<void>;
  saveProduct: (product: PerfumeProduct) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  setHeroProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleSelectionDuMoment: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveOrder: (order: Order, honeypot?: string) => Promise<{ success: boolean; error?: string; order?: Order }>;
  saveDeliverySettings: (freeForAll: boolean) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (id: string, order_status: OrderStatus, payment_status?: PaymentStatus) => Promise<{ success: boolean; error?: string }>;
  deleteOrder: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (contact: SiteConfig['contact'], social: SiteConfig['social']) => Promise<{ success: boolean; error?: string }>;
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
  const [freeForAllDelivery, setFreeForAllDelivery] = useState(
    siteConfig.delivery?.freeForAll ?? true
  );
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
      inStock: row.in_stock !== false,
      isArchived: Boolean(row.is_archived),
      freeDelivery: Boolean(row.free_delivery),
      createdAt: row.created_at || undefined,
    };
  };

  // Helper to format PerfumeProduct for DB
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
    in_stock: p.inStock !== false,
    is_archived: Boolean(p.isArchived),
    free_delivery: Boolean(p.freeDelivery),
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
        if (parsed.contact) setContact(parsed.contact);
        if (parsed.social) setSocial(parsed.social);
        if (typeof parsed.freeForAllDelivery === 'boolean') setFreeForAllDelivery(parsed.freeForAllDelivery);
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
          { data: dbSettings, error: settingsErr },
        ] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: true }),
          supabase.from('editorial_banners').select('*').order('display_order', { ascending: true }),
          supabase.from('shipping_zones').select('*'),
          supabase.from('faqs').select('*').order('display_order', { ascending: true }),
          supabase.from('site_settings').select('*').eq('id', 'main').single(),
        ]);

        if (!settingsErr && dbSettings) {
          if (dbSettings.contact) setContact(dbSettings.contact);
          if (dbSettings.social) setSocial(dbSettings.social);
          if (dbSettings.delivery && typeof dbSettings.delivery.freeForAll === 'boolean') {
            setFreeForAllDelivery(dbSettings.delivery.freeForAll);
          }
        }

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

        // Commandes : table privée (RLS). Sans session administrateur, PostgREST
        // renvoie [] — et écrire ce [] dans le cache effacerait l'historique
        // local du client, donc sa page de confirmation. On ne lit donc les
        // commandes QUE si une session est ouverte, et on n'écrase jamais le
        // cache par une liste vide.
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            const { data: dbOrders, error: orderErr } = await supabase
              .from('orders')
              .select('*')
              .order('created_at', { ascending: false });

            if (!orderErr && dbOrders && dbOrders.length > 0) {
              setOrders(dbOrders);
              try { localStorage.setItem('mg_orders_cache', JSON.stringify(dbOrders)); } catch (_) {}
            }
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
        JSON.stringify({ products, banners, shippingZones, faqs, contact, social, freeForAllDelivery })
      );
    } catch (_) {}
  }, [products, banners, shippingZones, faqs, contact, social, freeForAllDelivery]);

  useEffect(() => {
    // Ne jamais écraser le cache par une liste vide : au premier rendu `orders`
    // vaut [] avant la lecture du cache, et un résultat vide peut aussi venir
    // d'un refus RLS. Écrire ce [] effacerait la commande que le client vient
    // de passer — donc sa page de confirmation.
    if (orders.length === 0) return;
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

  // Save / Register Order — passe par le RPC create_order (prix et livraison recalculés côté serveur)
  const saveOrder = async (order: Order, honeypot?: string) => {
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.rpc('create_order', {
          p_items: order.items,
          p_customer_name: order.customer_name,
          p_customer_phone: order.customer_phone,
          p_customer_address: order.customer_address,
          p_shipping_zone_id: order.shipping_zone_id,
          p_payment_method: order.payment_method,
          p_notes: order.notes || null,
          p_honeypot: honeypot || null,
        });

        if (error) {
          console.warn('Commande refusée par le serveur:', error.message);
          return { success: false, error: error.message };
        }

        const row: any = Array.isArray(data) ? data[0] : data;
        if (!row) {
          return { success: false, error: 'Commande non confirmée par le serveur.' };
        }

        const confirmed: Order = {
          ...order,
          id: row.order_id,
          ref_command: row.ref_command,
          subtotal: Number(row.subtotal),
          shipping_cost: Number(row.shipping_cost),
          total_amount: Number(row.total_amount),
        };

        setOrders(prev => [confirmed, ...prev.filter(o => o.id !== confirmed.id)]);
        try {
          const cached = localStorage.getItem('mg_orders_cache');
          const list = cached ? JSON.parse(cached) : [];
          localStorage.setItem('mg_orders_cache', JSON.stringify([confirmed, ...list.filter((o: any) => o.id !== confirmed.id)]));
        } catch (_) {}

        return { success: true, order: confirmed };
      }

      // Repli hors ligne (Supabase non configuré) : on conserve l'objet local
      setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
      return { success: true, order };
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

  // Delete Order — réservé aux commandes de test.
  //
  // Défense en profondeur : l'admin masque déjà le bouton pour les vraies
  // commandes (voir isTestOrder dans src/lib/testOrder.ts), mais une règle
  // uniquement dans l'interface se contourne en une ligne dans la console du
  // navigateur. On revérifie donc ici, contre l'état `orders` courant, avant
  // d'envoyer quoi que ce soit à Supabase : une commande client ne peut pas
  // partir sur un simple appel `deleteOrder(id)`.
  const deleteOrder = async (id: string) => {
    try {
      const target = orders.find(o => o.id === id);
      if (!target) {
        return { success: false, error: 'Commande introuvable : rechargez la page avant de réessayer.' };
      }
      if (!isTestOrder(target)) {
        return {
          success: false,
          error: 'Suppression refusée : seule une commande de test peut être supprimée. Une commande client est la preuve de la vente.',
        };
      }

      // Une suppression RLS renvoie volontiers `{ data: null, error: null }`
      // quand la policy refuse l'opération. Sans `Prefer: return=representation`
      // et sans lecture du résultat, on annoncerait « supprimée » sur une
      // commande toujours en base. On exige donc de voir la ligne supprimée.
      if (supabase) {
        const { data, error } = await supabase
          .from('orders')
          .delete({ count: 'exact' })
          .eq('id', id)
          .select('id');

        if (error) throw error;

        if (!data || data.length === 0) {
          return {
            success: false,
            error: 'Aucune ligne supprimée : la base a refusé l’opération (droits insuffisants). La commande est toujours là.',
          };
        }
      }

      setOrders(prev => prev.filter(o => o.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Update Site Contact & Social Settings

  const updateSettings = async (newContact: SiteConfig['contact'], newSocial: SiteConfig['social']) => {
    try {
      setContact(newContact);
      setSocial(newSocial);
      if (supabase) {
        await supabase.from('site_settings').upsert({ id: 'main', contact: newContact, social: newSocial });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Livraison offerte pour tous les produits (réglage global)
  const saveDeliverySettings = async (freeForAll: boolean) => {
    try {
      setFreeForAllDelivery(freeForAll);
      if (supabase && isSupabaseConfigured) {
        const { data: current } = await supabase
          .from('site_settings')
          .select('delivery')
          .eq('id', 'main')
          .single();
        const nextDelivery = { ...(current?.delivery || {}), freeForAll };
        const { error } = await supabase
          .from('site_settings')
          .upsert({ id: 'main', delivery: nextDelivery });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      setFreeForAllDelivery(!freeForAll);
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
        freeForAllDelivery,
        refreshStore,
        saveProduct,
        deleteProduct,
        setHeroProduct,
        toggleSelectionDuMoment,
        saveOrder,
        updateOrderStatus,
        deleteOrder,
        updateSettings,
        saveDeliverySettings,
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
