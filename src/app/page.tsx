'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Catalog } from '@/components/sections/Catalog';
import { ProductModal } from '@/components/sections/ProductModal';
import { CartDrawer } from '@/components/sections/CartDrawer';
import { RitualSection } from '@/components/sections/RitualSection';
import { EditorialBanners } from '@/components/sections/EditorialBanners';
import { PerfumeProduct, CartItem } from '@/types';
import { ArrowRight, Sparkles, Award } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function HomePage() {
  const { selectionDuMoment } = useStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PerfumeProduct | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mg_perfume_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mg_perfume_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const handleAddToCart = (product: PerfumeProduct) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#171513]">
      <Header
        cartCount={totalCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-grow">
        <Hero />

        {/* Editorial Visual Banners (Shooting Studio & Olfea style inspiration) */}
        <EditorialBanners />

        {/* Featured Showcase on Home */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-bold text-[#967120] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Sélection du Moment ({selectionDuMoment.length} Parfums)
              </span>
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-[#171513] mt-0.5">
                Les Parfums en Vedette
              </h2>
            </div>

            <Link
              href="/boutique"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#967120] hover:text-[#171513] transition-colors"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <Catalog
            products={selectionDuMoment}
            onAddToCart={handleAddToCart}
            onSelectProduct={p => setSelectedProduct(p)}
            showFilters={false}
          />
        </section>

        {/* Brand Banner */}
        <section className="py-12 bg-white border-y border-[#E8DCC2] px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <Award className="w-8 h-8 text-[#C59B3F] mx-auto" />
            <h2 className="font-luxury text-2xl font-bold text-[#171513]">
              L’Art du Parfum Oriental à Dakar
            </h2>
            <p className="text-xs sm:text-sm text-[#6B655E] leading-relaxed">
              Chez MG Perfume, nous croyons qu’un parfum est bien plus qu’un accessoire : 
              c’est une signature personnelle. Profitez d'une livraison rapide à domicile partout à Dakar 
              avec le paiement à la livraison en toute tranquillité.
            </p>
            <div className="pt-2">
              <Link
                href="/a-propos"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#171513] hover:text-[#967120] border-b border-[#171513] pb-0.5"
              >
                <span>Découvrir notre engagement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <RitualSection />
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={id => setCartItems(prev => prev.filter(i => i.product.id !== id))}
        onClearCart={() => setCartItems([])}
      />

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
