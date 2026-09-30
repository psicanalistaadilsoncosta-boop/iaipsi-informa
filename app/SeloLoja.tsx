'use client';

import { useEffect, useState } from 'react';

type Reputacao = { reputacao: string; campea2025?: boolean; url?: string; consultadoEm?: string };

// Busca a lista uma vez só por visita, mesmo com vários selos na página
let cache: Promise<Record<string, Reputacao>> | null = null;
function carregar() {
  if (!cache) cache = fetch('/api/lojas-reputacao').then(r => r.json()).catch(() => ({}));
  return cache;
}

const NOMES: Record<string, string> = { GOOD: 'Boa', GREAT: 'Ótima', RA1000: 'RA1000' };

export default function SeloLoja({ loja, compacto = false }: { loja?: string; compacto?: boolean }) {
const [info, setInfo] = useState<Reputacao | null>(null);

  useEffect(() => {
    if (!loja) return;
    carregar().then(m => setInfo(m[loja] || null));
  }, [loja]);

  if (!info) return null;

  const nomeRep = NOMES[info.reputacao] || info.reputacao;
  const texto = compacto
    ? (info.campea2025 ? '🏆 Campeã RA 2025' : `🔍 RA ${nomeRep}`)
    : (info.campea2025 ? '🏆 Campeã do Prêmio Reclame AQUI 2025' : `🔍 Reputação ${nomeRep} no Reclame AQUI`);

  return (
    <a
      href={info.url || 'https://www.reclameaqui.com.br'}
      target="_blank"
      rel="noopener noreferrer"
      title={info.consultadoEm ? `Consultado pelo Com a Lupa em ${info.consultadoEm.split('-').reverse().join('/')}` : undefined}
      style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 600, color: '#047857', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '999px', padding: '2px 10px', textDecoration: 'none', whiteSpace: 'nowrap' }}
    >
      {texto}
    </a>
  );
}