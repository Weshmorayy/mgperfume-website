'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useStore } from '@/context/StoreContext';

export function EditorialBanners() {
  const { banners } = useStore();

  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Editorial Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <span className="text-[11px] font-bold text-[#967120] uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          L’Univers {siteConfig.brandName}
        </span>
        <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-[#171513]">
          Collections & Signatures d’Exception
        </h2>
      </div>

      {/* Grid of High-Fashion Editorial Cards (Dynamic from siteConfig, 100% Crisp Visuals with NO dark filters) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            style={{ backgroundColor: banner.bgColor }}
            className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 flex flex-col justify-between aspect-[4/5] sm:aspect-[3/4] md:min-h-[480px]"
          >
            {/* Real Photo — 100% crystal clear with custom object position */}
            <div className="absolute inset-0 z-0">
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                style={{ objectPosition: banner.objectPosition || 'center' }}
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority={index < 2}
              />
            </div>

            {/* Top Editorial Floating Label */}
            <div className="relative z-10 p-6 sm:p-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#F3E5AB] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {banner.tag}
              </span>
              <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {banner.title}
              </h3>
              <div className="pt-2">
                <Link
                  href={banner.href}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#F3E5AB] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                >
                  <span>{banner.linkText}</span>
                  <ArrowRight className="w-4 h-4 text-[#F3E5AB] group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Empty bottom to let model/bottle visual breathe */}
            <div className="relative z-10 p-6" />
          </div>
        ))}
      </div>

    </section>
  );
}
