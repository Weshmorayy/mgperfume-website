import React from 'react';
import { siteConfig } from '@/config/site';

export default function MentionsLegales() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-[#A8A196] space-y-6">
      <h1 className="font-luxury text-3xl font-bold text-[#FBF8F3]">Mentions Légales</h1>
      <p>Éditeur du site : {siteConfig.brandName}</p>
      <p>Adresse : {siteConfig.contact.address}</p>
      <p>Contact : {siteConfig.contact.phoneFormatted} — {siteConfig.contact.email}</p>
    </div>
  );
}
