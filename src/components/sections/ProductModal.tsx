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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#13110E] rounded-3xl border border-[#D4AF37]/50 shadow-2xl p-6 sm:p-8 space-y-6 text-[#FBF8F3]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1C1A17] text-[#A8A196] hover:text-[#FBF8F3] hover:bg-[#2A2621] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image Showcase */}
          <div className="relative w-full h-72 sm:h-96 rounded-2xl bg-[#0A0908] p-4 flex items-center justify-center border border-[#D4AF37]/20">
            <div className="relative w-56 h-72">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
              />
            </div>
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold tracking-widest bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 uppercase">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details & Notes */}
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[#D4AF37] font-semibold tracking-widest uppercase">
                {product.brand} • {product.categoryLabel}
              </span>
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-[#FBF8F3] mt-1">
                {product.name}
              </h2>
              <div className="text-xl font-bold text-[#D4AF37] mt-2">
                {product.price.toLocaleString('fr-FR')} FCFA{' '}
                <span className="text-xs text-[#A8A196] font-normal font-mono">({product.volume})</span>
              </div>
            </div>

            <p className="text-sm text-[#A8A196] leading-relaxed">
              {product.description}
            </p>

            {/* Olfactory Pyramid */}
            <div className="p-4 rounded-2xl bg-[#0A0908] border border-[#D4AF37]/20 space-y-3">
              <div className="text-xs font-bold text-[#FBF8F3] tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Pyramide Olfactive
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Wind className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#F3E5AB]">Notes de Tête : </span>
                    <span className="text-[#A8A196]">{product.topNotes.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#F3E5AB]">Notes de Cœur : </span>
                    <span className="text-[#A8A196]">{product.heartNotes.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Droplet className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#F3E5AB]">Notes de Fond : </span>
                    <span className="text-[#A8A196]">{product.baseNotes.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E5C378] to-[#C5A059] text-black font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter au Panier ({product.price.toLocaleString('fr-FR')} FCFA)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
