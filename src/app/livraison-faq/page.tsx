'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/sections/CartDrawer';
import { Truck, CreditCard, Clock, HelpCircle, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { CartItem } from '@/types';

export default function LivraisonFaqPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mg_perfume_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch {}
  }, []);

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const faqs = [
    {
      q: 'Comment s’effectue la livraison à Dakar ?',
      a: 'Nos livreurs vous remettent votre commande directement en main propre à domicile ou au bureau dans un délai de 2h à 4h.',
    },
    {
      q: 'Quels sont les modes de paiement acceptés ?',
      a: 'Vous réglez à la livraison en espèces, par Wave ou via Orange Money après vérification de votre colis.',
    },
    {
      q: 'Livrez-vous dans les régions du Sénégal ?',
      a: 'Oui, nous expédions dans toutes les régions (Thiès, Saint-Louis, Mbour, Ziguinchor...) via les services GP ou transporteurs partenaires en 24h à 48h.',
    },
    {
      q: 'Les parfums sont-ils des originaux ?',
      a: 'Absolument. Tous nos parfums sont 100% originaux, neufs et scellés dans leur boîte d’origine.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#171513]">
      <Header cartCount={totalCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[11px] font-bold text-[#967120] uppercase tracking-widest">
            Transparence & Sérénité
          </span>
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-[#171513]">
            Livraison & Questions Fréquentes
          </h1>
          <p className="text-xs sm:text-sm text-[#6B655E] max-w-xl mx-auto">
            Retrouvez tous les tarifs de livraison et les réponses à vos questions.
          </p>
        </div>

        {/* Shipping Zones Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC2] shadow-xs space-y-4">
          <h2 className="font-luxury text-lg font-bold text-[#171513] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C59B3F]" />
            Zones & Tarifs de Livraison
          </h2>

          <div className="divide-y divide-[#E8DCC2]">
            {siteConfig.shippingZones.map(zone => (
              <div key={zone.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-[#171513]">{zone.name}</p>
                  <p className="text-[11px] text-[#9E968D]">Délai estimé : {zone.delay}</p>
                </div>
                <div className="font-extrabold text-[#967120]">
                  {zone.price.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC2] shadow-xs space-y-6">
          <h2 className="font-luxury text-lg font-bold text-[#171513] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#C59B3F]" />
            Foire Aux Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2]/80 space-y-1.5">
                <h3 className="font-luxury text-sm font-bold text-[#171513]">{faq.q}</h3>
                <p className="text-xs text-[#6B655E] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
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
