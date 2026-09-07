import React from 'react';
import Image from 'next/image';
import { Sparkles, ShieldCheck, Truck, ArrowDown } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface HeroProps {
  onExploreClick: () => void;
}

export function Hero({ onExploreClick }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-[#0A0908] via-[#12100D] to-[#0A0908] overflow-hidden px-4 py-16 sm:py-24">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Headline & Call To Action */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181511] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Collection Exclusive Dakar 2026
          </div>

          <h1 className="font-luxury text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FBF8F3] leading-[1.15] tracking-tight">
            Votre signature olfactive,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222]">
              unique & inoubliable.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#A8A196] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Découvrez notre sélection de fragrances d’exception et d’essences orientales. 
            Des créations aux sillages intenses, conçues pour marquer les esprits du matin jusqu’au soir.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E5C378] to-[#C5A059] text-black font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Découvrir la Collection</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent("Bonjour MG Perfume, je souhaite des conseils pour choisir mon parfum.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#171512] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#FBF8F3] hover:text-[#D4AF37] font-semibold text-sm tracking-wider uppercase transition-all duration-300 text-center"
            >
              Conseil Personnalisé WhatsApp
            </a>
          </div>

          {/* Reassurance pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#D4AF37]/15 text-left">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#FBF8F3]">100% Authentiques</p>
                <p className="text-[11px] text-[#A8A196]">Flacons originaux</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#FBF8F3]">Livraison Dakar</p>
                <p className="text-[11px] text-[#A8A196]">Rapide & discrète</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#FBF8F3]">Tenue Supérieure</p>
                <p className="text-[11px] text-[#A8A196]">Haute concentration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Featured visual showcase */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-72 sm:w-80 h-96 sm:h-[440px] rounded-3xl p-4 bg-gradient-to-b from-[#1C1914] to-[#0E0C0A] border border-[#D4AF37]/40 shadow-2xl shadow-black/80 flex flex-col items-center justify-between group overflow-hidden">
            {/* Top tag */}
            <div className="w-full flex justify-between items-center text-[11px] font-semibold tracking-wider text-[#D4AF37] uppercase z-10">
              <span className="px-2.5 py-1 rounded bg-black/60 border border-[#D4AF37]/30">Coup de cœur</span>
              <span className="text-[#A8A196]">Nusuk Paris</span>
            </div>

            {/* Product Image */}
            <div className="relative w-56 h-64 my-auto transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/images/products/raheeq.jpg"
                alt="Flacon Raheeq par MG Perfume"
                fill
                className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
                priority
              />
            </div>

            {/* Bottom info banner */}
            <div className="w-full p-3 rounded-2xl bg-black/70 border border-[#D4AF37]/20 backdrop-blur-md text-center z-10">
              <h2 className="font-luxury text-base font-bold text-[#FBF8F3] tracking-wide">Raheeq — Extrait Solaire</h2>
              <p className="text-[11px] text-[#D4AF37] font-medium">Miel doré • Caramel • Magnolia • Vanille</p>
              <div className="mt-1 text-sm font-extrabold text-[#FBF8F3]">25 000 FCFA</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
