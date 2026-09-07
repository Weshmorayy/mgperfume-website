'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Phone, Menu, X, Sparkles, ChevronRight, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export function Header({
  cartCount,
  onOpenCart,
  searchQuery = '',
  onSearchChange,
}: HeaderProps) {
  const pathname = usePathname();
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/a-propos', label: 'La Maison' },
    { href: '/livraison-faq', label: 'Livraison & FAQ' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E8DCC2] shadow-xs">
      {/* Top Banner */}
      <div className="bg-[#171513] text-[#F3E5AB] text-[11px] py-1.5 px-4 text-center border-b border-[#C59B3F]/20 flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#C59B3F] flex-shrink-0" />
        <span className="font-medium tracking-wide">
          Livraison Express Dakar (2h-4h) • 100% Parfums Originaux & Certifiés
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-18 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10">
              <Image
                src="/images/brand/logo.png"
                alt="MG Perfume"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-luxury text-base sm:text-lg font-bold tracking-widest text-[#171513] uppercase leading-none">
                MG Perfume
              </span>
              <span className="text-[9px] tracking-[0.2em] text-[#967120] uppercase font-semibold mt-0.5">
                Dakar
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[#6B655E]">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-[#171513] transition-colors py-1 ${
                  pathname === link.href ? 'text-[#967120] font-bold border-b-2 border-[#C59B3F]' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Search, Cart & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Desktop Search Bar (if search handler provided) */}
            {onSearchChange && (
              <div className="hidden lg:flex items-center relative w-48 xl:w-56">
                <Search className="w-3.5 h-3.5 text-[#9E968D] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F] focus:bg-white transition-all"
                />
              </div>
            )}

            {/* Mobile Search Icon */}
            {onSearchChange && (
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-[#171513] hover:text-[#C59B3F]"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#171513] text-white hover:bg-[#2A2621] transition-all shadow-xs"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="w-4 h-4 text-[#C59B3F]" />
              <span className="text-xs font-bold hidden sm:inline">Panier</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-[#171513] bg-[#C59B3F] rounded-full">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Hamburger (Opens right-side drawer) */}
            <button
              onClick={() => setIsNavDrawerOpen(true)}
              className="md:hidden p-2 text-[#171513] hover:text-[#C59B3F]"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isSearchOpen && onSearchChange && (
          <div className="lg:hidden pb-3 pt-1 animate-in fade-in duration-150">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9E968D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un parfum, une note..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2 rounded-full bg-[#FAF8F5] border border-[#E8DCC2] text-[#171513] focus:outline-none focus:border-[#C59B3F] focus:bg-white"
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
      </div>

      {/* Right-Side Mobile Navigation Drawer */}
      {isNavDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white border-l border-[#E8DCC2] flex flex-col justify-between shadow-2xl p-6">
              
              {/* Drawer Top */}
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#E8DCC2]">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7">
                      <Image src="/images/brand/logo.png" alt="MG Perfume" fill className="object-contain" />
                    </div>
                    <span className="font-luxury text-sm font-bold uppercase tracking-wider text-[#171513]">
                      MG Perfume
                    </span>
                  </div>
                  <button
                    onClick={() => setIsNavDrawerOpen(false)}
                    className="p-1.5 rounded-full bg-[#FAF8F5] border border-[#E8DCC2] text-[#6B655E]"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="py-6 space-y-1">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsNavDrawerOpen(false)}
                      className={`flex items-center justify-between py-3 px-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                        pathname === link.href
                          ? 'bg-[#FAF8F5] text-[#967120] font-bold border-l-4 border-[#C59B3F]'
                          : 'text-[#171513] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#9E968D]" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Drawer Bottom Contact */}
              <div className="pt-6 border-t border-[#E8DCC2] space-y-3 text-xs text-[#6B655E]">
                <div className="flex items-center gap-2 text-[#171513] font-bold">
                  <Phone className="w-4 h-4 text-[#C59B3F]" />
                  <a href={`tel:${siteConfig.contact.phone}`}>{siteConfig.contact.phoneFormatted}</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C59B3F]" />
                  <span>Dakar, Sénégal</span>
                </div>
                <p className="text-[11px] text-[#9E968D]">
                  Ouvert du Lundi au Samedi : 09h - 20h
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}
