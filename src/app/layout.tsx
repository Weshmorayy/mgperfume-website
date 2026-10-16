import type { Metadata, Viewport } from 'next';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { generatePageMetadata } from '@/lib/seo';
import { StoreProvider } from '@/context/StoreContext';
import {
  BEFORE_SEND_HANDLER,
  BEFORE_SEND_SOURCE,
  UMAMI_SCRIPT_SRC,
  UMAMI_WEBSITE_ID,
  isAnalyticsEnabled,
} from '@/config/analytics';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0A0908',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = generatePageMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <head>
        <meta name="facebook-domain-verification" content="27pr9xnm0f1tj7b409rxfa4726ixf1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <SchemaOrg />
        {/*
          * Mesure d'audience — Umami, auto-hébergé.
          *
          * Les deux balises sont écrites ici, dans la partie serveur du
          * document, et non chargées par un composant client :
          *
          *   • la première définit le filtre que le script appellera avant
          *     chaque envoi. Elle doit être exécutée AVANT le script, sinon
          *     Umami ne trouverait pas la fonction et enverrait tout — y
          *     compris les visites d'administration ;
          *   • la seconde charge le script lui-même.
          *
          * Aucune des deux n'est émise tant que les variables publiques
          * d'Umami sont absentes : sans elles, le site n'appelle rien à
          * l'extérieur, et le panneau de statistiques reste sur son compteur
          * de repli.
          */}
        {isAnalyticsEnabled && (
          <>
            <script dangerouslySetInnerHTML={{ __html: BEFORE_SEND_SOURCE }} />
            <script
              defer
              src={UMAMI_SCRIPT_SRC}
              data-website-id={UMAMI_WEBSITE_ID}
              data-before-send={BEFORE_SEND_HANDLER}
            />
          </>
        )}
      </head>
      <body className="min-h-screen bg-[#0A0908] text-[#FBF8F3] antialiased">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
