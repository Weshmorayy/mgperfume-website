'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function EditorialBanners() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Editorial Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <span className="text-[11px] font-bold text-[#967120] uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          L’Univers MG Perfume
        </span>
        <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-[#171513]">
          Collections & Signatures d’Exception
        </h2>
      </div>

      {/* Grid of 4 High-Fashion Editorial Cards (Matching Olfea Inspiration, 100% Crisp Visuals with NO dark filters) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Card 1: N'aimez Que Moi — Modèle & Émulsion (Vert Émeraude Profond d'origine) */}
        <div className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-[#0E2A1A] flex flex-col justify-between aspect-[4/5] sm:aspect-[3/4] md:min-h-[480px]">
          {/* Real Photo — 100% crystal clear without darkening filter */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/shooting/naimez-que-moi-model.jpg"
              alt="Mannequin MG Perfume N'aimez Que Moi"
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
          </div>

          {/* Top Editorial Floating Label */}
          <div className="relative z-10 p-6 sm:p-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F3E5AB] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Senteurs d’Orient
            </span>
            <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              ÉLIXIRS & GOUTTES INTIMES
            </h3>
            <div className="pt-2">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#F3E5AB] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                <span>Découvrir la collection</span>
                <ArrowRight className="w-4 h-4 text-[#F3E5AB] group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Empty bottom to let model and bottle shine completely */}
          <div className="relative z-10 p-6" />
        </div>

        {/* Card 2: Rose Désir — Élixir Pailleté & Modèle (Bordeaux Somptueux d'origine) */}
        <div className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-[#350B14] flex flex-col justify-between aspect-[4/5] sm:aspect-[3/4] md:min-h-[480px]">
          {/* Real Photo — 100% crisp and clear */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/shooting/rose-desir-model.jpg"
              alt="Shooting Rose Désir MG Perfume"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
          </div>

          {/* Top Editorial Floating Label */}
          <div className="relative z-10 p-6 sm:p-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F3E5AB] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Élixirs du Moment
            </span>
            <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              FRAGRANCES FÉMININES
            </h3>
            <div className="pt-2">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#F3E5AB] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                <span>Explorer les créations</span>
                <ArrowRight className="w-4 h-4 text-[#F3E5AB] group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Empty bottom */}
          <div className="relative z-10 p-6" />
        </div>

        {/* Card 3: Un Amour — Vaporisation Solaire & Mannequin */}
        <div className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-[#250810] flex flex-col justify-between aspect-[4/5] sm:aspect-[3/4] md:min-h-[480px]">
          {/* Real Photo — 100% crisp spray visual */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/shooting/un-amour-spray.jpg"
              alt="Vaporisation Parfum Un Amour MG Perfume"
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Top Editorial Floating Label */}
          <div className="relative z-10 p-6 sm:p-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F3E5AB] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Le Geste & Le Sillage
            </span>
            <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              L’ART DU VAPORISATEUR
            </h3>
            <div className="pt-2">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#F3E5AB] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                <span>Voir la boutique</span>
                <ArrowRight className="w-4 h-4 text-[#F3E5AB] group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Empty bottom */}
          <div className="relative z-10 p-6" />
        </div>

        {/* Card 4: Gamme Gouttes Sensuelles — Les 4 Flacons en Podium */}
        <div className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-[#0E1E38] flex flex-col justify-between aspect-[4/5] sm:aspect-[3/4] md:min-h-[480px]">
          {/* Real Photo — 100% crisp bottle podium visual */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/shooting/gamme-gouttes.jpg"
              alt="Podium Huiles et Muscs MG Perfume"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Top Editorial Floating Label */}
          <div className="relative z-10 p-6 sm:p-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F3E5AB] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Rituel de Layering
            </span>
            <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              HUILES & MUSCS INTENSES
            </h3>
            <div className="pt-2">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#F3E5AB] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                <span>Découvrir les muscs</span>
                <ArrowRight className="w-4 h-4 text-[#F3E5AB] group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Empty bottom */}
          <div className="relative z-10 p-6" />
        </div>

      </div>

    </section>
  );
}
