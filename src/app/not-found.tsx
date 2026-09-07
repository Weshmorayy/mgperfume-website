import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <Container size="sm" className="text-center space-y-6">
        <span className="text-6xl sm:text-8xl font-black text-brand-600">404</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900">
          Page introuvable
        </h1>
        <p className="text-surface-600 max-w-md mx-auto">
          La page que vous recherchez semble avoir été déplacée ou n’existe pas.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Button href="/" variant="primary" size="md">
            <Home className="w-4 h-4 mr-2" />
            <span>Retour à l’accueil</span>
          </Button>
        </div>
      </Container>
    </div>
  );
}
