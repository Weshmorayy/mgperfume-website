'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/sections/CartDrawer';
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';
import { CartItem } from '@/types';

export default function AProposPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mg_perfume_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch {}
  }, []);

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#171513]">
      <Header cartCount={totalCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[11px] font-bold text-[#967120] uppercase tracking-widest">
            Maison & Philosophie
          </span>
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-[#171513]">
            À Propos de MG Perfume
          </h1>
          <p className="text-xs sm:text-sm text-[#6B655E] max-w-xl mx-auto">
            L'exigence du sillage et l'amour des fragrances orientales authentiques à Dakar.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DCC2] shadow-xs space-y-6">
          <h2 className="font-luxury text-xl font-bold text-[#171513]">
            Notre Histoire & Notre Mission
          </h2>
          <p className="text-xs sm:text-sm text-[#6B655E] leading-relaxed">
            Fondée avec la passion des essences rares, **MG Perfume** est née d’un constat simple : 
            les amoureux du parfum à Dakar méritent d'accéder à des fragrances authentiques, 
            de haute concentration et aux sillages longue durée, sans compromis sur la qualité.
          </p>
          <p className="text-xs sm:text-sm text-[#6B655E] leading-relaxed">
            Nous sélectionnons rigoureusement chaque flacon auprès des plus grandes maisons de parfumerie 
            orientale et de niche (Lattafa, Afnan, Nusuk, Z / Aoud...). Chaque parfum raconte une histoire 
            et incarne une présence affirmée.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E8DCC2] space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#C59B3F]" />
            <h3 className="font-luxury text-base font-bold text-[#171513]">100% Originaux</h3>
            <p className="text-xs text-[#6B655E] leading-relaxed">
              Zéro contrefaçon. Flacons sous blister scellés et approvisionnements certifiés.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E8DCC2] space-y-3">
            <Award className="w-6 h-6 text-[#C59B3F]" />
            <h3 className="font-luxury text-base font-bold text-[#171513]">Conseil Personnalisé</h3>
            <p className="text-xs text-[#6B655E] leading-relaxed">
              Nous vous orientons selon votre style, vos goûts (boisé, sucré, floral) et la saison.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E8DCC2] space-y-3">
            <Heart className="w-6 h-6 text-[#C59B3F]" />
            <h3 className="font-luxury text-base font-bold text-[#171513]">Service Express</h3>
            <p className="text-xs text-[#6B655E] leading-relaxed">
              Livraison rapide en main propre à Dakar et paiement sécurisé à la réception.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171513] text-white font-bold text-xs tracking-wider uppercase hover:bg-[#C59B3F] transition-colors"
          >
            <span>Découvrir nos créations</span>
            <ArrowRight className="w-4 h-4 text-[#C59B3F]" />
          </Link>
        </div>
      </main>

      <Footer />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onClearCart={() => {}}
      />
    </div>
  );
}
