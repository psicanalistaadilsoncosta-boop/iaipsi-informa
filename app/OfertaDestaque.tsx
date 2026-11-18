'use client';

import { useState, useEffect } from 'react';
import VitrineOfertaDia, { montarVitrine, ProdutoPinado } from './VitrineOfertaDia';

// Home: vitrine das Ofertas do Dia (card grande + 3 menores)
export default function OfertaDestaque() {
  const [ofertas, setOfertas] = useState<ProdutoPinado[]>([]);
  const [destaqueId, setDestaqueId] = useState<string | undefined>();
  const [frase, setFrase] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/produtos/save?tipo=destaque-home').then(r => r.json()).catch(() => ({})),
      fetch('/api/produtos/save').then(r => r.json()).catch(() => []),
    ]).then(([destaque, pinados]) => {
      const id = destaque?.id as string | undefined;
      setDestaqueId(id);
      setFrase(destaque?.frase || '');
      setOfertas(montarVitrine(Array.isArray(pinados) ? pinados : [], id));
    });
  }, []);

  if (ofertas.length === 0) return null;
  return <VitrineOfertaDia ofertas={ofertas} destaqueId={destaqueId} frase={frase} comCabecalho />;
}
