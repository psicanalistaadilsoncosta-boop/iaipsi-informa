'use client';
// app/admin/page.tsx — painel inicial do admin: todos os atalhos do site num lugar só.
// Para incluir um atalho novo, acrescente uma linha na lista GRUPOS.

import { useState } from 'react';
import AdminGate from '../AdminGate';

type Atalho = { href: string; nome: string; desc: string; externo?: boolean };
const GRUPOS: { titulo: string; cor: string; itens: Atalho[] }[] = [
  {
    titulo: '🛍 Produtos e ofertas', cor: '#5B3E96', itens: [
      { href: '/produtos/buscar', nome: 'Curadoria de produtos', desc: 'Buscar nas redes e pinar nas vitrines' },
      { href: '/admin/produtos', nome: 'Admin de produtos', desc: 'A catalogar, pinados, banner da home' },
      { href: '/admin/importar', nome: 'Importar categoria / feed', desc: 'Página de loja ou feed XML e atualização diária' },
      { href: '/produtos/categorizar', nome: 'Categorizar produtos', desc: 'Vitrine e categoria de cada produto' },
      { href: '/produtos/ambientes', nome: 'Painel de ambientes', desc: 'Monte seu ambiente' },
      { href: '/oferta-do-dia/editar', nome: 'Oferta do dia', desc: 'Escolher a oferta em destaque' },
    ],
  },
  {
    titulo: '🏪 Lojas e redes', cor: '#b45309', itens: [
      { href: '/produtos/cadastra-lojas', nome: 'Cadastro de lojas', desc: 'Editar loja, nível A/B/C, cartões de loja' },
      { href: '/produtos/brands', nome: 'Marcas Lomadee', desc: 'Marcas e orgId da Lomadee' },
    ],
  },
  {
    titulo: '✍️ Conteúdo', cor: '#0f766e', itens: [
      { href: '/compalavra/criar', nome: 'Novo Com a Palavra', desc: 'Escrever artigo (Reflexão ou Literatura)' },
      { href: '/compalavra/gerenciar', nome: 'Gerenciar Com a Palavra', desc: 'Editar, publicar, destaque' },
      { href: '/admin/audios', nome: 'Áudios dos artigos', desc: 'Voz IA ou sua gravação' },
      { href: '/editorial', nome: 'Painel editorial', desc: 'Análises das notícias' },
      { href: '/produto/criar', nome: 'Novo artigo de produto', desc: 'Resenha de produto' },
      { href: '/produto/gerenciar', nome: 'Gerenciar artigos de produto', desc: '' },
      { href: '/sabores', nome: 'Sabores & Destinos', desc: 'Criar e gerenciar pratos e receitas' },
    ],
  },
  {
    titulo: '🌍 Viagens', cor: '#0284c7', itens: [
      { href: '/viagens/buscar', nome: 'Curadoria de viagens', desc: 'Buscar passeios na Viator e pinar' },
      { href: '/viagem/criar', nome: 'Novo roteiro', desc: 'Artigo de viagem' },
      { href: '/viagem/gerenciar', nome: 'Gerenciar roteiros', desc: 'Editar e publicar' },
    ],
  },
  {
    titulo: '📊 Leitores e números', cor: '#047857', itens: [
      { href: '/admin/cliques', nome: 'Cliques nas lojas', desc: 'De onde saem os cliques' },
      { href: '/produtos/leads', nome: 'Leads da newsletter', desc: 'Quem se cadastrou' },
    ],
  },
  {
    titulo: '🔗 Painéis externos', cor: '#374151', itens: [
      { href: 'https://vercel.com/dashboard', nome: 'Vercel', desc: 'Deploys, variáveis, Blob, analytics', externo: true },
      { href: 'https://console.upstash.com', nome: 'Upstash', desc: 'Banco (KV): uso e custo', externo: true },
      { href: 'https://console.cloud.google.com/billing', nome: 'Google Cloud', desc: 'Voz (Text-to-Speech): uso e custo', externo: true },
      { href: 'https://ads.tiktok.com', nome: 'TikTok Ads', desc: 'Anúncios dos vídeos da Lupa', externo: true },
    ],
  },
];

function Painel() {
  const [busca, setBusca] = useState('');
  const q = busca.trim().toLowerCase();
  const filtra = (a: Atalho) => !q || (a.nome + ' ' + a.desc + ' ' + a.href).toLowerCase().includes(q);

  return (
    <main style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 16px 60px', fontFamily: 'system-ui', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ fontSize: 24, margin: 0, color: '#111827' }}>🔍 Com a Lupa · Admin</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '4px 0 0' }}>Todos os atalhos para cuidar do site.</p>
        </div>
        <input id="admin-busca" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Procurar atalho..."
          aria-label="Procurar atalho"
          style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, width: 240, maxWidth: '100%' }} />
        <a href="/" target="_blank" rel="noopener" style={{ fontSize: 14, fontWeight: 700, color: '#5B3E96', textDecoration: 'none' }}>Ver o site ↗</a>
      </div>

      <div style={{ display: 'grid', gap: 22 }}>
        {GRUPOS.map(g => {
          const itens = g.itens.filter(filtra);
          if (!itens.length) return null;
          return (
            <section key={g.titulo}>
              <h2 style={{ fontSize: 15, margin: '0 0 10px', color: g.cor }}>{g.titulo}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 }}>
                {itens.map(a => (
                  <a key={a.href} href={a.href} target={a.externo ? '_blank' : undefined} rel={a.externo ? 'noopener noreferrer' : undefined}
                    style={{ display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${g.cor}`, borderRadius: 10, padding: '12px 14px', textDecoration: 'none' }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{a.nome}{a.externo ? ' ↗' : ''}</div>
                    {a.desc && <div style={{ color: '#6b7280', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{a.desc}</div>}
                    <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 6 }}>{a.externo ? new URL(a.href).hostname : a.href}</div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return <AdminGate titulo="Admin · Com a Lupa"><Painel /></AdminGate>;
}
