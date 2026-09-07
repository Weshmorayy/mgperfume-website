'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Eye, Check, Sparkles } from 'lucide-react';
import { PerfumeProduct, ScentFamily } from '@/types';
import { siteConfig } from '@/config/site';

interface CatalogProps {
  onAddToCart: (product: PerfumeProduct) => void;
  onSelectProduct: (product: PerfumeProduct) => void;
}

const CATEGORIES: { id: ScentFamily; label: string }[] = [
  { id: 'all', label: 'Toutes les Créations' },
  { id: 'oriental', label: 'Orientaux & Épices' },
  { id: 'gourmand', label: 'Gourmands & Sucrés' },
  { id: 'boise', label: 'Boisés & Nobles' },
  { id: 'floral', label: 'Floraux & Fruités' },
  { id: 'aquatique', label: 'Frais & Hespéridés' },
];

export function Catalog({ onAddToCart, onSelectProduct }: CatalogProps) {
  const [selectedFamily, setSelectedFamily] = useState<ScentFamily>('all');
  const [addedId, setAddedId] = useState<string | null>(null);

  const filteredProducts = selectedFamily === 'all'
    ? siteConfig.products
    : siteConfig.products.filter(p => p.family === selectedFamily);

  const handleAdd = (product: PerfumeProduct) => {
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section id="catalogue" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181511] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Sélection Olfactive
        </div>
        <h2 className="font-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FBF8F3]">
          Les Parfums MG
        </h2>
        <p className="text-sm sm:text-base text-[#A8A196] max-w-xl mx-auto">
          Chaque flacon est sélectionné pour son authenticité, sa projection puissante et son évolution sur la peau.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedFamily(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                selectedFamily === cat.id
                  ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-bold'
                  : 'bg-[#151310] text-[#A8A196] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:text-[#FBF8F3]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="group relative flex flex-col justify-between bg-[#13110E] rounded-3xl p-5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/70 transition-all duration-500 hover:shadow-2xl hover:shadow-black/80"
          >
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-2 mb-4">
              {product.badge ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 uppercase">
                  {product.badge}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-[#A8A196] tracking-wider uppercase">
                  {product.categoryLabel}
                </span>
              )}
              <span className="text-xs text-[#A8A196] font-mono">{product.volume}</span>
            </div>

            {/* Product Image Stage */}
            <div 
              onClick={() => onSelectProduct(product)}
              className="relative w-full h-64 sm:h-72 rounded-2xl bg-[#0C0B0A] p-4 flex items-center justify-center cursor-pointer overflow-hidden group-hover:bg-[#110F0C] transition-colors"
            >
              <div className="relative w-48 h-56 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <span className="px-3 py-1.5 rounded-full bg-[#1A1815] text-[#F3E5AB] text-xs font-semibold border border-[#D4AF37]/40 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Voir la pyramide
                </span>
              </div>
            </div>

            {/* Product Content */}
            <div className="mt-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xs text-[#D4AF37] font-semibold tracking-wider uppercase mb-1">
                  {product.brand}
                </div>
                <h3 
                  onClick={() => onSelectProduct(product)}
                  className="font-luxury text-xl font-bold text-[#FBF8F3] hover:text-[#D4AF37] cursor-pointer transition-colors"
                >
                  {product.name}
                </h3>
                <p className="text-xs text-[#A8A196] line-clamp-2 mt-1 font-normal leading-relaxed">
                  {product.tagline}
                </p>
              </div>

              {/* Olfactory Highlights */}
              <div className="pt-2 border-t border-[#D4AF37]/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#A8A196]">
                  <span className="text-[#D4AF37] font-semibold">Notes clés :</span>
                  <span className="truncate text-[#FBF8F3]/90">
                    {product.topNotes.slice(0, 2).join(', ')}, {product.baseNotes[0]}
                  </span>
                </div>
              </div>

              {/* Price and Cart Action */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-[#FBF8F3]">
                    {product.price.toLocaleString('fr-FR')} <span className="text-xs text-[#D4AF37] font-semibold">FCFA</span>
                  </div>
                  {product.originalPrice && (
                    <div className="text-xs text-[#A8A196] line-through">
                      {product.originalPrice.toLocaleString('fr-FR')} FCFA
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAdd(product)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    addedId === product.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-[#D4AF37] hover:bg-[#E5C378] text-black shadow-md shadow-[#D4AF37]/20 hover:scale-105'
                  }`}
                  aria-label={`Ajouter ${product.name} au panier`}
                >
                  {addedId === product.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
