import React from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="bg-[#070605] border-t border-[#D4AF37]/20 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-[#A8A196]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Col 1: Brand */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/images/brand/logo.png"
                alt="MG Perfume"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-luxury text-xl font-bold tracking-widest text-[#FBF8F3] uppercase">
              MG Perfume
            </span>
          </div>
          <p className="text-xs text-[#A8A196] max-w-sm leading-relaxed">
            Parfumerie de prestige et sélection exclusive de fragrances orientales à Dakar. 
            Des créations originales sélectionnées pour leur puissance et leur élégance.
          </p>
        </div>

        {/* Col 2: Services & Engagements */}
        <div className="space-y-3">
          <h4 className="font-luxury text-sm font-bold text-[#FBF8F3] uppercase tracking-wider">
            Engagements
          </h4>
          <ul className="space-y-2 text-xs">
            <li>• Parfums 100% originaux certifiés</li>
            <li>• Livraison rapide à Dakar & banlieue</li>
            <li>• Expédition dans les régions du Sénégal</li>
            <li>• Paiement à la réception de votre commande</li>
          </ul>
        </div>

        {/* Col 3: Contact Direct */}
        <div className="space-y-3">
          <h4 className="font-luxury text-sm font-bold text-[#FBF8F3] uppercase tracking-wider">
            Contact & Horaires
          </h4>
          <div className="space-y-2 text-xs">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-[#D4AF37]">
                {siteConfig.contact.phoneFormatted}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{siteConfig.contact.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{siteConfig.city}, {siteConfig.country}</span>
            </p>
            <p className="text-[11px] text-[#A8A196]/80 pt-1">
              {siteConfig.contact.hours}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#D4AF37]/10 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-4">
        <div>
          © {new Date().getFullYear()} {siteConfig.brandName}. Tous droits réservés.
        </div>
        <div className="text-[#A8A196]/70">
          Haute Parfumerie & Fragrances Orientales
        </div>
      </div>
    </footer>
  );
}
