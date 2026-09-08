'use client';

import React, { useState, useEffect } from 'react';
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
  Share2, 
  ShieldCheck, 
  LogOut,
  RefreshCw,
  Search
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PerfumeProduct, EditorialBanner, ShippingZone, FAQItem, ScentFamily } from '@/types';

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'promotions' | 'banners' | 'shipping' | 'faq' | 'settings'>('products');

  // Editable States
  const [products, setProducts] = useState<PerfumeProduct[]>(siteConfig.products);
  const [banners, setBanners] = useState<EditorialBanner[]>(siteConfig.editorialBanners || []);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(siteConfig.shippingZones);
  const [faqs, setFaqs] = useState<FAQItem[]>(siteConfig.faqs || []);
  const [contactInfo, setContactInfo] = useState(siteConfig.contact);
  const [socialInfo, setSocialInfo] = useState(siteConfig.social);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<PerfumeProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Global Feedback Message
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Check Local Auth Session
  useEffect(() => {
    const session = sessionStorage.getItem('mg_admin_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 2026 (or customizable)
    if (pinCode === '2026' || pinCode === 'mgperfume2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('mg_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Code d’accès incorrect. Veuillez réessayer.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mg_admin_auth');
  };

  const showFeedback = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
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
    showFeedback('Parfum enregistré avec succès');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce parfum du catalogue ?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showFeedback('Parfum supprimé du catalogue');
    }
  };

  // Filtered Products for Search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // ----------------------------------------------------
  // LOGIN SCREEN (On-Brand Luxury Black & Gold)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#110F0D] text-[#FAF8F5] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-[#171513] border border-[#C59B3F]/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden">
          
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
            <h1 className="font-luxury text-2xl font-bold uppercase tracking-widest text-[#FAF8F5]">
              Espace Administrateur
            </h1>
            <p className="text-xs text-[#A8A196]">
              MG Perfume • Direction & Gestion de Boutique
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-[#C59B3F] uppercase tracking-wider block mb-1.5">
                Code PIN Secret
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#A8A196] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  placeholder="Entrez votre code (ex: 2026)"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#221F1B] border border-[#C59B3F]/30 text-white placeholder-[#6B655E] text-sm focus:outline-none focus:border-[#C59B3F] transition-all"
                  autoFocus
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#C59B3F] hover:bg-[#D8AE4D] text-[#171513] font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Accéder au Dashboard</span>
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#A8A196] hover:text-[#C59B3F] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retourner sur la boutique</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN AUTHENTICATED DASHBOARD (100% On-Brand)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#110F0D] text-[#FAF8F5] flex flex-col font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#171513]/95 backdrop-blur-md border-b border-[#C59B3F]/20 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image src="/images/brand/logo.png" alt="MG Perfume" fill className="object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-luxury text-base font-bold uppercase tracking-wider text-white">
                MG Perfume
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C59B3F]/20 text-[#C59B3F] border border-[#C59B3F]/40 uppercase">
                Admin Cloud
              </span>
            </div>
            <p className="text-[10px] text-[#A8A196]">Tableau de Bord & Gestion de Boutique</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#221F1B] border border-[#C59B3F]/30 text-xs font-semibold text-[#F3E5AB] hover:text-white hover:border-[#C59B3F] transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#C59B3F]" />
            <span>Voir le site en direct</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-[#221F1B] border border-white/10 text-[#A8A196] hover:text-red-400 transition-colors"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Save Feedback Notification */}
      {saveMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C59B3F] text-[#171513] px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-8">
        
        {/* Navigation Sidebar Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
          <div className="p-3 bg-[#171513] rounded-3xl border border-[#C59B3F]/20 space-y-1">
            
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-[#C59B3F] text-[#171513] shadow-md'
                  : 'text-[#A8A196] hover:bg-[#221F1B] hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catalogue Parfums ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'promotions'
                  ? 'bg-[#C59B3F] text-[#171513] shadow-md'
                  : 'text-[#A8A196] hover:bg-[#221F1B] hover:text-white'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Promos & Badges</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'banners'
                  ? 'bg-[#C59B3F] text-[#171513] shadow-md'
                  : 'text-[#A8A196] hover:bg-[#221F1B] hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Bannières Shooting ({banners.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'shipping'
                  ? 'bg-[#C59B3F] text-[#171513] shadow-md'
                  : 'text-[#A8A196] hover:bg-[#221F1B] hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Frais de Livraison</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'faq'
                  ? 'bg-[#C59B3F] text-[#171513] shadow-md'
                  : 'text-[#A8A196] hover:bg-[#221F1B] hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Foire Aux Questions</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#C59B3F] text-[#171513] shadow-md'
                  : 'text-[#A8A196] hover:bg-[#221F1B] hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Contact & Réseaux</span>
            </button>

          </div>

          <div className="p-4 bg-[#171513]/50 rounded-2xl border border-white/5 text-[11px] text-[#A8A196] space-y-2">
            <div className="flex items-center gap-2 text-[#C59B3F] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Prêt pour Supabase</span>
            </div>
            <p className="leading-relaxed text-[#857E74]">
              Interface prête à être synchronisée avec votre projet Supabase PostgreSQL & Storage.
            </p>
          </div>
        </aside>

        {/* Dynamic Admin Body Content */}
        <main className="flex-grow space-y-6">
          
          {/* ============================================================ */}
          {/* TAB 1: CATALOGUE PRODUITS */}
          {/* ============================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#171513] p-5 rounded-3xl border border-[#C59B3F]/20">
                <div>
                  <h2 className="font-luxury text-xl font-bold text-white">Gestion du Catalogue</h2>
                  <p className="text-xs text-[#A8A196]">Ajoutez, modifiez ou supprimez vos parfums.</p>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 rounded-full bg-[#C59B3F] hover:bg-[#D8AE4D] text-[#171513] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Parfum</span>
                </button>
              </div>

              {/* Search bar inside admin */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#A8A196] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un parfum dans l'administration..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#171513] border border-white/10 text-xs text-white placeholder-[#6B655E] focus:outline-none focus:border-[#C59B3F]"
                />
              </div>

              {/* Products Table/Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="bg-[#171513] rounded-2xl p-4 border border-[#C59B3F]/20 flex flex-col justify-between space-y-4 hover:border-[#C59B3F]/60 transition-all"
                  >
                    <div>
                      {/* Product Thumbnail on Pure White Box */}
                      <div className="relative w-full h-44 bg-white rounded-xl overflow-hidden p-2 flex items-center justify-center">
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
                        <span className="text-[10px] font-bold text-[#C59B3F] uppercase tracking-wider">
                          {product.brand} • {product.volume}
                        </span>
                        <h3 className="font-luxury text-base font-bold text-white leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[#A8A196] line-clamp-1">{product.tagline}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                        <div className="text-sm font-extrabold text-white">
                          {product.price.toLocaleString('fr-FR')} <span className="text-xs text-[#C59B3F]">FCFA</span>
                        </div>
                        {product.originalPrice && (
                          <div className="text-[10px] text-red-400 line-through">
                            {product.originalPrice.toLocaleString('fr-FR')} FCFA
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#221F1B] hover:bg-[#C59B3F] hover:text-[#171513] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-400 hover:text-white transition-colors"
                        title="Supprimer"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: GESTION DES PROMOTIONS ET PRIX BARRÉS */}
          {/* ============================================================ */}
          {activeTab === 'promotions' && (
            <div className="bg-[#171513] rounded-3xl p-6 border border-[#C59B3F]/20 space-y-6">
              <div>
                <h2 className="font-luxury text-xl font-bold text-white flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[#C59B3F]" />
                  Gestion des Promotions & Badges
                </h2>
                <p className="text-xs text-[#A8A196]">
                  Appliquez instantanément un prix promo ou un badge (ex: Bestseller, -20%, Coup de Cœur) sur vos parfums.
                </p>
              </div>

              <div className="divide-y divide-white/10">
                {products.map(product => (
                  <div key={product.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-white rounded-xl p-1 flex-shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-contain" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{product.name}</h3>
                        <p className="text-xs text-[#A8A196]">{product.brand} ({product.volume})</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      {/* Badge selector */}
                      <input
                        type="text"
                        placeholder="Badge (ex: Bestseller, Promo)"
                        value={product.badge || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, badge: val || undefined } : p));
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F] w-36"
                      />

                      {/* Regular Price */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#A8A196]">Prix:</span>
                        <input
                          type="number"
                          value={product.price}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: val } : p));
                          }}
                          className="px-2 py-1.5 text-xs rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F] w-24 text-right"
                        />
                      </div>

                      {/* Original Strikethrough Price */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#A8A196]">Prix Barré:</span>
                        <input
                          type="number"
                          placeholder="Aucun"
                          value={product.originalPrice || ''}
                          onChange={e => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, originalPrice: val } : p));
                          }}
                          className="px-2 py-1.5 text-xs rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F] w-24 text-right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => showFeedback('Promotions mises à jour')}
                  className="px-5 py-2.5 rounded-full bg-[#C59B3F] text-[#171513] font-bold text-xs uppercase tracking-wider hover:bg-[#D8AE4D] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les promotions</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: BANNIÈRES SHOOTING EDITORIAL */}
          {/* ============================================================ */}
          {activeTab === 'banners' && (
            <div className="bg-[#171513] rounded-3xl p-6 border border-[#C59B3F]/20 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-luxury text-xl font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#C59B3F]" />
                    Bannières Éditoriales de Shooting
                  </h2>
                  <p className="text-xs text-[#A8A196]">
                    Gérez les cartes visuelles affichées sur la page d'accueil (photos de mannequins & podiums).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner, index) => (
                  <div key={banner.id} className="p-4 rounded-2xl bg-[#221F1B] border border-white/10 space-y-3">
                    <div className="relative w-full h-48 rounded-xl overflow-hidden">
                      <Image src={banner.image} alt={banner.alt} fill className="object-cover" />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-[#C59B3F] uppercase font-bold">Tag Supérieur</label>
                        <input
                          type="text"
                          value={banner.tag}
                          onChange={e => {
                            const val = e.target.value;
                            setBanners(prev => prev.map((b, i) => i === index ? { ...b, tag: val } : b));
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#171513] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#C59B3F] uppercase font-bold">Titre Principal</label>
                        <input
                          type="text"
                          value={banner.title}
                          onChange={e => {
                            const val = e.target.value;
                            setBanners(prev => prev.map((b, i) => i === index ? { ...b, title: val } : b));
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#171513] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#C59B3F] uppercase font-bold">Texte du Bouton</label>
                        <input
                          type="text"
                          value={banner.linkText}
                          onChange={e => {
                            const val = e.target.value;
                            setBanners(prev => prev.map((b, i) => i === index ? { ...b, linkText: val } : b));
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#171513] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => showFeedback('Bannières shooting enregistrées')}
                  className="px-5 py-2.5 rounded-full bg-[#C59B3F] text-[#171513] font-bold text-xs uppercase tracking-wider hover:bg-[#D8AE4D] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les bannières</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: FRAIS DE LIVRAISON */}
          {/* ============================================================ */}
          {activeTab === 'shipping' && (
            <div className="bg-[#171513] rounded-3xl p-6 border border-[#C59B3F]/20 space-y-6">
              <div>
                <h2 className="font-luxury text-xl font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#C59B3F]" />
                  Zones & Frais de Livraison
                </h2>
                <p className="text-xs text-[#A8A196]">
                  Ajustez les tarifs et délais pour Dakar Centre, banlieues et régions.
                </p>
              </div>

              <div className="space-y-3">
                {shippingZones.map((zone, index) => (
                  <div key={zone.id} className="p-4 rounded-2xl bg-[#221F1B] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-white">{zone.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#A8A196]">Délai :</span>
                        <input
                          type="text"
                          value={zone.delay}
                          onChange={e => {
                            const val = e.target.value;
                            setShippingZones(prev => prev.map((z, i) => i === index ? { ...z, delay: val } : z));
                          }}
                          className="px-2 py-1 text-xs rounded-lg bg-[#171513] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A8A196]">Prix (FCFA) :</span>
                      <input
                        type="number"
                        value={zone.price}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setShippingZones(prev => prev.map((z, i) => i === index ? { ...z, price: val } : z));
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl bg-[#171513] border border-white/10 text-white font-bold focus:outline-none focus:border-[#C59B3F] w-28 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => showFeedback('Frais de livraison mis à jour')}
                  className="px-5 py-2.5 rounded-full bg-[#C59B3F] text-[#171513] font-bold text-xs uppercase tracking-wider hover:bg-[#D8AE4D] flex items-center gap-2"
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
            <div className="bg-[#171513] rounded-3xl p-6 border border-[#C59B3F]/20 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-luxury text-xl font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#C59B3F]" />
                    Foire Aux Questions (FAQ)
                  </h2>
                  <p className="text-xs text-[#A8A196]">Modifiez ou ajoutez des questions fréquentes pour vos clients.</p>
                </div>

                <button
                  onClick={() => setFaqs(prev => [...prev, { q: 'Nouvelle Question ?', a: 'Réponse détaillée ici...' }])}
                  className="px-3.5 py-1.5 rounded-full bg-[#221F1B] hover:bg-[#C59B3F] hover:text-[#171513] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une question</span>
                </button>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-[#221F1B] border border-white/10 space-y-2 relative">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={faq.q}
                        onChange={e => {
                          const val = e.target.value;
                          setFaqs(prev => prev.map((f, i) => i === index ? { ...f, q: val } : f));
                        }}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-xl bg-[#171513] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                      />
                      <button
                        onClick={() => setFaqs(prev => prev.filter((_, i) => i !== index))}
                        className="p-1.5 text-red-400 hover:text-red-300"
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
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#171513] border border-white/10 text-[#A8A196] focus:outline-none focus:border-[#C59B3F]"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => showFeedback('FAQ enregistrée avec succès')}
                  className="px-5 py-2.5 rounded-full bg-[#C59B3F] text-[#171513] font-bold text-xs uppercase tracking-wider hover:bg-[#D8AE4D] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer la FAQ</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: CONTACT & RÉSEAUX */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="bg-[#171513] rounded-3xl p-6 border border-[#C59B3F]/20 space-y-6">
              <div>
                <h2 className="font-luxury text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#C59B3F]" />
                  Coordonnées & Réseaux Sociaux
                </h2>
                <p className="text-xs text-[#A8A196]">
                  Mettez à jour le numéro WhatsApp pour les commandes directes et vos liens sociaux.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Numéro WhatsApp (sans +)</label>
                  <input
                    type="text"
                    value={contactInfo.whatsappNumber}
                    onChange={e => setContactInfo({ ...contactInfo, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Téléphone d'appel</label>
                  <input
                    type="text"
                    value={contactInfo.phoneFormatted}
                    onChange={e => setContactInfo({ ...contactInfo, phoneFormatted: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Email de Contact</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Page Facebook</label>
                  <input
                    type="text"
                    value={socialInfo.facebook || ''}
                    onChange={e => setSocialInfo({ ...socialInfo, facebook: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Horaires d'ouverture</label>
                  <input
                    type="text"
                    value={contactInfo.hours}
                    onChange={e => setContactInfo({ ...contactInfo, hours: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => showFeedback('Coordonnées enregistrées avec succès')}
                  className="px-5 py-2.5 rounded-full bg-[#C59B3F] text-[#171513] font-bold text-xs uppercase tracking-wider hover:bg-[#D8AE4D] flex items-center gap-2"
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
      {/* MODAL: AJOUTER / MODIFIER UN PRODUIT (COMPLET & ON-BRAND) */}
      {/* ============================================================ */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#171513] border border-[#C59B3F]/40 rounded-3xl shadow-2xl p-6 sm:p-8 text-white space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-luxury text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C59B3F]" />
                <span>{editingProduct.id.startsWith('product-') ? 'Nouveau Parfum' : 'Modifier le Parfum'}</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full bg-[#221F1B] text-[#A8A196] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Nom du Parfum *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Maison / Marque</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Prix Actuel (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Prix Barré Promo (Optionnel)</label>
                  <input
                    type="number"
                    placeholder="ex: 30000"
                    value={editingProduct.originalPrice || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Volume / Contenance</label>
                  <input
                    type="text"
                    value={editingProduct.volume}
                    onChange={e => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                    placeholder="ex: 100 ml, 50 ml, 30 ml"
                    className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Badge Promotionnel</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, badge: e.target.value || undefined })}
                    placeholder="ex: Bestseller, Coup de Cœur, Nouveauté"
                    className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Famille Olfactive</label>
                  <select
                    value={editingProduct.family}
                    onChange={e => setEditingProduct({ ...editingProduct, family: e.target.value as ScentFamily })}
                    className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  >
                    <option value="oriental">Oriental & Épices</option>
                    <option value="gourmand">Gourmand & Sucré</option>
                    <option value="boise">Boisé & Cèdre</option>
                    <option value="floral">Floral & Fruité</option>
                    <option value="aquatique">Frais & Hespéridé</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Chemin / URL Image</label>
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Slogan Poétique (Tagline)</label>
                <input
                  type="text"
                  value={editingProduct.tagline}
                  onChange={e => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                  placeholder="ex: Sillage ambré chaleureux et vanille précieuse"
                  className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#C59B3F] uppercase">Description Détaillée</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#221F1B] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                />
              </div>

              {/* Olfactory Pyramid Inputs */}
              <div className="p-4 rounded-2xl bg-[#221F1B] border border-white/10 space-y-3">
                <span className="font-bold text-[#C59B3F] uppercase tracking-wider text-[11px] block">
                  Pyramide Olfactive (Séparer par des virgules)
                </span>

                <div>
                  <label className="text-[10px] text-[#A8A196]">Notes de Tête :</label>
                  <input
                    type="text"
                    value={editingProduct.topNotes.join(', ')}
                    onChange={e => setEditingProduct({ ...editingProduct, topNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#171513] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8A196]">Notes de Cœur :</label>
                  <input
                    type="text"
                    value={editingProduct.heartNotes.join(', ')}
                    onChange={e => setEditingProduct({ ...editingProduct, heartNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#171513] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8A196]">Notes de Fond :</label>
                  <input
                    type="text"
                    value={editingProduct.baseNotes.join(', ')}
                    onChange={e => setEditingProduct({ ...editingProduct, baseNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#171513] border border-white/10 text-white focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#221F1B] text-white hover:bg-white/10 font-bold"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#C59B3F] hover:bg-[#D8AE4D] text-[#171513] font-bold uppercase tracking-wider"
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
