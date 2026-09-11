'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  ShoppingBag, 
  MapPin, 
  CheckCircle, 
  CreditCard, 
  Phone, 
  User, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { CartItem, Order } from '@/types';
import { siteConfig } from '@/config/site';
import { useStore } from '@/context/StoreContext';
import { generateOrderReference } from '@/lib/paytech';

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
  onClearCart,
}: CartDrawerProps) {
  const { shippingZones, saveOrder } = useStore();

  const zonesList = shippingZones && shippingZones.length > 0 ? shippingZones : siteConfig.shippingZones;

  const [selectedZoneId, setSelectedZoneId] = useState<string>(zonesList[0]?.id || 'dakar-centre');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');
  const [isProcessingPaytech, setIsProcessingPaytech] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Synchroniser la zone par défaut si zonesList change
  useEffect(() => {
    if (zonesList.length > 0 && !zonesList.some(z => z.id === selectedZoneId)) {
      setSelectedZoneId(zonesList[0].id);
    }
  }, [zonesList, selectedZoneId]);

  // Bloquer le scroll en arrière-plan
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentZone = zonesList.find(z => z.id === selectedZoneId) || zonesList[0] || {
    id: 'dakar-centre',
    name: 'Dakar Centre',
    price: 2000,
    delay: 'Sous 2h à 4h',
  };

  const itemsSubtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const grandTotal = items.length > 0 ? itemsSubtotal + currentZone.price : 0;

  // Validation des champs clients
  const validateForm = (): boolean => {
    if (!clientName.trim()) {
      setFormError('Veuillez renseigner votre nom et prénom.');
      return false;
    }
    if (!clientPhone.trim() || clientPhone.trim().length < 8) {
      setFormError('Veuillez renseigner un numéro de téléphone valide (ex: 77 123 45 67).');
      return false;
    }
    if (!clientAddress.trim()) {
      setFormError('Veuillez indiquer votre quartier ou adresse exacte à Dakar.');
      return false;
    }
    setFormError(null);
    return true;
  };

  // Helper pour construire l'objet Order standard
  const buildOrderObject = (paymentMethod: 'paytech' | 'whatsapp'): Order => {
    const ref = generateOrderReference();
    return {
      id: `order-${Date.now()}`,
      ref_command: ref,
      customer_name: clientName.trim(),
      customer_phone: clientPhone.trim(),
      customer_address: clientAddress.trim(),
      shipping_zone_id: currentZone.id,
      shipping_zone_name: currentZone.name,
      shipping_cost: currentZone.price,
      subtotal: itemsSubtotal,
      total_amount: grandTotal,
      items: items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        brand: i.product.brand || 'MG Perfume',
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      payment_method: paymentMethod,
      payment_status: 'pending',
      order_status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  // 1. PAIEMENT EN LIGNE (PAYTECH - Wave, Orange Money, Carte)
  const handlePaytechCheckout = async () => {
    if (!validateForm()) return;

    setIsProcessingPaytech(true);
    setFormError(null);

    const order = buildOrderObject('paytech');

    try {
      // Sauvegarder d'abord dans Supabase / State local pour ne jamais perdre la commande
      await saveOrder(order);

      // Appeler le serveur Next.js pour initier PayTech de façon sécurisée
      const res = await fetch('/api/paytech/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });

      const data = await res.json();

      if (data.success && data.redirectUrl) {
        onClearCart();
        window.location.href = data.redirectUrl;
      } else {
        setFormError(data.error || 'Erreur lors de l’initialisation du paiement PayTech.');
        setIsProcessingPaytech(false);
      }
    } catch (err: any) {
      // Fallback gracieux si l'API route n'est pas joignable (ex: mode export statique pur)
      window.location.href = `/commande-confirmee?ref=${encodeURIComponent(order.ref_command)}&mode=sandbox&total=${grandTotal}`;
    }
  };

  // 2. COMMANDE SUR WHATSAPP (Paiement à la livraison)
  const handleWhatsAppCheckout = async () => {
    if (!validateForm()) return;

    const order = buildOrderObject('whatsapp');

    // Sauvegarder dans Supabase pour que la commande apparaisse immédiatement dans le tableau de bord Admin !
    await saveOrder(order);

    const orderLines = items.map(
      (item) => `• *${item.product.name}* (${item.product.brand}) x${item.quantity} — ${(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA`
    );

    const message = [
      '👑 *NOUVELLE COMMANDE — MG PERFUME DAKAR*',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `🔖 *Référence :* #${order.ref_command}`,
      `👤 *Client :* ${clientName.trim()}`,
      `📞 *Téléphone :* ${clientPhone.trim()}`,
      `📍 *Adresse / Quartier :* ${clientAddress.trim()}`,
      `🚚 *Zone :* ${currentZone.name} (+${currentZone.price.toLocaleString('fr-FR')} FCFA)`,
      `⏱️ *Délai estimé :* ${currentZone.delay}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '🛍️ *Articles commandés :*',
      ...orderLines,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `💰 *TOTAL À PAYER : ${grandTotal.toLocaleString('fr-FR')} FCFA*`,
      '💳 *Mode :* Paiement à la livraison (Espèces ou Wave)',
      '',
      'Bonjour MG Perfume, je souhaite valider cette commande svp ! 🙏',
    ].join('\n');

    const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;

    onClearCart();
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 !z-[999999] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E8DCC2] flex flex-col shadow-2xl text-[#171513] relative z-10 animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8DCC2] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C59B3F]" />
              <h2 className="font-luxury text-base sm:text-lg font-bold">Votre Panier</h2>
              <span className="text-xs text-[#9E968D] font-mono">({items.reduce((a, b) => a + b.quantity, 0)} articles)</span>
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-12">
                <ShoppingBag className="w-10 h-10 text-[#C59B3F]/40" />
                <p className="font-luxury text-base font-bold text-[#171513]">Votre panier est vide</p>
                <p className="text-xs text-[#6B655E] max-w-xs">
                  Ajoutez un parfum d’exception depuis notre catalogue pour débuter votre commande.
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
                      className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E8DCC2] bg-[#FAF8F5] space-y-3.5">
              
              {/* Delivery Zone Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#171513] flex items-center gap-1 uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-[#C59B3F]" />
                  Zone de Livraison (Dakar & Régions)
                </label>
                <select
                  value={selectedZoneId}
                  onChange={e => setSelectedZoneId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#E8DCC2] text-[#171513] focus:outline-none focus:border-[#C59B3F]"
                >
                  {zonesList.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} (+{zone.price.toLocaleString('fr-FR')} FCFA) — {zone.delay}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Info Inputs */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#9E968D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Nom & Prénom *"
                      value={clientName}
                      onChange={e => {
                        setClientName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl bg-white border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F]"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#9E968D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="Téléphone / WhatsApp *"
                      value={clientPhone}
                      onChange={e => {
                        setClientPhone(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl bg-white border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F]"
                    />
                  </div>
                </div>

                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#9E968D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Quartier, Rue ou Repère à Dakar *"
                    value={clientAddress}
                    onChange={e => {
                      setClientAddress(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl bg-white border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] focus:outline-none focus:border-[#C59B3F]"
                  />
                </div>
              </div>

              {/* Form Validation Alert */}
              {formError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

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

              {/* DUAL CHECKOUT BUTTONS */}
              <div className="space-y-2 pt-1">
                {/* 1. PayTech Button */}
                <button
                  onClick={handlePaytechCheckout}
                  disabled={isProcessingPaytech}
                  className="w-full py-3 px-4 rounded-2xl bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-0.5 shadow-md disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    {isProcessingPaytech ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#C59B3F]" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-[#C59B3F]" />
                    )}
                    <span>Payer en ligne (PayTech) • {grandTotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <span className="text-[9px] text-[#F3E5AB] font-normal normal-case opacity-90">
                    Wave • Orange Money • Free Money • Carte Bancaire
                  </span>
                </button>

                {/* 2. WhatsApp Button */}
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#25D366] text-[#171513] hover:text-white border border-[#E8DCC2] hover:border-[#25D366] font-bold text-xs uppercase tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-0.5 shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-[#25D366] group-hover:text-white" />
                    <span>Commander sur WhatsApp (À la livraison)</span>
                  </div>
                  <span className="text-[9px] text-[#6B655E] group-hover:text-white font-normal normal-case">
                    Paiement à la réception à Dakar (Espèces ou Wave)
                  </span>
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9E968D] text-center pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paiements sécurisés & garantie 100% parfums authentiques</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
