'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckCircle, Clock, ShieldCheck, Truck, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useStore } from '@/context/StoreContext';
import { Order } from '@/types';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || 'MGP-OFFICIEL';
  const mode = searchParams.get('mode');
  const { orders } = useStore();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orders && orders.length > 0) {
      const found = orders.find(o => o.ref_command === ref);
      if (found) setOrder(found);
    }
  }, [orders, ref]);

  const whatsappMessage = encodeURIComponent(
    `Bonjour MG Perfume ! Je viens de passer la commande *#${ref}*. Pouvez-vous me confirmer la livraison svp ? 🙏`
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center space-y-8">
      
      {/* Success Badge */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 shadow-lg animate-in zoom-in-95 duration-300">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[#967120] uppercase tracking-widest block">
          Confirmation de commande
        </span>
        <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-[#171513]">
          Merci pour votre commande !
        </h1>
        <p className="text-sm text-[#6B655E] max-w-md mx-auto">
          Votre commande a bien été enregistrée. Notre équipe prépare votre sillage d’exception.
        </p>
      </div>

      {/* Order Reference Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DCC2] shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC2]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E968D]">Référence</span>
            <div className="font-mono text-base font-extrabold text-[#171513]">#{ref}</div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            {mode === 'sandbox' ? 'Test Sandbox' : 'Enregistrée'}
          </span>
        </div>

        {order && (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6B655E]">Client :</span>
              <span className="font-bold text-[#171513]">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B655E]">Téléphone :</span>
              <span className="font-bold text-[#171513]">{order.customer_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B655E]">Adresse :</span>
              <span className="font-bold text-[#171513]">{order.customer_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B655E]">Zone & Délai :</span>
              <span className="font-bold text-[#967120]">{order.shipping_zone_name}</span>
            </div>
            <div className="pt-2 border-t border-[#E8DCC2] flex justify-between text-sm font-extrabold text-[#171513]">
              <span>Total :</span>
              <span className="text-[#967120]">{order.total_amount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center gap-2 text-xs text-[#6B655E]">
          <Clock className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
          <span>Délai de livraison estimé : <strong>Sous 2h à 4h à Dakar</strong></span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Suivre ma commande sur WhatsApp</span>
        </a>

        <Link
          href="/boutique"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Retourner à la boutique</span>
        </Link>
      </div>

      {/* Reassurance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#E8DCC2] text-left">
        <div className="p-3 rounded-2xl bg-white border border-[#E8DCC2] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
          <span className="text-[11px] font-bold text-[#171513]">100% Originaux & Certifiés</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-[#E8DCC2] flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
          <span className="text-[11px] font-bold text-[#171513]">Livreurs discrets à Dakar</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-[#E8DCC2] flex items-center gap-2.5">
          <MessageCircle className="w-4 h-4 text-[#C59B3F] flex-shrink-0" />
          <span className="text-[11px] font-bold text-[#171513]">Support Client 7j/7</span>
        </div>
      </div>

    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#171513]">
      <Header cartCount={0} onOpenCart={() => {}} />
      <main className="flex-grow">
        <Suspense fallback={<div className="p-12 text-center text-xs">Chargement de votre confirmation...</div>}>
          <OrderConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
