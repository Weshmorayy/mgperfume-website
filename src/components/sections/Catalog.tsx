'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Eye, Check, Sparkles, ArrowUpDown, Search, X } from 'lucide-react';
import { PerfumeProduct, ScentFamily } from '@/types';
import { siteConfig } from '@/config/site';
import { useStore } from '@/context/StoreContext';

interface CatalogProps {
  onAddToCart: (product: PerfumeProduct) => void;
  onSelectProduct: (product: PerfumeProduct) => void;
  showFilters?: boolean;
  products?: PerfumeProduct[];
}

const CATEGORIES: { id: ScentFamily; label: string }[] = [
  { id: 'all', label: 'Toutes les familles' },
  { id: 'oriental', label: 'Orientaux & Épices' },
  { id: 'gourmand', label: 'Gourmands & Sucrés' },
  { id: 'boise', label: 'Boisés & Cèdre' },
  { id: 'floral', label: 'Floraux & Fruités' },
  { id: 'aquatique', label: 'Frais & Hespéridés' },
];

export function Catalog({
  onAddToCart,
  onSelectProduct,
  showFilters = true,
  products: overrideProducts,
}: CatalogProps) {
  const { products: storeProducts } = useStore();
  const rawProducts = overrideProducts || storeProducts;

  const [selectedFamily, setSelectedFamily] = useState<ScentFamily>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [addedId, setAddedId] = useState<string | null>(null);

  // Extract brands dynamically
  const brands = useMemo(() => {
    return Array.from(new Set(rawProducts.map(p => p.brand).filter(Boolean))) as string[];
  }, [rawProducts]);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    let result = rawProducts;

    // Filter by Brand
    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // Filter by Scent Family
    if (selectedFamily !== 'all') {
      result = result.filter(p => p.family === selectedFamily);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.topNotes.some(n => n.toLowerCase().includes(q)) ||
          p.heartNotes.some(n => n.toLowerCase().includes(q)) ||
          p.baseNotes.some(n => n.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchQuery, selectedBrand, selectedFamily, sortBy]);

  const handleAdd = (product: PerfumeProduct) => {
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section id="catalogue" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {showFilters && (
        <div className="space-y-6 mb-10">
          
          {/* Integrated Search Bar inside the page */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8DCC2] shadow-xs space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-[#9E968D] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un parfum, une maison (Lattafa, Afnan...), ou une note olfactive..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-12 pr-10 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F] focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#9E968D] hover:text-[#171513]"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Brand Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E8DCC2]/60">
              <span className="text-xs font-bold text-[#171513] uppercase tracking-wider mr-1">
                Maison :
              </span>
              <button
                onClick={() => setSelectedBrand('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedBrand === 'all'
                    ? 'bg-[#171513] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E8DCC2] hover:border-[#C59B3F]'
                }`}
              >
                Toutes
              </button>
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedBrand === brand
                      ? 'bg-[#171513] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E8DCC2] hover:border-[#C59B3F]'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Scent Families and Sorting Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E8DCC2] pb-4">
            {/* Olfactory Tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFamily(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    selectedFamily === cat.id
                      ? 'bg-[#967120] text-white shadow-xs font-bold'
                      : 'bg-white text-[#6B655E] border border-[#E8DCC2] hover:border-[#C59B3F]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Counter and Sort Selector */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4 self-stretch md:self-auto pt-2 md:pt-0">
              <span className="text-xs text-[#6B655E]">
                {filteredProducts.length} {filteredProducts.length > 1 ? 'parfums trouvés' : 'parfum trouvé'}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9E968D] font-medium flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Tri :
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-[#E8DCC2] text-[#171513] focus:outline-none focus:border-[#C59B3F]"
                >
                  <option value="default">Recommandés</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#E8DCC2] p-8">
          <Sparkles className="w-8 h-8 text-[#C59B3F] mx-auto opacity-50" />
          <h3 className="font-luxury text-base font-bold text-[#171513]">Aucun parfum trouvé</h3>
          <p className="text-xs text-[#6B655E] max-w-sm mx-auto">
            Veuillez ajuster votre recherche ou réinitialiser les filtres pour afficher l'ensemble de la collection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBrand('all');
              setSelectedFamily('all');
            }}
            className="px-5 py-2 text-xs font-bold rounded-full bg-[#171513] text-white hover:bg-[#C59B3F] transition-colors"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      ) : (
        /* Products Grid (100% pure white background behind images) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl p-4 border border-[#E8DCC2] hover:border-[#C59B3F] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Badge & Volume */}
                <div className="flex items-center justify-between mb-2 text-[10px]">
                  {product.badge ? (
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#FBF4E2] text-[#967120] border border-[#E8DCC2]">
                      {product.badge}
                    </span>
                  ) : (
                    <span className="font-semibold uppercase text-[#9E968D]">
                      {product.categoryLabel}
                    </span>
                  )}
                  <span className="text-[#9E968D] font-mono">{product.volume}</span>
                </div>

                {/* Product Image on 100% PURE WHITE background */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative w-full h-64 bg-white flex items-center justify-center cursor-pointer rounded-xl overflow-hidden"
                >
                  <div className="relative w-48 h-56 transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-white text-[#171513] text-xs font-semibold border border-[#E8DCC2] shadow-sm flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#C59B3F]" />
                      Pyramide olfactive
                    </span>
                  </div>
                </div>

                {/* Product Content */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-bold text-[#967120] tracking-widest uppercase">
                    {product.brand}
                  </span>
                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="font-luxury text-base font-bold text-[#171513] hover:text-[#C59B3F] cursor-pointer transition-colors"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#6B655E] line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>
                </div>

                {/* Notes Tags */}
                <div className="mt-2.5 pt-2.5 border-t border-[#E8DCC2]/60 flex flex-wrap gap-1">
                  {product.topNotes.slice(0, 3).map((note, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-white text-[#6B655E] border border-[#E8DCC2]"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="mt-4 pt-3 border-t border-[#E8DCC2] flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-extrabold text-[#171513]">
                    {product.price.toLocaleString('fr-FR')}{' '}
                    <span className="text-xs text-[#967120] font-bold">FCFA</span>
                  </div>
                  {product.originalPrice && (
                    <div className="text-[10px] text-[#9E968D] line-through">
                      {product.originalPrice.toLocaleString('fr-FR')} FCFA
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAdd(product)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    addedId === product.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#171513] hover:bg-[#C59B3F] text-white hover:scale-105'
                  }`}
                  aria-label={`Ajouter ${product.name} au panier`}
                >
                  {addedId === product.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Ajouté</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
