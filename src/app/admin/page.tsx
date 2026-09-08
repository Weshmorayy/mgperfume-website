'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Lock, 
  KeyRound, 
  Sparkles, 
  Package, 
  Image as ImageIcon, 
  Truck, 
  HelpCircle, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  AlertCircle, 
  Eye, 
  ArrowLeft, 
  Percent, 
  Tag, 
  Phone, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  LogOut,
  Search,
  LayoutGrid,
  List,
  Upload,
  Sun,
  Moon,
  AlertTriangle,
  X,
  Menu,
  ChevronRight,
  Database,
  CloudUpload,
  RefreshCw
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PerfumeProduct, EditorialBanner, ShippingZone, FAQItem, ScentFamily } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function AdminDashboardPage() {
  // Theme Toggle: default is 'light' (clean luxury cream white), switchable to 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Authentication State with @mgperfume.store
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Drawer Menu State (Portal level slide-in drawer from right side)
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Active Tab & Unsaved Changes Detection
  const [activeTab, setActiveTab] = useState<'products' | 'promotions' | 'banners' | 'shipping' | 'faq' | 'supabase' | 'settings'>('products');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<string | null>(null);

  // Products View Mode: 'cards' or 'list'
  const [productsViewMode, setProductsViewMode] = useState<'cards' | 'list'>('cards');

  // Editable States
  const [products, setProducts] = useState<PerfumeProduct[]>(siteConfig.products);
  const [banners, setBanners] = useState<EditorialBanner[]>(siteConfig.editorialBanners || []);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(siteConfig.shippingZones);
  const [faqs, setFaqs] = useState<FAQItem[]>(siteConfig.faqs || []);
  const [contactInfo, setContactInfo] = useState(siteConfig.contact);
  const [socialInfo, setSocialInfo] = useState(siteConfig.social);

  // Supabase Sync State
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<PerfumeProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Image Upload Ref for direct file selection
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [activeBannerIndexForUpload, setActiveBannerIndexForUpload] = useState<number | null>(null);

  // Global Feedback Message
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isNavDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavDrawerOpen]);

  // Check Local Auth Session
  useEffect(() => {
    const session = sessionStorage.getItem('mg_admin_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    // Required domain: @mgperfume.store (or admin)
    const isStoreEmail = cleanEmail.endsWith('@mgperfume.store') || cleanEmail === 'admin';
    const isCorrectPassword = cleanPass === 'MGPerfume@2026!' || cleanPass === 'DakarParfum2026' || cleanPass === '2026';

    if (isStoreEmail && isCorrectPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('mg_admin_auth', 'true');
      setAuthError('');
    } else {
      if (!isStoreEmail) {
        setAuthError('Veuillez utiliser votre adresse officielle avec l’extension @mgperfume.store (ex: contact@mgperfume.store).');
      } else {
        setAuthError('Mot de passe incorrect.');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsNavDrawerOpen(false);
    sessionStorage.removeItem('mg_admin_auth');
  };

  const showFeedback = (msg: string) => {
    setSaveMessage(msg);
    setHasUnsavedChanges(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Safe Tab Switcher with Unsaved Warning
  const handleTabClick = (tab: typeof activeTab) => {
    setIsNavDrawerOpen(false);
    if (hasUnsavedChanges && tab !== activeTab) {
      setPendingTabSwitch(tab);
    } else {
      setActiveTab(tab);
    }
  };

  // Product Image Upload (Convert to base64 preview)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({
          ...editingProduct,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Banner Image Upload
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeBannerIndexForUpload !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBanners(prev => prev.map((b, i) => i === activeBannerIndexForUpload ? { ...b, image: reader.result as string } : b));
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct({
      id: `product-${Date.now()}`,
      name: '',
      brand: 'MG Perfume',
      tagline: '',
      price: 25000,
      originalPrice: undefined,
      volume: '100 ml',
      image: '/images/products/khamrah-waha.jpg',
      family: 'oriental',
      categoryLabel: 'Eau de Parfum',
      badge: '',
      topNotes: ['Note de tête 1', 'Note de tête 2'],
      heartNotes: ['Note de cœur 1', 'Note de cœur 2'],
      baseNotes: ['Note de fond 1', 'Note de fond 2'],
      description: '',
      isPopular: false,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts(prev => {
      const index = prev.findIndex(p => p.id === editingProduct.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = editingProduct;
        return next;
      }
      return [editingProduct, ...prev];
    });

    setIsProductModalOpen(false);
    setEditingProduct(null);
    setHasUnsavedChanges(true);
    showFeedback('Parfum enregistré');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce parfum du catalogue ?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setHasUnsavedChanges(true);
      showFeedback('Parfum supprimé');
    }
  };

  // Banner Handlers (Max 6 banners limit)
  const handleAddBanner = () => {
    if (banners.length >= 6) {
      alert('Limite maximale de 6 bannières atteinte.');
      return;
    }
    const newBanner: EditorialBanner = {
      id: `banner-${Date.now()}`,
      tag: 'Nouvelle Collection',
      title: 'TITRE DE LA BANNIÈRE',
      image: '/images/shooting/naimez-que-moi-model.jpg',
      alt: 'Nouvelle bannière shooting',
      linkText: 'Découvrir',
      href: '/boutique',
      bgColor: '#171513',
      objectPosition: 'center',
    };
    setBanners(prev => [...prev, newBanner]);
    setHasUnsavedChanges(true);
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Voulez-vous supprimer cette bannière de shooting ?')) {
      setBanners(prev => prev.filter(b => b.id !== id));
      setHasUnsavedChanges(true);
      showFeedback('Bannière supprimée');
    }
  };

  // Sync to Supabase Cloud
  const handleSyncSupabase = async () => {
    if (!supabase) {
      alert('Supabase n’est pas configuré. Veuillez renseigner vos variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env.');
      return;
    }

    setIsSyncingSupabase(true);
    try {
      // Upsert products table
      const { error: prodError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'id' });

      if (prodError) throw prodError;

      showFeedback('Catalogue synchronisé avec Supabase Cloud !');
    } catch (err: any) {
      alert(`Erreur lors de la synchronisation Supabase: ${err.message || err}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // ----------------------------------------------------
  // LOGIN SCREEN (White default or Dark with @mgperfume.store)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#171513] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-white border border-[#E8DCC2] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 text-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C59B3F] to-transparent" />

          <div className="relative w-16 h-16 mx-auto">
            <Image
              src="/images/brand/logo.png"
              alt="MG Perfume Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="space-y-1">
            <h1 className="font-luxury text-2xl font-bold uppercase tracking-widest text-[#171513]">
              Administration
            </h1>
            <p className="text-xs text-[#6B655E]">
              MG Perfume • Authentification <strong>@mgperfume.store</strong>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-[#967120] uppercase tracking-wider block mb-1.5">
                Email Professionnel (@mgperfume.store)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9E968D] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="contact@mgperfume.store (ou admin)"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] text-xs focus:outline-none focus:border-[#C59B3F] focus:bg-white transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#967120] uppercase tracking-wider block mb-1.5">
                Mot de Passe Sécurisé
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#9E968D] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] text-xs focus:outline-none focus:border-[#C59B3F] focus:bg-white transition-all"
                />
              </div>
              <p className="text-[10px] text-[#9E968D] mt-1">
                Accès de démonstration : <strong>admin</strong> / <strong>2026</strong> ou <strong>MGPerfume@2026!</strong>
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Connexion au Dashboard</span>
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#6B655E] hover:text-[#171513] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retourner sur la boutique</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Theme-dependent styles (White default)
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-[#110F0D] text-[#FAF8F5]' : 'bg-[#FAF8F5] text-[#171513]';
  const cardBgClass = isDark ? 'bg-[#171513] border-[#C59B3F]/20' : 'bg-white border-[#E8DCC2] shadow-xs';
  const subCardBg = isDark ? 'bg-[#221F1B] border-white/10' : 'bg-[#FAF8F5] border-[#E8DCC2]';
  const inputBg = isDark ? 'bg-[#171513] border-white/10 text-white' : 'bg-white border-[#E8DCC2] text-[#171513]';

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* Top Header Bar */}
      <header className={`sticky top-0 z-30 ${isDark ? 'bg-[#171513]/95 border-[#C59B3F]/20' : 'bg-white/95 border-[#E8DCC2] shadow-xs'} backdrop-blur-md border-b px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image src="/images/brand/logo.png" alt="MG Perfume" fill className="object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-luxury text-sm sm:text-base font-bold uppercase tracking-wider">
                MG Perfume
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C59B3F]/20 text-[#967120] border border-[#C59B3F]/40 uppercase">
                Admin
              </span>
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="hidden sm:inline">Modifications non enregistrées</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-full border transition-colors ${isDark ? 'bg-[#221F1B] border-white/10 text-[#F3E5AB] hover:text-white' : 'bg-[#FAF8F5] border-[#E8DCC2] text-[#171513]'}`}
            title={`Basculer en mode ${isDark ? 'clair' : 'sombre'}`}
            aria-label="Changer le thème"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#171513]" />}
          </button>

          <Link
            href="/"
            target="_blank"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${isDark ? 'bg-[#221F1B] border-[#C59B3F]/30 text-[#F3E5AB] hover:text-white' : 'bg-[#FAF8F5] border-[#E8DCC2] text-[#171513] hover:text-[#967120]'}`}
          >
            <Eye className="w-3.5 h-3.5 text-[#C59B3F]" />
            <span>Voir le site</span>
          </Link>

          {/* Drawer Trigger Button */}
          <button
            onClick={() => setIsNavDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white text-xs font-bold transition-all shadow-xs"
            aria-label="Ouvrir le menu de navigation admin"
          >
            <Menu className="w-4 h-4 text-[#C59B3F]" />
            <span className="hidden sm:inline">Onglets & Modules</span>
          </button>
        </div>
      </header>

      {/* PORTAL-LEVEL RIGHT-SIDE DRAWER (Rule 7.2: Root level !z-[999999], scroll locked, includes Logout) */}
      {isNavDrawerOpen && (
        <div className="fixed inset-0 !z-[999999] overflow-hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsNavDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-xs border-l flex flex-col justify-between shadow-2xl p-6 relative z-10 animate-in slide-in-from-right duration-300 ${isDark ? 'bg-[#171513] border-[#C59B3F]/30 text-white' : 'bg-white border-[#E8DCC2] text-[#171513]'}`}>
              
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#E8DCC2]">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8">
                      <Image src="/images/brand/logo.png" alt="MG Perfume" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-luxury text-sm font-bold uppercase tracking-wider">
                        MG Perfume
                      </span>
                      <span className="text-[8px] tracking-widest text-[#967120] uppercase font-semibold">
                        Menu Admin
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNavDrawerOpen(false)}
                    className="p-1.5 rounded-full border border-[#E8DCC2] text-[#6B655E] hover:text-[#171513]"
                    aria-label="Fermer le tiroir"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Tab Navigation Links */}
                <nav className="py-6 space-y-2">
                  <button
                    onClick={() => handleTabClick('products')}
                    className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      activeTab === 'products'
                        ? 'bg-[#171513] text-white shadow-xs font-bold'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-[#C59B3F]" />
                      <span>Catalogue Parfums ({products.length})</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleTabClick('promotions')}
                    className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      activeTab === 'promotions'
                        ? 'bg-[#171513] text-white shadow-xs font-bold'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Percent className="w-4 h-4 text-[#C59B3F]" />
                      <span>Promos & Badges</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleTabClick('banners')}
                    className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      activeTab === 'banners'
                        ? 'bg-[#171513] text-white shadow-xs font-bold'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ImageIcon className="w-4 h-4 text-[#C59B3F]" />
                      <span>Bannières Shooting ({banners.length})</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleTabClick('shipping')}
                    className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      activeTab === 'shipping'
                        ? 'bg-[#171513] text-white shadow-xs font-bold'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-[#C59B3F]" />
                      <span>Frais de Livraison</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleTabClick('faq')}
                    className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      activeTab === 'faq'
                        ? 'bg-[#171513] text-white shadow-xs font-bold'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#C59B3F]" />
                      <span>Foire Aux Questions</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleTabClick('supabase')}
                    className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      activeTab === 'supabase'
                        ? 'bg-[#171513] text-white shadow-xs font-bold'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-[#3ECF8E]" />
                      <span>Supabase Cloud</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleTabClick('settings')}
                    className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-[#171513] text-white shadow-xs font-bold'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-[#C59B3F]" />
                      <span>Contact & Réseaux</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </nav>
              </div>

              {/* Drawer Bottom: Logout & Session info */}
              <div className="pt-6 border-t border-[#E8DCC2] space-y-3 text-xs">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 font-bold transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se Déconnecter</span>
                </button>
                <p className="text-[10px] text-center opacity-60">
                  Connecté : {adminEmail || 'admin@mgperfume.store'}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {pendingTabSwitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`p-6 rounded-3xl border max-w-sm w-full space-y-4 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center gap-3 text-amber-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Modifications non enregistrées</span>
            </div>
            <p className="text-xs opacity-75">
              Vous avez des modifications en cours. Voulez-vous continuer sans enregistrer ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingTabSwitch(null)}
                className="px-4 py-2 rounded-full border text-xs font-bold"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setActiveTab(pendingTabSwitch as any);
                  setPendingTabSwitch(null);
                  setHasUnsavedChanges(false);
                }}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold"
              >
                Changer d'onglet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Notification */}
      {saveMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C59B3F] text-[#171513] px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Banner Uploads */}
      <input
        type="file"
        ref={bannerFileInputRef}
        onChange={handleBannerFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Module Header Bar with Current Active Tab Title */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border ${cardBgClass}`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#967120] uppercase tracking-wider">
              <span>Module Actif :</span>
              <span className="capitalize">{activeTab}</span>
            </div>
            <h1 className="font-luxury text-xl sm:text-2xl font-bold mt-0.5">
              {activeTab === 'products' && 'Catalogue des Parfums Orientaux'}
              {activeTab === 'promotions' && 'Promotions & Badges'}
              {activeTab === 'banners' && 'Bannières de Shooting & Visuels'}
              {activeTab === 'shipping' && 'Frais & Délais de Livraison'}
              {activeTab === 'faq' && 'Questions Fréquentes'}
              {activeTab === 'supabase' && 'Synchronisation Supabase Cloud'}
              {activeTab === 'settings' && 'Coordonnées & Réseaux Sociaux'}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {activeTab === 'products' && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center p-1 rounded-full border ${subCardBg}`}>
                  <button
                    onClick={() => setProductsViewMode('cards')}
                    className={`p-1.5 rounded-full transition-colors ${productsViewMode === 'cards' ? 'bg-[#C59B3F] text-[#171513]' : 'opacity-60'}`}
                    title="Vue Grille"
                    aria-label="Vue Grille"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setProductsViewMode('list')}
                    className={`p-1.5 rounded-full transition-colors ${productsViewMode === 'list' ? 'bg-[#C59B3F] text-[#171513]' : 'opacity-60'}`}
                    title="Vue Liste"
                    aria-label="Vue Liste"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#C59B3F]" />
                  <span>Nouveau Parfum</span>
                </button>
              </div>
            )}

            {activeTab === 'banners' && (
              <button
                onClick={handleAddBanner}
                className="px-4 py-2 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#C59B3F]" />
                <span>Ajouter une Bannière (Max 6)</span>
              </button>
            )}

            <button
              onClick={() => setIsNavDrawerOpen(true)}
              className="px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 hover:border-[#C59B3F]"
            >
              <Menu className="w-3.5 h-3.5 text-[#967120]" />
              <span>Changer de Module</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Body */}
        <main className="space-y-6">
          
          {/* ============================================================ */}
          {/* TAB 1: CATALOGUE PRODUITS */}
          {/* ============================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Search bar inside admin */}
              <div className="relative">
                <Search className="w-4 h-4 opacity-50 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un parfum dans l'administration (Lattafa, Afnan, etc.)..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                />
              </div>

              {/* PRODUCTS: CARDS VIEW */}
              {productsViewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      className={`rounded-2xl p-4 border flex flex-col justify-between space-y-4 hover:border-[#C59B3F]/60 transition-all ${cardBgClass}`}
                    >
                      <div>
                        {/* Product Thumbnail on Pure White Box (Rule 7.1) */}
                        <div className="relative w-full h-44 bg-white rounded-xl overflow-hidden p-2 flex items-center justify-center border border-[#E8DCC2]">
                          <div className="relative w-28 h-36">
                            <Image src={product.image} alt={product.name} fill className="object-contain" />
                          </div>
                          {product.badge && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#171513] text-[#F3E5AB] border border-[#C59B3F]/40">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-1">
                          <span className="text-[10px] font-bold text-[#967120] uppercase tracking-wider">
                            {product.brand} • {product.volume}
                          </span>
                          <h3 className="font-luxury text-base font-bold leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-xs opacity-70 line-clamp-1">{product.tagline}</p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-[#E8DCC2]/60 flex items-center justify-between">
                          <div className="text-sm font-extrabold">
                            {product.price.toLocaleString('fr-FR')} <span className="text-xs text-[#967120]">FCFA</span>
                          </div>
                          {product.originalPrice && (
                            <div className="text-[10px] text-red-500 line-through">
                              {product.originalPrice.toLocaleString('fr-FR')} FCFA
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#E8DCC2]/60">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductModalOpen(true);
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border ${subCardBg} hover:bg-[#171513] hover:text-white`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-600 border border-red-200 text-red-500 hover:text-white transition-colors"
                          title="Supprimer"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* PRODUCTS: LIST VIEW */
                <div className={`rounded-3xl border overflow-hidden ${cardBgClass}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={`border-b ${subCardBg}`}>
                        <tr>
                          <th className="p-3.5">Parfum</th>
                          <th className="p-3.5">Maison</th>
                          <th className="p-3.5">Famille</th>
                          <th className="p-3.5">Contenance</th>
                          <th className="p-3.5">Prix Actuel</th>
                          <th className="p-3.5">Badge Promo</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DCC2]/60">
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-black/5 transition-colors">
                            <td className="p-3.5 flex items-center gap-2.5">
                              <div className="relative w-9 h-9 bg-white rounded-lg p-0.5 border flex-shrink-0">
                                <Image src={product.image} alt={product.name} fill className="object-contain" />
                              </div>
                              <span className="font-bold">{product.name}</span>
                            </td>
                            <td className="p-3.5 opacity-80">{product.brand}</td>
                            <td className="p-3.5 capitalize opacity-80">{product.family}</td>
                            <td className="p-3.5 opacity-80">{product.volume}</td>
                            <td className="p-3.5 font-bold text-[#967120]">
                              {product.price.toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="p-3.5">
                              {product.badge ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C59B3F]/20 text-[#967120] border border-[#C59B3F]/40">
                                  {product.badge}
                                </span>
                              ) : (
                                <span className="opacity-40">—</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border hover:bg-[#171513] hover:text-white transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: PROMOTIONS & PRIX BARRÉS */}
          {/* ============================================================ */}
          {activeTab === 'promotions' && (
            <div className={`rounded-3xl p-6 border space-y-6 ${cardBgClass}`}>
              <div>
                <h2 className="font-luxury text-xl font-bold flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[#C59B3F]" />
                  Gestion des Promotions & Badges
                </h2>
                <p className="text-xs opacity-75">
                  Appliquez instantanément un prix promo ou un badge sur vos parfums.
                </p>
              </div>

              <div className="divide-y divide-[#E8DCC2]/60">
                {products.map(product => (
                  <div key={product.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-white rounded-xl p-1 flex-shrink-0 border">
                        <Image src={product.image} alt={product.name} fill className="object-contain" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{product.name}</h3>
                        <p className="text-xs opacity-70">{product.brand} ({product.volume})</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Badge (ex: Bestseller, Promo)"
                        value={product.badge || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, badge: val || undefined } : p));
                          setHasUnsavedChanges(true);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] w-36 ${inputBg}`}
                      />

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] opacity-70">Prix:</span>
                        <input
                          type="number"
                          value={product.price}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: val } : p));
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-2 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] w-24 text-right ${inputBg}`}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] opacity-70">Prix Barré:</span>
                        <input
                          type="number"
                          placeholder="Aucun"
                          value={product.originalPrice || ''}
                          onChange={e => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, originalPrice: val } : p));
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-2 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] w-24 text-right ${inputBg}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E8DCC2] flex justify-end">
                <button
                  onClick={() => showFeedback('Promotions enregistrées')}
                  className="px-5 py-2.5 rounded-full bg-[#171513] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C59B3F] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les promotions</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: BANNIÈRES SHOOTING EDITORIAL (With Image Upload & ObjectPosition) */}
          {/* ============================================================ */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border space-y-6 ${cardBgClass}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-luxury text-xl font-bold flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#C59B3F]" />
                      Bannières Éditoriales de Shooting
                    </h2>
                    <p className="text-xs opacity-75">
                      Gérez les visuels, titres, tags, liens et cadrages photos (Position de l'image).
                    </p>
                  </div>
                </div>

                {banners.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-[#E8DCC2] space-y-3">
                    <ImageIcon className="w-8 h-8 text-[#9E968D] mx-auto" />
                    <p className="text-xs opacity-70">Aucune bannière de shooting configurée. La page d’accueil s’adapte automatiquement sans bannière.</p>
                    <button
                      onClick={handleAddBanner}
                      className="px-4 py-2 rounded-full bg-[#171513] text-white text-xs font-bold"
                    >
                      Ajouter une bannière
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {banners.map((banner, index) => (
                      <div key={banner.id} className={`p-4 rounded-2xl border space-y-3 ${subCardBg}`}>
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border">
                          <Image 
                            src={banner.image} 
                            alt={banner.alt} 
                            fill 
                            style={{ objectPosition: banner.objectPosition || 'center' }}
                            className="object-cover" 
                          />
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
                            title="Supprimer la bannière"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] text-[#967120] uppercase font-bold">Tag Supérieur</label>
                            <input
                              type="text"
                              value={banner.tag}
                              onChange={e => {
                                const val = e.target.value;
                                setBanners(prev => prev.map((b, i) => i === index ? { ...b, tag: val } : b));
                                setHasUnsavedChanges(true);
                              }}
                              className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-[#967120] uppercase font-bold">Titre Principal</label>
                            <input
                              type="text"
                              value={banner.title}
                              onChange={e => {
                                const val = e.target.value;
                                setBanners(prev => prev.map((b, i) => i === index ? { ...b, title: val } : b));
                                setHasUnsavedChanges(true);
                              }}
                              className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-[#967120] uppercase font-bold">Texte Bouton</label>
                              <input
                                type="text"
                                value={banner.linkText}
                                onChange={e => {
                                  const val = e.target.value;
                                  setBanners(prev => prev.map((b, i) => i === index ? { ...b, linkText: val } : b));
                                  setHasUnsavedChanges(true);
                                }}
                                className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-[#967120] uppercase font-bold">Lien Cible</label>
                              <input
                                type="text"
                                value={banner.href}
                                onChange={e => {
                                  const val = e.target.value;
                                  setBanners(prev => prev.map((b, i) => i === index ? { ...b, href: val } : b));
                                  setHasUnsavedChanges(true);
                                }}
                                className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                              />
                            </div>
                          </div>

                          {/* Image position (cadrage) */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-[#967120] uppercase font-bold">Cadrage / Position</label>
                              <select
                                value={banner.objectPosition || 'center'}
                                onChange={e => {
                                  const val = e.target.value;
                                  setBanners(prev => prev.map((b, i) => i === index ? { ...b, objectPosition: val } : b));
                                  setHasUnsavedChanges(true);
                                }}
                                className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                              >
                                <option value="center">Centré (Center)</option>
                                <option value="top">Haut (Top)</option>
                                <option value="bottom">Bas (Bottom)</option>
                                <option value="left">Gauche (Left)</option>
                                <option value="right">Droite (Right)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-[#967120] uppercase font-bold">Changer la Photo</label>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveBannerIndexForUpload(index);
                                  bannerFileInputRef.current?.click();
                                }}
                                className="w-full py-1.5 px-3 rounded-xl bg-[#171513] text-white hover:bg-[#C59B3F] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Uploader</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-[#E8DCC2] flex justify-end">
                  <button
                    onClick={() => showFeedback('Bannières shooting enregistrées')}
                    className="px-5 py-2.5 rounded-full bg-[#171513] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C59B3F] flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les bannières</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: FRAIS DE LIVRAISON */}
          {/* ============================================================ */}
          {activeTab === 'shipping' && (
            <div className={`rounded-3xl p-6 border space-y-6 ${cardBgClass}`}>
              <div>
                <h2 className="font-luxury text-xl font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#C59B3F]" />
                  Zones & Frais de Livraison
                </h2>
                <p className="text-xs opacity-75">
                  Ajustez les tarifs et délais pour Dakar Centre, banlieues et régions.
                </p>
              </div>

              <div className="space-y-3">
                {shippingZones.map((zone, index) => (
                  <div key={zone.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${subCardBg}`}>
                    <div className="space-y-1">
                      <span className="font-bold text-sm">{zone.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] opacity-70">Délai :</span>
                        <input
                          type="text"
                          value={zone.delay}
                          onChange={e => {
                            const val = e.target.value;
                            setShippingZones(prev => prev.map((z, i) => i === index ? { ...z, delay: val } : z));
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-2 py-1 text-xs rounded-lg border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">Prix (FCFA) :</span>
                      <input
                        type="number"
                        value={zone.price}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setShippingZones(prev => prev.map((z, i) => i === index ? { ...z, price: val } : z));
                          setHasUnsavedChanges(true);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-xl border font-bold focus:outline-none focus:border-[#C59B3F] w-28 text-right ${inputBg}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E8DCC2] flex justify-end">
                <button
                  onClick={() => showFeedback('Frais de livraison mis à jour')}
                  className="px-5 py-2.5 rounded-full bg-[#171513] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C59B3F] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les tarifs</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: FAQ */}
          {/* ============================================================ */}
          {activeTab === 'faq' && (
            <div className={`rounded-3xl p-6 border space-y-6 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-luxury text-xl font-bold flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#C59B3F]" />
                    Foire Aux Questions (FAQ)
                  </h2>
                  <p className="text-xs opacity-75">Modifiez ou ajoutez des questions fréquentes pour vos clients.</p>
                </div>

                <button
                  onClick={() => {
                    setFaqs(prev => [...prev, { q: 'Nouvelle Question ?', a: 'Réponse détaillée ici...' }]);
                    setHasUnsavedChanges(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C59B3F]" />
                  <span>Ajouter une question</span>
                </button>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className={`p-4 rounded-2xl border space-y-2 relative ${subCardBg}`}>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={faq.q}
                        onChange={e => {
                          const val = e.target.value;
                          setFaqs(prev => prev.map((f, i) => i === index ? { ...f, q: val } : f));
                          setHasUnsavedChanges(true);
                        }}
                        className={`w-full px-3 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                      />
                      <button
                        onClick={() => {
                          setFaqs(prev => prev.filter((_, i) => i !== index));
                          setHasUnsavedChanges(true);
                        }}
                        className="p-1.5 text-red-500 hover:text-red-400"
                        title="Supprimer la question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      value={faq.a}
                      rows={2}
                      onChange={e => {
                        const val = e.target.value;
                        setFaqs(prev => prev.map((f, i) => i === index ? { ...f, a: val } : f));
                        setHasUnsavedChanges(true);
                      }}
                      className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E8DCC2] flex justify-end">
                <button
                  onClick={() => showFeedback('FAQ enregistrée avec succès')}
                  className="px-5 py-2.5 rounded-full bg-[#171513] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C59B3F] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer la FAQ</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: SUPABASE CLOUD SYNC */}
          {/* ============================================================ */}
          {activeTab === 'supabase' && (
            <div className={`rounded-3xl p-6 border space-y-6 ${cardBgClass}`}>
              <div>
                <h2 className="font-luxury text-xl font-bold flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#3ECF8E]" />
                  Configuration & Synchronisation Supabase Cloud
                </h2>
                <p className="text-xs opacity-75">
                  Connectez votre base de données PostgreSQL Supabase pour une persistance 100% en temps réel.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-3 ${subCardBg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>Statut Supabase : {isSupabaseConfigured ? 'Connecté & Prêt' : 'En attente de clés .env'}</span>
                  </div>
                </div>

                <p className="text-xs opacity-75 leading-relaxed">
                  Pour relier votre projet Supabase, ajoutez simplement vos identifiants dans votre fichier <code>.env.local</code> :
                </p>

                <pre className="p-3 rounded-xl bg-black text-[#3ECF8E] text-[11px] font-mono overflow-x-auto">
                  NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co{'\n'}
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs opacity-70">
                  Transférez vos {products.length} parfums actuels vers la base Supabase Cloud en un clic.
                </p>

                <button
                  onClick={handleSyncSupabase}
                  disabled={isSyncingSupabase}
                  className="px-6 py-3 rounded-full bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {isSyncingSupabase ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synchronisation en cours...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4" />
                      <span>Synchroniser avec Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: CONTACT & RÉSEAUX */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className={`rounded-3xl p-6 border space-y-6 ${cardBgClass}`}>
              <div>
                <h2 className="font-luxury text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#C59B3F]" />
                  Coordonnées & Réseaux Sociaux
                </h2>
                <p className="text-xs opacity-75">
                  Mettez à jour le numéro WhatsApp pour les commandes directes et vos liens sociaux.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Numéro WhatsApp (sans +)</label>
                  <input
                    type="text"
                    value={contactInfo.whatsappNumber}
                    onChange={e => {
                      setContactInfo({ ...contactInfo, whatsappNumber: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Téléphone d'appel</label>
                  <input
                    type="text"
                    value={contactInfo.phoneFormatted}
                    onChange={e => {
                      setContactInfo({ ...contactInfo, phoneFormatted: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Email de Contact</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={e => {
                      setContactInfo({ ...contactInfo, email: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Page Facebook</label>
                  <input
                    type="text"
                    value={socialInfo.facebook || ''}
                    onChange={e => {
                      setSocialInfo({ ...socialInfo, facebook: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Horaires d'ouverture</label>
                  <input
                    type="text"
                    value={contactInfo.hours}
                    onChange={e => {
                      setContactInfo({ ...contactInfo, hours: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DCC2] flex justify-end">
                <button
                  onClick={() => showFeedback('Coordonnées enregistrées avec succès')}
                  className="px-5 py-2.5 rounded-full bg-[#171513] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C59B3F] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les coordonnées</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ============================================================ */}
      {/* MODAL: AJOUTER / MODIFIER UN PRODUIT (With Sticky Close Bar) */}
      {/* ============================================================ */}
      {isProductModalOpen && editingProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div 
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col ${cardBgClass}`}
            onClick={e => e.stopPropagation()}
          >
            
            {/* STICKY MODAL HEADER BAR (Rule 7.2: Always visible upon scrolling) */}
            <div className={`sticky top-0 z-30 px-6 py-3.5 border-b flex items-center justify-between backdrop-blur-md ${isDark ? 'bg-[#171513]/95 border-white/10' : 'bg-white/95 border-[#E8DCC2]'}`}>
              <h3 className="font-luxury text-base sm:text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C59B3F]" />
                <span>{editingProduct.id.startsWith('product-') ? 'Nouveau Parfum' : 'Modifier le Parfum'}</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full border text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                aria-label="Fermer la modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 space-y-6 text-xs">
              
              {/* Image Upload Area with Pure White Box */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-[#C59B3F]/40 bg-black/5">
                <div className="relative w-24 h-28 bg-white rounded-xl p-1 border flex-shrink-0 flex items-center justify-center">
                  {editingProduct.image ? (
                    <Image src={editingProduct.image} alt="Preview" fill className="object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-grow space-y-2 text-center sm:text-left">
                  <span className="font-bold text-[11px] block">Image du Flacon (Fond Blanc recommandé)</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-full bg-[#171513] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#C59B3F]"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#C59B3F]" />
                      <span>Uploader une photo</span>
                    </button>
                    <span className="text-[10px] opacity-70">ou saisir le chemin</span>
                  </div>
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="/images/products/... ou https://..."
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Nom du Parfum *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Maison / Marque</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Prix Actuel (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Prix Barré Promo (Optionnel)</label>
                  <input
                    type="number"
                    placeholder="ex: 30000"
                    value={editingProduct.originalPrice || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Volume / Contenance</label>
                  <input
                    type="text"
                    value={editingProduct.volume}
                    onChange={e => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                    placeholder="ex: 100 ml, 50 ml, 30 ml"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Badge Promotionnel</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, badge: e.target.value || undefined })}
                    placeholder="ex: Bestseller, Coup de Cœur, Nouveauté"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Famille Olfactive</label>
                  <select
                    value={editingProduct.family}
                    onChange={e => setEditingProduct({ ...editingProduct, family: e.target.value as ScentFamily })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  >
                    <option value="oriental">Oriental & Épices</option>
                    <option value="gourmand">Gourmand & Sucré</option>
                    <option value="boise">Boisé & Cèdre</option>
                    <option value="floral">Floral & Fruité</option>
                    <option value="aquatique">Frais & Hespéridé</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#967120] uppercase">Catégorie / Titre</label>
                  <input
                    type="text"
                    value={editingProduct.categoryLabel}
                    onChange={e => setEditingProduct({ ...editingProduct, categoryLabel: e.target.value })}
                    placeholder="ex: Eau de Parfum, Élixir Féminin"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#967120] uppercase">Slogan Poétique (Tagline)</label>
                <input
                  type="text"
                  value={editingProduct.tagline}
                  onChange={e => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                  placeholder="ex: Sillage ambré chaleureux et vanille précieuse"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#967120] uppercase">Description Détaillée</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                />
              </div>

              {/* Olfactory Pyramid Inputs */}
              <div className={`p-4 rounded-2xl border space-y-3 ${subCardBg}`}>
                <span className="font-bold text-[#967120] uppercase tracking-wider text-[11px] block">
                  Pyramide Olfactive (Séparer par des virgules)
                </span>

                <div>
                  <label className="text-[10px] opacity-70">Notes de Tête :</label>
                  <input
                    type="text"
                    value={editingProduct.topNotes.join(', ')}
                    onChange={e => setEditingProduct({ ...editingProduct, topNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className={`w-full px-3 py-1.5 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] opacity-70">Notes de Cœur :</label>
                  <input
                    type="text"
                    value={editingProduct.heartNotes.join(', ')}
                    onChange={e => setEditingProduct({ ...editingProduct, heartNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className={`w-full px-3 py-1.5 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] opacity-70">Notes de Fond :</label>
                  <input
                    type="text"
                    value={editingProduct.baseNotes.join(', ')}
                    onChange={e => setEditingProduct({ ...editingProduct, baseNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className={`w-full px-3 py-1.5 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DCC2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className={`px-4 py-2 rounded-full border text-xs font-bold ${subCardBg}`}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
