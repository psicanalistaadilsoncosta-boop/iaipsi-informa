// app/ofertas-todas/page.tsx — todos os atalhos de ofertas num lugar só (o cabeçalho da home leva para cá)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Todas as ofertas | Com a Lupa',
  description: 'Ofertas e cupons, seleção da Lupa, parcelado sem juros, oferta do dia, viagens e roteiros: tudo num lugar só.',
  alternates: { canonical: '/ofertas-todas' },
};

const ATALHOS = [
  { href: '/lupa-me-ajuda', emoji: '🔍', titulo: 'Lupa, me ajuda?', texto: 'Responda 4 perguntas e receba sugestões com o porquê.', cor: '#5B3E96' },
  { href: '/ofertas', emoji: '🛍', titulo: 'Ofertas & Cupons', texto: 'Descontos e cupons ativos das lojas parceiras.', cor: '#dc2626' },
  { href: '/ofertas-selecionadas', emoji: '⭐', titulo: 'Selecionadas', texto: 'O que a Lupa escolheu a dedo.', cor: '#2563eb' },
  { href: '/oferta-do-dia', emoji: '🔥', titulo: 'Oferta do Dia', texto: 'Uma oferta especial, renovada todo dia.', cor: '#b45309' },
  { href: '/parcelado', emoji: '💳', titulo: 'Parcelado sem juros', texto: 'Para dividir sem pagar a mais.', cor: '#047857' },
  { href: '/viagens-selecionadas', emoji: '🌍', titulo: 'Viagens', texto: 'Passeios e experiências selecionadas.', cor: '#0f766e' },
  { href: '/viagens', emoji: '🗺️', titulo: 'Roteiros', texto: 'Ideias de destino e o que fazer lá.', cor: '#0e7490' },
];

export default function OfertasTodas() {
  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 16px 60px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <style>{`
        .ot-grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
        .ot-card { display: flex; flex-direction: column; gap: 6px; padding: 22px; border-radius: 16px; color: #fff; text-decoration: none;
          box-shadow: 0 6px 20px rgba(0,0,0,.10); transition: transform .2s, box-shadow .2s; min-height: 140px; box-sizing: border-box; }
        .ot-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.16); }
        .ot-emoji { font-size: 2rem; line-height: 1; }
        .ot-tit { font-weight: 800; font-size: 1.15rem; }
        .ot-txt { font-size: .85rem; opacity: .92; line-height: 1.4; }
        .ot-ir { margin-top: auto; font-weight: 800; font-size: .8rem; }
        @media (max-width: 560px) { .ot-grade { grid-template-columns: 1fr 1fr; gap: 10px; } .ot-card { padding: 16px; min-height: 130px; } .ot-txt { display: none; } }
      `}</style>
      <a href="/" style={{ color: '#5B3E96', fontWeight: 700, textDecoration: 'none', fontSize: '.9rem' }}>← Com a Lupa</a>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '10px 0 4px' }}>🛍 Todas as ofertas</h1>
      <p style={{ color: '#6b7280', margin: '0 0 20px' }}>Escolha por onde começar.</p>
      <div className="ot-grade">
        {ATALHOS.map(a => (
          <a key={a.href} href={a.href} className="ot-card" style={{ background: `linear-gradient(135deg, ${a.cor}, ${a.cor}cc)` }}>
            <span className="ot-emoji" aria-hidden="true">{a.emoji}</span>
            <span className="ot-tit">{a.titulo}</span>
            <span className="ot-txt">{a.texto}</span>
            <span className="ot-ir">Ver →</span>
          </a>
        ))}
      </div>
    </main>
  );
}
