import React from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="bg-[#171513] border-t border-[#E8DCC2]/20 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-[#A8A196]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Col 1 */}
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
            <div className="flex flex-col">
              <span className="font-luxury text-lg font-bold tracking-widest text-[#FBF8F3] uppercase leading-none">
                MG Perfume
              </span>
              <span className="text-[9px] tracking-[0.2em] text-[#C59B3F] uppercase font-semibold mt-1">
                Haute Parfumerie Dakar
              </span>
            </div>
          </div>
          <p className="text-xs text-[#A8A196] max-w-sm leading-relaxed">
            Haute parfumerie, créations orientales et fragrances de caractère à Dakar. 
            Flacons authentiques sélectionnés pour leur tenue exceptionnelle.
          </p>
          {siteConfig.social.facebook && (
            <div className="pt-1">
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#F3E5AB] hover:text-[#C59B3F] transition-colors"
              >
                <span>Rejoignez-nous sur Facebook</span>
                <span>→</span>
              </a>
            </div>
          )}
        </div>

        {/* Col 2 */}
        <div className="space-y-3">
          <h4 className="font-luxury text-xs font-bold text-[#FBF8F3] uppercase tracking-wider">
            Nos Engagements
          </h4>
          <ul className="space-y-2 text-xs">
            <li>• Parfums 100% originaux</li>
            <li>• Livraison rapide à Dakar & banlieue</li>
            <li>• Expédition dans toutes les régions</li>
            <li>• Paiement à la réception</li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-3">
          <h4 className="font-luxury text-xs font-bold text-[#FBF8F3] uppercase tracking-wider">
            Contact
          </h4>
          <div className="space-y-2 text-xs">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#C59B3F]" />
              <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-white">
                {siteConfig.contact.phoneFormatted}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#C59B3F]" />
              <span>{siteConfig.contact.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#C59B3F]" />
              <span>{siteConfig.city}, {siteConfig.country}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-4">
        <div>
          © {new Date().getFullYear()} {siteConfig.brandName}. Tous droits réservés.
        </div>
        <div className="text-[#A8A196]/70">
          Dakar, Sénégal
        </div>
      </div>
    </footer>
  );
}
