import React from 'react';
import Image from 'next/image';
import { Sparkles, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface HeroProps {
  onExploreClick: () => void;
}

export function Hero({ onExploreClick }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-b from-[#F3ECE2] via-[#FAF8F5] to-[#FAF8F5] border-b border-[#E8DCC2]/60 px-4 py-12 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Text Col */}
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DCC2] text-[#967120] text-xs font-semibold tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B3F]" />
            Boutique & Livraison à Dakar
          </div>

          <h1 className="font-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171513] leading-tight">
            Des fragrances nobles et intenses,{' '}
            <span className="text-[#C59B3F] italic">accessibles à Dakar.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#6B655E] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Découvrez les plus belles créations orientales et gourmandes. Flacons 100% originaux, 
            sélectionnés pour leur sillage persistant et leur rapport qualité-prestige remarquable.
          </p>

          {/* Quick CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#171513] text-white font-bold text-xs tracking-wider uppercase hover:bg-[#C59B3F] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              <span>Parcourir le catalogue</span>
              <ArrowRight className="w-4 h-4 text-[#C59B3F]" />
            </button>

            <a
              href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent("Bonjour MG Perfume, je souhaite des conseils pour choisir un parfum.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8DCC2] hover:border-[#C59B3F] text-[#171513] font-semibold text-xs tracking-wider uppercase transition-all duration-300 text-center shadow-sm"
            >
              Conseil WhatsApp Direct
            </a>
          </div>

          {/* Trust markers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E8DCC2] text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#171513]">100% Originaux</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#171513]">Livraison Dakar 2h-4h</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#171513]">Paiement à la remise</span>
            </div>
          </div>
        </div>

        {/* Visual Card Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E8DCC2] shadow-xl space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-[#967120] uppercase">
              <span className="px-2.5 py-1 rounded bg-[#FBF4E2] border border-[#E8DCC2]">Édition Phare</span>
              <span className="text-[#9E968D]">Lattafa Paris</span>
            </div>

            <div className="relative w-full h-56 flex items-center justify-center bg-[#FAF8F5] rounded-2xl p-2">
              <div className="relative w-48 h-48">
                <Image
                  src="/images/products/khamrah-waha.jpg"
                  alt="Khamrah Waha"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <h3 className="font-luxury text-lg font-bold text-[#171513]">Khamrah Waha</h3>
              <p className="text-xs text-[#6B655E]">Yuzu • Concombre • Sel de mer • Fève Tonka</p>
              <div className="pt-2 text-base font-extrabold text-[#967120]">
                35 000 FCFA
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
