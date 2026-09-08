'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function EditorialBanners() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* 2 Big Editorial Visual Cards inspired by Olfea style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Banner 1: Vert Émeraude / Senteurs d'Orient & Muscs */}
        <div className="group relative rounded-3xl overflow-hidden bg-[#0D2818] border border-[#C59B3F]/30 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-6 sm:p-8 text-white shadow-lg">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/shooting/naimez-que-moi-model.jpg"
              alt="Mannequin MG Perfume N'aimez que moi"
              fill
              className="object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05130B] via-[#05130B]/40 to-transparent" />
          </div>

          {/* Top Tag */}
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-black/50 border border-[#C59B3F]/40 text-[#F3E5AB]">
              Senteurs d’Orient
            </span>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 space-y-2">
            <h3 className="font-luxury text-2xl sm:text-3xl font-bold tracking-wide text-white leading-tight">
              Élixirs & Gouttes Intimes
            </h3>
            <p className="text-xs text-[#E8DCC2] max-w-xs font-normal">
              L'art de séduire sans un mot. Des textures soyeuses pour le rituel du layering.
            </p>
            <div className="pt-2">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#F3E5AB] uppercase tracking-wider group-hover:text-white transition-colors"
              >
                <span>Découvrir la collection</span>
                <ArrowRight className="w-4 h-4 text-[#C59B3F] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Banner 2: Bordeaux Profond / Eaux de Parfum Féminines */}
        <div className="group relative rounded-3xl overflow-hidden bg-[#350B14] border border-[#C59B3F]/30 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-6 sm:p-8 text-white shadow-lg">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/shooting/rose-desir-model.jpg"
              alt="Mannequin MG Perfume Rose Désir"
              fill
              className="object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F040A] via-[#1F040A]/40 to-transparent" />
          </div>

          {/* Top Tag */}
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-black/50 border border-[#C59B3F]/40 text-[#F3E5AB]">
              Élixirs du Moment
            </span>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 space-y-2">
            <h3 className="font-luxury text-2xl sm:text-3xl font-bold tracking-wide text-white leading-tight">
              Fragrances Féminines Pailletées
            </h3>
            <p className="text-xs text-[#E8DCC2] max-w-xs font-normal">
              Des sillages solaires et scintillants qui habillent la peau de reflets précieux.
            </p>
            <div className="pt-2">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#F3E5AB] uppercase tracking-wider group-hover:text-white transition-colors"
              >
                <span>Explorer les créations</span>
                <ArrowRight className="w-4 h-4 text-[#C59B3F] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
