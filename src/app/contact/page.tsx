'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/sections/CartDrawer';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { CartItem } from '@/types';

export default function ContactPage() {
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

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[11px] font-bold text-[#967120] uppercase tracking-widest">
            À votre écoute
          </span>
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-[#171513]">
            Contactez MG Perfume
          </h1>
          <p className="text-xs sm:text-sm text-[#6B655E] max-w-xl mx-auto">
            Une question sur une fragrance, un créneau de livraison ou un conseil sur-mesure ?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC2] shadow-xs space-y-5">
            <h2 className="font-luxury text-lg font-bold text-[#171513]">
              Nos Coordonnées
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#6B655E]">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#C59B3F] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#171513]">Téléphone & WhatsApp</p>
                  <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-[#967120]">
                    {siteConfig.contact.phoneFormatted}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C59B3F] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#171513]">Email</p>
                  <p>{siteConfig.contact.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C59B3F] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#171513]">Localisation</p>
                  <p>{siteConfig.contact.address}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DCC2]">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent("Bonjour MG Perfume, je vous contacte depuis votre site internet.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-[#25D366] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#1ebd59] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Écrire sur WhatsApp Direct
              </a>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC2] shadow-xs space-y-4">
            <h2 className="font-luxury text-lg font-bold text-[#171513]">
              Horaires & Informations
            </h2>
            <p className="text-xs text-[#6B655E] leading-relaxed">
              Nous sommes disponibles pour répondre à toutes vos demandes du Lundi au Samedi de 09h00 à 20h00.
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2] text-xs space-y-1">
              <p className="font-bold text-[#171513]">Lundi — Samedi :</p>
              <p className="text-[#6B655E]">09h00 - 20h00 (Livraison non-stop)</p>
              <p className="font-bold text-[#171513] pt-2">Dimanche :</p>
              <p className="text-[#6B655E]">Sur rendez-vous WhatsApp</p>
            </div>
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
