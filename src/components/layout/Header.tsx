'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Search, Phone, Menu, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  brands: string[];
}

export function Header({
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  selectedBrand,
  onSelectBrand,
  brands,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DCC2] shadow-sm transition-all duration-300">
      {/* Top Banner */}
      <div className="bg-[#171513] text-[#F3E5AB] text-xs py-2 px-4 text-center border-b border-[#C59B3F]/20 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#C59B3F] flex-shrink-0" />
        <span className="font-medium tracking-wide text-[11px] sm:text-xs">
          Livraison Express Dakar (2h-4h) • 100% Parfums Originaux & Certifiés
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Menu Trigger & Navigation Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#171513] hover:text-[#C59B3F]"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[#6B655E]">
              <button
                onClick={() => onSelectBrand('all')}
                className={`hover:text-[#171513] transition-colors ${selectedBrand === 'all' ? 'text-[#C59B3F] font-bold border-b-2 border-[#C59B3F] pb-1' : ''}`}
              >
                Tous les parfums
              </button>
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => onSelectBrand(brand)}
                  className={`hover:text-[#171513] transition-colors ${selectedBrand === brand ? 'text-[#C59B3F] font-bold border-b-2 border-[#C59B3F] pb-1' : ''}`}
                >
                  {brand}
                </button>
              ))}
            </nav>
          </div>

          {/* Center: Brand Identity */}
          <a href="#" className="flex items-center gap-2.5 text-center">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/images/brand/logo.png"
                alt="MG Perfume"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-luxury text-lg sm:text-xl font-bold tracking-widest text-[#171513] uppercase">
                MG Perfume
              </span>
              <span className="text-[9px] tracking-[0.2em] text-[#C59B3F] uppercase -mt-1 font-semibold">
                Haute Parfumerie Dakar
              </span>
            </div>
          </a>

          {/* Right: Search & Cart */}
          <div className="flex items-center gap-3">
            {/* Search Input (Desktop) */}
            <div className="hidden md:flex items-center relative w-56 lg:w-64">
              <Search className="w-4 h-4 text-[#9E968D] absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un parfum, une note..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-full bg-white border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F] focus:ring-1 focus:ring-[#C59B3F] shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-[#9E968D] hover:text-[#171513]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Button (Mobile toggle) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-[#171513] hover:text-[#C59B3F]"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#171513] text-white hover:bg-[#2A2621] transition-all shadow-md group"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="w-4 h-4 text-[#C59B3F] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-wider hidden sm:inline">Panier</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-[#171513] bg-[#C59B3F] rounded-full">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4 pt-1 animate-in fade-in duration-150">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9E968D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un parfum, une note..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2.5 rounded-full bg-white border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E968D]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E8DCC2] space-y-3 animate-in fade-in duration-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E968D]">Filtrer par Maison / Marque</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onSelectBrand('all');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${selectedBrand === 'all' ? 'bg-[#171513] text-white' : 'bg-white border border-[#E8DCC2] text-[#6B655E]'}`}
              >
                Tous les parfums
              </button>
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => {
                    onSelectBrand(brand);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${selectedBrand === brand ? 'bg-[#171513] text-white' : 'bg-white border border-[#E8DCC2] text-[#6B655E]'}`}
                >
                  {brand}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E8DCC2]/60 flex items-center justify-between text-xs text-[#6B655E]">
              <a href={`tel:${siteConfig.contact.phone}`} className="flex items-center gap-1.5 text-[#171513] font-semibold">
                <Phone className="w-3.5 h-3.5 text-[#C59B3F]" />
                {siteConfig.contact.phoneFormatted}
              </a>
              <span>{siteConfig.city}, Sénégal</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
