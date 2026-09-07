'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingBag, Phone, MapPin, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function Header({ cartCount, onOpenCart }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0908]/90 backdrop-blur-md border-b border-[#D4AF37]/20 transition-all duration-300">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-[#18140E] via-[#2A2215] to-[#18140E] text-[#F3E5AB] text-xs py-1.5 px-4 text-center border-b border-[#D4AF37]/15 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
        <span className="font-medium tracking-wide">
          Livraison Express Dakar & Banlieue • Parfums 100% Originaux & Certifiés
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Contact direct */}
        <div className="hidden md:flex items-center gap-6 text-sm text-[#A8A196]">
          <a 
            href={`tel:${siteConfig.contact.phone}`}
            className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
          >
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            <span>{siteConfig.contact.phoneFormatted}</span>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-[#A8A196]/80">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Dakar, Sénégal</span>
          </div>
        </div>

        {/* Center: Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/brand/logo.png"
              alt="MG Perfume Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-luxury text-xl sm:text-2xl font-bold tracking-widest text-[#FBF8F3] group-hover:text-[#D4AF37] transition-colors uppercase">
              MG Perfume
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase -mt-1 font-medium">
              Haute Parfumerie
            </span>
          </div>
        </a>

        {/* Right: Cart Button */}
        <button
          onClick={onOpenCart}
          className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1A1815] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#FBF8F3] hover:text-[#D4AF37] transition-all duration-300 group shadow-lg shadow-black/40"
          aria-label="Ouvrir le panier"
        >
          <ShoppingBag className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">Mon Panier</span>
          {cartCount > 0 ? (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-[#D4AF37] rounded-full animate-bounce">
              {cartCount}
            </span>
          ) : (
            <span className="text-xs text-[#A8A196]">0</span>
          )}
        </button>
      </div>
    </header>
  );
}
