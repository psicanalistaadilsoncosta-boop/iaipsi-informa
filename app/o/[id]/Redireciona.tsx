'use client';

import { useEffect } from 'react';

// Leva a pessoa para a página /ir (que abre a loja com o link de afiliado).
// Robôs de prévia (WhatsApp, Facebook) não executam isto e leem só a foto e o nome.
export default function Redireciona({ destino }: { destino: string }) {
  useEffect(() => {
    window.location.replace(destino);
  }, [destino]);
  return null;
}
