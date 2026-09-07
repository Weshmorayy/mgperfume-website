'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, Send, ShoppingBag, MapPin, Sparkles } from 'lucide-react';
import { CartItem, ShippingZone } from '@/types';
import { siteConfig } from '@/config/site';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(siteConfig.shippingZones[0].id);
  const [clientName, setClientName] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');

  if (!isOpen) return null;

  const currentZone = siteConfig.shippingZones.find(z => z.id === selectedZoneId) || siteConfig.shippingZones[0];
  const itemsSubtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const grandTotal = items.length > 0 ? itemsSubtotal + currentZone.price : 0;

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return '#';

    const orderLines = items.map(
      (item) => `• *${item.product.name}* (${item.product.brand}) x${item.quantity} — ${(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA`
    );

    const message = [
      '👑 *NOUVELLE COMMANDE — MG PERFUME*',
      '━━━━━━━━━━━━━━━━━━━━━',
      ...(clientName ? [`👤 *Client :* ${clientName}`] : []),
      ...(clientAddress ? [`📍 *Adresse précise :* ${clientAddress}`] : []),
      `🚚 *Zone de livraison :* ${currentZone.name} (+${currentZone.price.toLocaleString('fr-FR')} FCFA)`,
      '',
      '🛍️ *Parfums commandés :*',
      ...orderLines,
      '━━━━━━━━━━━━━━━━━━━━━',
      `💰 *TOTAL À PAYER : ${grandTotal.toLocaleString('fr-FR')} FCFA*`,
      '',
      'Merci de me confirmer la prise en charge et le créneau de livraison ! 🙏',
    ].join('\n');

    return `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#13110E] border-l border-[#D4AF37]/30 flex flex-col shadow-2xl text-[#FBF8F3]">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-luxury text-xl font-bold tracking-wide">Votre Panier</h2>
              <span className="text-xs text-[#A8A196] font-mono">({items.reduce((a, b) => a + b.quantity, 0)} articles)</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#1C1A17] text-[#A8A196] hover:text-[#FBF8F3] hover:bg-[#2A2621] transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <ShoppingBag className="w-12 h-12 text-[#D4AF37]/40" />
                <p className="font-luxury text-lg text-[#FBF8F3]">Votre panier est vide</p>
                <p className="text-xs text-[#A8A196] max-w-xs">
                  Choisissez une création parmi notre collection pour commencer votre commande.
                </p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3.5 rounded-2xl bg-[#0C0B0A] border border-[#D4AF37]/20 items-center justify-between"
                >
                  <div className="relative w-16 h-16 rounded-xl bg-[#141210] p-1 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-luxury text-sm font-bold text-[#FBF8F3] truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#D4AF37] font-semibold">
                      {(product.price * quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-[10px] text-[#A8A196]">{product.brand}</p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg bg-[#181512] border border-[#D4AF37]/20 p-1">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="p-1 text-[#A8A196] hover:text-[#FBF8F3]"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-[#FBF8F3]">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="p-1 text-[#A8A196] hover:text-[#FBF8F3]"
                        aria-label="Augmenter"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="p-2 text-rose-400 hover:text-rose-300"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#D4AF37]/20 bg-[#0E0C0A] space-y-4">
              {/* Delivery Zone Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  Zone de Livraison (Dakar & Régions)
                </label>
                <select
                  value={selectedZoneId}
                  onChange={e => setSelectedZoneId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#181512] border border-[#D4AF37]/30 text-[#FBF8F3] focus:outline-none focus:border-[#D4AF37]"
                >
                  {siteConfig.shippingZones.map(zone => (
                    <option key={zone.id} value={zone.id} className="bg-[#181512]">
                      {zone.name} (+{zone.price.toLocaleString('fr-FR')} FCFA) — {zone.delay}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Client Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Votre Nom"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="text-xs p-2.5 rounded-xl bg-[#181512] border border-[#D4AF37]/20 text-[#FBF8F3] placeholder-[#A8A196]/60 focus:outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="text"
                  placeholder="Quartier / Repère"
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  className="text-xs p-2.5 rounded-xl bg-[#181512] border border-[#D4AF37]/20 text-[#FBF8F3] placeholder-[#A8A196]/60 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Totals Breakdown */}
              <div className="pt-2 border-t border-[#D4AF37]/15 space-y-1.5 text-xs text-[#A8A196]">
                <div className="flex justify-between">
                  <span>Sous-total parfums</span>
                  <span className="text-[#FBF8F3] font-semibold">{itemsSubtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison ({currentZone.delay})</span>
                  <span className="text-[#FBF8F3] font-semibold">+{currentZone.price.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#D4AF37] pt-1 border-t border-[#D4AF37]/10">
                  <span>Total à la livraison</span>
                  <span>{grandTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Order via WhatsApp CTA */}
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-emerald-900/40 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Commander sur WhatsApp ({grandTotal.toLocaleString('fr-FR')} FCFA)
              </a>

              <p className="text-[11px] text-center text-[#A8A196]">
                Paiement à la livraison (Espèces, Wave ou Orange Money)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
