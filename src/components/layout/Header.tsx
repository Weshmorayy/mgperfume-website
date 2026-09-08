'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Phone, Menu, X, Sparkles, ChevronRight, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function Header({ cartCount, onOpenCart }: HeaderProps) {
  const pathname = usePathname();
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isNavDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavDrawerOpen]);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/a-propos', label: 'La Maison' },
    { href: '/livraison-faq', label: 'Livraison & FAQ' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#E8DCC2] shadow-xs">
        {/* Top micro banner */}
        <div className="bg-[#171513] text-[#F3E5AB] text-[11px] py-1.5 px-4 text-center border-b border-[#C59B3F]/20 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B3F] flex-shrink-0 animate-pulse" />
          <span className="font-medium tracking-wide">
            Livraison Express Dakar (2h-4h) • 100% Parfums Originaux & Certifiés
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-4">
            
            {/* Left: Direct Phone (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-[#6B655E]">
              <a 
                href={`tel:${siteConfig.contact.phone}`}
                className="flex items-center gap-1.5 hover:text-[#171513] font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#C59B3F]" />
                <span>{siteConfig.contact.phoneFormatted}</span>
              </a>
              <div className="flex items-center gap-1 text-[#9E968D]">
                <MapPin className="w-3 h-3 text-[#C59B3F]" />
                <span>Dakar, Sénégal</span>
              </div>
            </div>

            {/* Logo & Brand Title */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/brand/logo.png"
                  alt="MG Perfume Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-luxury text-xl sm:text-2xl font-bold tracking-widest text-[#171513] uppercase leading-tight">
                  MG Perfume
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#967120] uppercase font-semibold">
                  Parfumeur Créateur
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
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

            {/* Right: Cart Button & Mobile Menu Trigger */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onOpenCart}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#171513] text-white hover:bg-[#2A2621] transition-all shadow-xs"
                aria-label="Ouvrir le panier"
              >
                <ShoppingBag className="w-4 h-4 text-[#C59B3F]" />
                <span className="text-xs font-bold hidden sm:inline">Panier</span>
                <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-[#171513] bg-[#C59B3F] rounded-full">
                  {cartCount}
                </span>
              </button>

              <button
                onClick={() => setIsNavDrawerOpen(true)}
                className="md:hidden p-2 text-[#171513] hover:text-[#C59B3F] transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PORTAL-LEVEL RIGHT-SIDE DRAWER */}
      {isNavDrawerOpen && (
        <div className="fixed inset-0 !z-[999999] overflow-hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsNavDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white border-l border-[#E8DCC2] flex flex-col justify-between shadow-2xl p-6 relative z-10 animate-in slide-in-from-right duration-300">
              
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#E8DCC2]">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8">
                      <Image src="/images/brand/logo.png" alt="MG Perfume" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-luxury text-sm font-bold uppercase tracking-wider text-[#171513]">
                        MG Perfume
                      </span>
                      <span className="text-[8px] tracking-widest text-[#967120] uppercase font-semibold">
                        Parfumeur Créateur
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNavDrawerOpen(false)}
                    className="p-1.5 rounded-full bg-[#FAF8F5] border border-[#E8DCC2] text-[#6B655E] hover:text-[#171513]"
                    aria-label="Fermer le menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="py-6 space-y-1.5">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsNavDrawerOpen(false)}
                      className={`flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
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

              <div className="pt-6 border-t border-[#E8DCC2] space-y-3 text-xs text-[#6B655E]">
                <a 
                  href={`tel:${siteConfig.contact.phone}`} 
                  className="flex items-center gap-2 text-[#171513] font-bold"
                >
                  <Phone className="w-4 h-4 text-[#C59B3F]" />
                  <span>{siteConfig.contact.phoneFormatted}</span>
                </a>
                
                {siteConfig.social.facebook && (
                  <a
                    href={siteConfig.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#1877F2] font-semibold hover:underline"
                  >
                    <span>Page Facebook Officielle</span>
                  </a>
                )}

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C59B3F]" />
                  <span>Dakar, Sénégal</span>
                </div>
                <p className="text-[11px] text-[#9E968D]">
                  Ouvert du Lun au Sam : 09h00 - 20h00
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
