'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, Send, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';
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
      '👑 *COMMANDE — MG PERFUME DAKAR*',
      '━━━━━━━━━━━━━━━━━━━━━',
      ...(clientName ? [`👤 *Nom :* ${clientName}`] : []),
      ...(clientAddress ? [`📍 *Adresse / Quartier :* ${clientAddress}`] : []),
      `🚚 *Livraison :* ${currentZone.name} (+${currentZone.price.toLocaleString('fr-FR')} FCFA)`,
      '',
      '🛍️ *Articles :*',
      ...orderLines,
      '━━━━━━━━━━━━━━━━━━━━━',
      `💰 *TOTAL À PAYER : ${grandTotal.toLocaleString('fr-FR')} FCFA*`,
      '',
      'Bonjour, je souhaite valider cette commande svp ! 🙏',
    ].join('\n');

    return `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6">
        <div className="w-screen max-w-md bg-white border-l border-[#E8DCC2] flex flex-col shadow-2xl text-[#171513]">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#E8DCC2] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C59B3F]" />
              <h2 className="font-luxury text-lg font-bold">Votre Panier</h2>
              <span className="text-xs text-[#9E968D] font-mono">({items.reduce((a, b) => a + b.quantity, 0)})</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white border border-[#E8DCC2] text-[#6B655E] hover:text-[#171513] transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-12">
                <ShoppingBag className="w-10 h-10 text-[#C59B3F]/40" />
                <p className="font-luxury text-base font-bold text-[#171513]">Votre panier est vide</p>
                <p className="text-xs text-[#6B655E] max-w-xs">
                  Ajoutez un parfum depuis le catalogue pour préparer votre commande.
                </p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2]/80 items-center justify-between"
                >
                  <div className="relative w-14 h-14 rounded-xl bg-white border border-[#E8DCC2]/60 p-1 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-luxury text-xs font-bold text-[#171513] truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs font-extrabold text-[#967120]">
                      {(product.price * quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-[10px] text-[#9E968D]">{product.brand}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center rounded-lg bg-white border border-[#E8DCC2] p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="p-1 text-[#6B655E] hover:text-[#171513]"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1.5 text-xs font-bold">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="p-1 text-[#6B655E] hover:text-[#171513]"
                        aria-label="Augmenter"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout (Refined, perfectly sized) */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E8DCC2] bg-[#FAF8F5] space-y-3.5">
              
              {/* Delivery Zone Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#171513] flex items-center gap-1 uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-[#C59B3F]" />
                  Zone de Livraison (Dakar & Régions)
                </label>
                <select
                  value={selectedZoneId}
                  onChange={e => setSelectedZoneId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#E8DCC2] text-[#171513] focus:outline-none focus:border-[#C59B3F]"
                >
                  {siteConfig.shippingZones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} (+{zone.price.toLocaleString('fr-FR')} FCFA) — {zone.delay}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Info Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Votre Nom"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-white border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F]"
                />
                <input
                  type="text"
                  placeholder="Quartier / Adresse"
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-white border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F]"
                />
              </div>

              {/* Totals Breakdown */}
              <div className="pt-2 border-t border-[#E8DCC2] space-y-1 text-xs text-[#6B655E]">
                <div className="flex justify-between">
                  <span>Sous-total parfums</span>
                  <span className="text-[#171513] font-semibold">{itemsSubtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison ({currentZone.delay})</span>
                  <span className="text-[#171513] font-semibold">+{currentZone.price.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#171513] pt-1.5 border-t border-[#E8DCC2]">
                  <span>Total commande</span>
                  <span className="text-[#967120]">{grandTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Refined WhatsApp Button (Clean & Compact) */}
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-[#171513] hover:bg-[#25D366] text-white font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Send className="w-3.5 h-3.5 text-[#25D366] group-hover:text-white" />
                <span>Commander sur WhatsApp • {grandTotal.toLocaleString('fr-FR')} FCFA</span>
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9E968D] text-center">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Paiement à la livraison (Espèces, Wave ou Orange Money)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
