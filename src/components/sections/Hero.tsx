'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useStore } from '@/context/StoreContext';

interface HeroProps {
  onExploreClick?: () => void;
}

export function Hero({ onExploreClick }: HeroProps) {
  const { heroProduct } = useStore();

  return (
    <section className="relative bg-[#FAF8F5] border-b border-[#E8DCC2] px-4 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DCC2] text-[#967120] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B3F]" />
            Boutique de Haute Parfumerie • Dakar
          </div>

          <h1 className="font-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171513] leading-tight">
            Des fragrances d’exception,{' '}
            <span className="text-[#C59B3F]">un sillage inoubliable.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#6B655E] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Sélection exclusive de parfums orientaux, gourmands et boisés à Dakar. 
            Flacons 100% originaux, certifiés et livrés chez vous en toute discrétion.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href="/boutique"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#171513] text-white font-bold text-xs tracking-wider uppercase hover:bg-[#C59B3F] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Accéder à la boutique</span>
              <ArrowRight className="w-4 h-4 text-[#C59B3F]" />
            </Link>

            <a
              href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent("Bonjour MG Perfume, je souhaite un conseil personnalisé pour choisir mon parfum.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white border border-[#E8DCC2] hover:border-[#C59B3F] text-[#171513] font-semibold text-xs tracking-wider uppercase transition-all text-center shadow-xs"
            >
              Conseil WhatsApp
            </a>
          </div>

          {/* Reassurance */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E8DCC2] text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#171513]">100% Authentiques</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#171513]">Dakar 2h à 4h</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#171513]">Paiement à réception</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Pure White Card (Édition Phare) */}
        <div className="lg:col-span-5 flex justify-center">
          <Link 
            href={`/boutique`}
            className="block relative w-full max-w-xs bg-white rounded-3xl p-5 border border-[#E8DCC2] shadow-sm hover:shadow-md transition-shadow space-y-3"
          >
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-[#967120] uppercase">
              <span className="px-2.5 py-0.5 rounded bg-[#FBF4E2] border border-[#E8DCC2]">Édition Phare</span>
              <span className="text-[#9E968D]">{heroProduct.brand || 'MG Perfume'}</span>
            </div>

            {/* Pure white container (Rule 7.1) */}
            <div className="relative w-full h-56 flex items-center justify-center bg-white rounded-2xl">
              <div className="relative w-44 h-52">
                <Image
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="space-y-0.5 text-center">
              <h3 className="font-luxury text-base font-bold text-[#171513]">{heroProduct.name}</h3>
              <p className="text-xs text-[#6B655E] line-clamp-1">{heroProduct.tagline || heroProduct.categoryLabel}</p>
              <div className="pt-1 flex items-center justify-center gap-2">
                <span className="text-sm font-extrabold text-[#967120]">
                  {heroProduct.price.toLocaleString('fr-FR')} FCFA
                </span>
                {heroProduct.originalPrice && (
                  <span className="text-xs text-red-500 line-through">
                    {heroProduct.originalPrice.toLocaleString('fr-FR')} FCFA
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>

      </div>
    </section>
  );
}
