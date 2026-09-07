'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Catalog } from '@/components/sections/Catalog';
import { ProductModal } from '@/components/sections/ProductModal';
import { CartDrawer } from '@/components/sections/CartDrawer';
import { PerfumeProduct, CartItem } from '@/types';

export default function BoutiquePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PerfumeProduct | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mg_perfume_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch {}
  }, []);

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
        {/* Page Title Header */}
        <div className="bg-white border-b border-[#E8DCC2] py-8 sm:py-10 px-4 text-center space-y-1">
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-[#171513]">
            La Boutique des Fragrances
          </h1>
          <p className="text-xs sm:text-sm text-[#6B655E] max-w-lg mx-auto">
            Trouvez votre signature olfactive parmi nos parfums orientaux et créations originales.
          </p>
        </div>

        <Catalog
          onAddToCart={handleAddToCart}
          onSelectProduct={product => setSelectedProduct(product)}
          showFilters={true}
        />
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={id => setCartItems(prev => prev.filter(i => i.product.id !== id))}
        onClearCart={() => setCartItems([])}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
