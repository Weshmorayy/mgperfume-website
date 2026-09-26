'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useStore } from '@/context/StoreContext';

export function Footer() {
  const { contact, social } = useStore();

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

          {/* Social Media Icons */}
          <div className="pt-2 flex items-center gap-3">
            {social?.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 hover:bg-[#C59B3F] text-[#F3E5AB] hover:text-[#171513] transition-all border border-white/10"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {social?.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 hover:bg-[#C59B3F] text-[#F3E5AB] hover:text-[#171513] transition-all border border-white/10"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {social?.tiktok && (
              <a
                href={social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 hover:bg-[#C59B3F] text-[#F3E5AB] hover:text-[#171513] transition-all border border-white/10 font-bold text-xs flex items-center justify-center w-9 h-9"
                aria-label="TikTok"
              >
                ♪
              </a>
            )}
          </div>
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
              <a href={`tel:${contact?.phone || siteConfig.contact.phone}`} className="hover:text-white">
                {contact?.phoneFormatted || siteConfig.contact.phoneFormatted}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#C59B3F]" />
              <span>{contact?.email || siteConfig.contact.email}</span>
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
