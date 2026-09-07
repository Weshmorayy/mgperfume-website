'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <Container size="sm" className="text-center space-y-6">
        <span className="text-5xl font-extrabold text-amber-500">Erreur</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
          Une erreur inattendue est survenue
        </h1>
        <p className="text-surface-600 max-w-md mx-auto">
          Nous nous excusons pour ce désagrément. Veuillez réessayer ou retourner à l’accueil.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Button onClick={() => reset()} variant="primary" size="md">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Réessayer</span>
          </Button>
          <Button href="/" variant="outline" size="md">
            <Home className="w-4 h-4 mr-2" />
            <span>Accueil</span>
          </Button>
        </div>
      </Container>
    </div>
  );
}
