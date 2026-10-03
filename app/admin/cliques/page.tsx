'use client';
// app/admin/cliques/page.tsx — de onde saem os cliques para as lojas

import { useEffect, useState } from 'react';
import AdminGate from '../../AdminGate';

type Linha = { nome: string; cliques: number };
type Dados = { dias: number; total: number; porDia: { dia: string; cliques: number }[]; origem: Linha[]; loja: Linha[]; rede: Linha[]; produto: Linha[] };

const NOMES_PAGINA: Record<string, string> = {
  '/': 'Página inicial', '/monte-seu-ambiente': 'Monte seu ambiente', '/monte-seu-momento': 'Monte seu momento',
  '/vista-se': 'Vista-se', '/vista-seu-filho': 'Vista seu filho', '/beleza': 'Beleza', '/mercado': 'Mercado',
  '/pra-voce': 'Lupa pra você', '/dia-das-criancas': 'Dia das Crianças', '/natal': 'Natal',
  '/ofertas': 'Ofertas & Cupons', '/ofertas-selecionadas': 'Selecionadas', '/parcelado': 'Parcelado',
  '/oferta-do-dia': 'Oferta do dia', '/viagens-selecionadas': 'Viagens', '/viagens': 'Roteiros de viagem',
};
const nomePagina = (p: string) => NOMES_PAGINA[p] || p;

function Tabela({ titulo, linhas, total, rotulo = (s: string) => s }: { titulo: string; linhas: Linha[]; total: number; rotulo?: (s: string) => string }) {
  const max = Math.max(1, ...linhas.map(l => l.cliques));
  return (
    <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, minWidth: 0 }}>
      <h2 style={{ fontSize: 15, margin: '0 0 12px', color: '#111827' }}>{titulo}</h2>
      {linhas.length === 0 ? <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Nenhum clique no período.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {linhas.map(l => (
              <tr key={l.nome}>
                <td style={{ padding: '5px 8px 5px 0', color: '#374151', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.nome}>{rotulo(l.nome)}</td>
                <td style={{ width: '45%', padding: '5px 0' }}>
                  <div style={{ height: 8, borderRadius: 4, background: '#5B3E96', width: `${(l.cliques / max) * 100}%`, minWidth: 3 }} />
                </td>
                <td style={{ padding: '5px 0 5px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {l.cliques} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({Math.round((l.cliques / Math.max(total, 1)) * 100)}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Painel() {
  const [dias, setDias] = useState<7 | 30>(7);
  const [d, setD] = useState<Dados | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setD(null); setErro('');
    fetch(`/api/admin/cliques?dias=${dias}`).then(r => r.json())
      .then(j => (j.error ? setErro(j.error) : setD(j)))
      .catch(() => setErro('Não foi possível carregar.'));
  }, [dias]);

  const maxDia = Math.max(1, ...(d?.porDia.map(x => x.cliques) || [1]));

  return (
    <main style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 16px', fontFamily: 'system-ui', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, margin: 0, color: '#111827' }}>Cliques para as lojas</h1>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {([7, 30] as const).map(n => (
            <button key={n} onClick={() => setDias(n)}
              style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid #5B3E96', cursor: 'pointer', fontWeight: 700,
                background: dias === n ? '#5B3E96' : '#fff', color: dias === n ? '#fff' : '#5B3E96' }}>
              {n} dias
            </button>
          ))}
        </div>
      </div>

      {erro && <p style={{ color: '#dc2626' }}>{erro}</p>}
      {!d && !erro && <p style={{ color: '#6b7280' }}>Carregando...</p>}

      {d && (
        <>
          <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#5B3E96' }}>{d.total}</span>
              <span style={{ color: '#6b7280' }}>cliques nos últimos {d.dias} dias (sem contar os seus)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60, marginTop: 12 }}>
              {d.porDia.map(x => (
                <div key={x.dia} title={`${x.dia.split('-').reverse().join('/')}: ${x.cliques}`}
                  style={{ flex: 1, background: x.cliques ? '#a78bfa' : '#ede9fe', borderRadius: 3, height: `${Math.max(4, (x.cliques / maxDia) * 100)}%` }} />
              ))}
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            <Tabela titulo="De qual página" linhas={d.origem} total={d.total} rotulo={nomePagina} />
            <Tabela titulo="Para qual loja" linhas={d.loja} total={d.total} />
            <Tabela titulo="Por rede de afiliados" linhas={d.rede} total={d.total} />
            <Tabela titulo="Produtos mais clicados" linhas={d.produto} total={d.total} />
          </div>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 14 }}>
            Cliques no botão das ofertas (passam pela /ir). Os links dentro dos e-mails de lista não entram na conta. Os números apagam sozinhos após 120 dias.
          </p>
        </>
      )}
    </main>
  );
}

export default function CliquesPage() {
  return <AdminGate titulo="Cliques"><Painel /></AdminGate>;
}
