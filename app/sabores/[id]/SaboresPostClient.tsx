'use client';

import { useState, useEffect, useRef } from 'react';


interface SaboresItem {
  id: string;
  prato: string;
  destino: string;
  intro: string;
  cta: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
  recipe?: any;
}

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    const parsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (!parsed.trim()) return <br key={i} />;
    return <p key={i} style={{ margin: '0 0 16px', lineHeight: 1.85, fontSize: '1.05rem', color: '#374151' }} dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

export default function SaboresPostClient({ item }: { item: SaboresItem | null }) {
  const [showRecipe, setShowRecipe] = useState(false);

  if (!item) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af' }}>Post não encontrado.</p>
    </main>
  );

  const recipe = item.recipe || null;

  const tpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tpRef.current) return;
    const script = document.createElement('script');
    script.async = true;
    script.charset = 'utf-8';
    script.src = 'https://tpwgts.com/content?currency=brl&trs=574556&shmarker=778270.778270&locale=pt&powered_by=true&limit=4&primary_color=00AE98&results_background_color=FFFFFF&form_background_color=FFFFFF&promo_id=4563&campaign_id=111';
    tpRef.current.appendChild(script);
  }, []);



  return (
    <main style={{ maxWidth: '780px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </a>

      {item.imageUrl && (
        <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '32px', height: '420px' }}>
          <img src={item.imageUrl} alt={item.prato} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
          🍽 Sabores & Destinos · {item.destino}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 12px', lineHeight: 1.2 }}>
          {item.prato}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.6 }}>
          {item.intro}
        </p>
        <small style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
          por Adilson Costa · {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </small>
      </div>

      <article style={{ marginBottom: '40px' }}>
        {renderContent(item.content)}
      </article>

      {/* Banner Travelpayouts */}
      <div style={{ margin: '32px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
        <div style={{ padding: '8px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ✈️ Publicidade — Viagens
          </span>
        </div>
                      <div ref={tpRef} id="tp-sabores" style={{ minHeight: '100px' }}>
          <script
            async
            src="https://tpwgts.com/content?currency=brl&trs=574556&shmarker=778270.778270&locale=pt&powered_by=true&limit=4&primary_color=00AE98&results_background_color=FFFFFF&form_background_color=FFFFFF&promo_id=4563&campaign_id=111"
            charSet="utf-8"
          />
        </div>
      </div>


      {recipe && (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '32px' }}>
          <button onClick={() => setShowRecipe(!showRecipe)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#b45309', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: '24px' }}>
            {showRecipe ? '▲ Fechar receita' : '👨‍🍳 Ver receita completa'}
          </button>

          {showRecipe && !recipe.error && (
            <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem' }}>⏱</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginTop: '4px' }}>{recipe.tempo}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Tempo</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem' }}>🍽</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginTop: '4px' }}>{recipe.porcoes}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Porções</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem' }}>{recipe.dificuldade === 'Simples' ? '🟢' : recipe.dificuldade === 'Médio' ? '🟡' : '🔴'}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginTop: '4px' }}>{recipe.dificuldade}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Dificuldade</div>
                </div>
                <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{recipe.fonte}</span>
                </div>
              </div>

              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>Ingredientes</h2>
              <ul style={{ margin: '0 0 28px', paddingLeft: '20px' }}>
                {recipe.ingredientes?.map((ing: string, i: number) => (
                  <li key={i} style={{ fontSize: '0.95rem', color: '#374151', marginBottom: '6px', lineHeight: 1.5 }}>{ing}</li>
                ))}
              </ul>

              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>Modo de preparo</h2>
              <ol style={{ margin: '0 0 28px', paddingLeft: '20px' }}>
                {recipe.passos?.map((passo: string, i: number) => (
                  <li key={i} style={{ fontSize: '0.95rem', color: '#374151', marginBottom: '12px', lineHeight: 1.7 }}>{passo}</li>
                ))}
              </ol>

              {recipe.dica && (
                <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '10px', padding: '16px 20px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>💡 Dica do chef: </span>
                  <span style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: 1.6 }}>{recipe.dica}</span>
                </div>
              )}

              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', lineHeight: 1.6 }}>
                {recipe.fonte?.includes('TheMealDB')
                  ? '📖 Receita baseada em dados do TheMealDB, traduzida e adaptada para o português brasileiro por Adilson Costa.'
                  : '📖 Receita tradicional adaptada para o português brasileiro por Adilson Costa.'}
              </p>
            </div>
          )}
        </div>
      )}

    </main>
  );
}
