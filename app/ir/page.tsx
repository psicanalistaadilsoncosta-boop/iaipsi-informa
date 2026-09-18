'use client';

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';


const MENSAGENS = [
  '🔄 Verificando condições atuais...',
  '🔄 Buscando preço atualizado...',
  '🔄 Consultando disponibilidade...',
  '🔄 Carregando oferta...',
];

function IrContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || '/';
  const nome = searchParams.get('nome') || 'oferta';
  const imagem = searchParams.get('imagem') || '';
  const [progresso, setProgresso] = useState(0);
  const mensagem = MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)];

  useEffect(() => {
    const inicio = Date.now();
    const duracao = 2000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - inicio;
      const pct = Math.min((elapsed / duracao) * 100, 100);
      setProgresso(pct);
      if (pct >= 100) {
        clearInterval(interval);
        window.location.href = url;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [url]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '40px 32px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>

        {/* Imagem do produto */}
        {imagem && (
          <div style={{ width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '8px' }}>
            <img src={imagem} alt={nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        )}

        {/* Nome do produto */}
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', margin: '0 0 24px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {(() => { try { return decodeURIComponent(nome); } catch { return nome; } })()}
        </p>

        {/* Mensagem */}
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 16px' }}>
          {mensagem}
        </p>

        {/* Barra de progresso */}
        <div style={{ backgroundColor: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '100%', backgroundColor: '#dc2626', borderRadius: '999px', width: `${progresso}%`, transition: 'width 0.05s linear' }} />
        </div>

        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
          Você será redirecionado em instantes...
        </p>
      </div>
    </main>
  );
}

export default function IrPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Carregando...</p>
      </main>
    }>
      <IrContent />
    </Suspense>
  );
}