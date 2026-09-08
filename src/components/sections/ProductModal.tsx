'use client';

import React from 'react';
import Image from 'next/image';
import { X, Plus, Sparkles, Droplet, Heart, Wind, ShieldCheck } from 'lucide-react';
import { PerfumeProduct } from '@/types';

interface ProductModalProps {
  product: PerfumeProduct | null;
  onClose: () => void;
  onAddToCart: (product: PerfumeProduct) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-[#E8DCC2] shadow-2xl text-[#171513] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header Bar with Close Button (never overlaps content or gets lost during scroll) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-[#E8DCC2] flex items-center justify-between">
          <div className="text-xs font-bold text-[#967120] uppercase tracking-wider">
            {product.brand} • {product.categoryLabel}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#FAF8F5] text-[#171513] hover:bg-[#171513] hover:text-white border border-[#E8DCC2] transition-colors flex items-center justify-center shadow-xs"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image Showcase: strictly 100% pure #FFFFFF background */}
            <div className="relative w-full h-64 sm:h-80 rounded-2xl bg-white p-4 flex items-center justify-center border border-[#E8DCC2]/60 shadow-xs">
              <div className="relative w-48 h-64">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
              {product.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest bg-[#FBF4E2] text-[#967120] border border-[#E8DCC2] uppercase">
                  {product.badge}
                </span>
              )}
            </div>

          {/* Details & Notes */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] text-[#967120] font-bold tracking-widest uppercase">
                {product.brand} • {product.categoryLabel}
              </span>
              <h2 className="font-luxury text-2xl font-bold text-[#171513] mt-0.5">
                {product.name}
              </h2>
              <div className="text-lg font-extrabold text-[#171513] mt-1">
                {product.price.toLocaleString('fr-FR')}{' '}
                <span className="text-xs text-[#967120] font-bold">FCFA</span>{' '}
                <span className="text-xs text-[#9E968D] font-normal font-mono">({product.volume})</span>
              </div>
            </div>

            <p className="text-xs text-[#6B655E] leading-relaxed">
              {product.description}
            </p>

            {/* Olfactory Pyramid */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2] space-y-2.5">
              <div className="text-[11px] font-bold text-[#171513] tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C59B3F]" />
                Pyramide Olfactive
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <Wind className="w-3.5 h-3.5 text-[#C59B3F] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#171513]">Tête : </span>
                    <span className="text-[#6B655E]">{product.topNotes.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 text-[#C59B3F] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#171513]">Cœur : </span>
                    <span className="text-[#6B655E]">{product.heartNotes.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Droplet className="w-3.5 h-3.5 text-[#C59B3F] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#171513]">Fond : </span>
                    <span className="text-[#6B655E]">{product.baseNotes.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-1">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full py-3 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter au Panier ({product.price.toLocaleString('fr-FR')} FCFA)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
