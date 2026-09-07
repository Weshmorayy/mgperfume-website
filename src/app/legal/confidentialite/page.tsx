import React from 'react';
import { siteConfig } from '@/config/site';

export default function Confidentialite() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-[#A8A196] space-y-6">
      <h1 className="font-luxury text-3xl font-bold text-[#FBF8F3]">Politique de Confidentialité</h1>
      <p>Les informations collectées lors de la commande ({siteConfig.brandName}) sont uniquement utilisées pour l’expédition et la livraison de vos parfums.</p>
    </div>
  );
}
