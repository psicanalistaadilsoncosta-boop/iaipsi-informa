#!/bin/bash
# =============================================================
# ComAPalavra — cria todas as pastas e arquivos
# Cole inteiro no terminal na raiz do projeto
# =============================================================

mkdir -p app/compalavra/\[slug\]
mkdir -p app/compalavra/criar
mkdir -p app/compalavra/gerenciar
mkdir -p app/api/compalavra/save
mkdir -p app/api/compalavra/revisar
echo "✅ Pastas criadas"

# ─── API: CRUD save ───────────────────────────────────────────
cat > app/api/compalavra/save/route.ts << 'ENDSAVE'
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export interface ArtigoComPalavra {
  id: string;
  slug: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  imagem?: string;
  publicado: boolean;
  destaque: boolean;
  createdAt: string;
  updatedAt: string;
}

function gerarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export async function GET() {
  try {
    const data = await kv.get<ArtigoComPalavra[]>('artigos:compalavra');
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const artigos = await kv.get<ArtigoComPalavra[]>('artigos:compalavra') || [];
    const agora = new Date().toISOString();

    if (body.id) {
      const idx = artigos.findIndex(a => a.id === body.id);
      if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
      let lista = artigos;
      if (body.destaque) lista = artigos.map(a => ({ ...a, destaque: false }));
      lista[idx] = { ...lista[idx], ...body, updatedAt: agora };
      await kv.set('artigos:compalavra', lista);
      return NextResponse.json(lista[idx]);
    } else {
      const slug = gerarSlug(body.titulo || 'artigo');
      const slugFinal = artigos.some(a => a.slug === slug) ? `${slug}-${Date.now()}` : slug;
      let lista = artigos;
      if (body.destaque) lista = artigos.map(a => ({ ...a, destaque: false }));
      const novo: ArtigoComPalavra = {
        id: crypto.randomUUID(),
        slug: slugFinal,
        titulo: body.titulo || '',
        conteudo: body.conteudo || '',
        resumo: body.resumo || '',
        imagem: body.imagem || '',
        publicado: body.publicado ?? false,
        destaque: body.destaque ?? false,
        createdAt: agora,
        updatedAt: agora,
      };
      await kv.set('artigos:compalavra', [...lista, novo]);
      return NextResponse.json(novo);
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const artigos = await kv.get<ArtigoComPalavra[]>('artigos:compalavra') || [];
    await kv.set('artigos:compalavra', artigos.filter(a => a.id !== id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
ENDSAVE
echo "✅ app/api/compalavra/save/route.ts"

# ─── API: Revisor IA ──────────────────────────────────────────
cat > app/api/compalavra/revisar/route.ts << 'ENDREVISAR'
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.comApalavra_OPENAI });

export async function POST(req: NextRequest) {
  try {
    const { conteudo } = await req.json();
    if (!conteudo) return NextResponse.json({ error: 'Conteúdo ausente' }, { status: 400 });

    const prompt = `Você é revisor de uma coluna de psicologia e psicanálise escrita por Adilson Costa.

REGRAS ABSOLUTAS:
1. NUNCA use travessão (— ou –). Se precisar de pausa, use vírgula ou ponto.
2. Corrija gramática, concordância e pontuação sem mudar o sentido ou a voz do autor.
3. NÃO reescreva o texto — apenas revise o que existe.
4. O autor não usa IA para escrever. Preserve seu estilo pessoal.

ILUSTRAÇÕES (verificar):
- O texto deve ter entre 2 e 3 ilustrações (bíblicas, mitológicas, metáforas, provérbios, fábulas, contos).
- Se tiver menos de 2, acrescente uma ao texto de forma integrada.
- Se tiver mais de 3, remova a menos relevante.

REFERÊNCIAS PSICANALÍTICAS (verificar):
- O texto deve citar pelo menos 2 autores entre: Freud, Lacan, Winnicott, Melanie Klein.
- Se não houver, adicione 2 referências breves e contextualizadas no corpo do texto.
- Nunca coloque mais de 3 referências psicanalíticas.

ENCERRAMENTO OBRIGATÓRIO:
- O texto DEVE terminar com a frase: "Você está com a palavra."
- Se não terminar assim, acrescente essa frase ao final.

Retorne APENAS o texto revisado, sem comentários, sem explicações, sem marcadores.

TEXTO PARA REVISAR:
${conteudo}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const revisado = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ revisado });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
ENDREVISAR
echo "✅ app/api/compalavra/revisar/route.ts"

# ─── Página pública: listagem ─────────────────────────────────
cat > app/compalavra/page.tsx << 'ENDLIST'
import { kv } from '@/lib/kv';
import Link from 'next/link';

interface ArtigoComPalavra {
  id: string; slug: string; titulo: string; conteudo: string;
  resumo: string; imagem?: string; publicado: boolean; destaque: boolean;
  createdAt: string; updatedAt: string;
}

async function getArtigos(): Promise<ArtigoComPalavra[]> {
  try {
    const data = await kv.get<ArtigoComPalavra[]>('artigos:compalavra');
    return (data || []).filter(a => a.publicado).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch { return []; }
}

export default async function ComAPalavraPage() {
  const artigos = await getArtigos();
  const destaque = artigos.find(a => a.destaque);
  const demais = artigos.filter(a => !a.destaque);

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '3px solid #0f766e', paddingBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', color: '#0f766e', textTransform: 'uppercase', marginBottom: '8px' }}>Coluna</div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#111827', margin: '0 0 4px', letterSpacing: '-1px' }}>
          Com<span style={{ color: '#0f766e', fontSize: '3.2rem' }}>A</span>Palavra
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', margin: '8px 0 0' }}>
          por <strong style={{ color: '#111827' }}>Adilson Costa</strong> · Psicanálise e vida
        </p>
      </div>

      {destaque && (
        <Link href={`/compalavra/${destaque.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '40px' }}>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #0f766e', boxShadow: '0 4px 20px rgba(15,118,110,0.15)' }}>
            {destaque.imagem && (
              <div style={{ height: '300px', overflow: 'hidden' }}>
                <img src={destaque.imagem} alt={destaque.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: '28px', backgroundColor: '#f0fdfa' }}>
              <span style={{ display: 'inline-block', backgroundColor: '#0f766e', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', marginBottom: '12px', letterSpacing: '1px' }}>✍️ EM DESTAQUE</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 12px', lineHeight: 1.25 }}>{destaque.titulo}</h2>
              {destaque.resumo && <p style={{ color: '#374151', fontSize: '1rem', margin: '0 0 16px', lineHeight: 1.6 }}>{destaque.resumo}</p>}
              <span style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.9rem' }}>Ler artigo →</span>
            </div>
          </div>
        </Link>
      )}

      {demais.length === 0 && !destaque && (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0' }}>Nenhum artigo publicado ainda.</p>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {demais.map(artigo => (
          <Link key={artigo.id} href={`/compalavra/${artigo.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', gap: '20px', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#fff', alignItems: 'flex-start' }}>
              {artigo.imagem && <img src={artigo.imagem} alt={artigo.titulo} style={{ width: '110px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>{artigo.titulo}</h2>
                {artigo.resumo && <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 10px', lineHeight: 1.5 }}>{artigo.resumo}</p>}
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(artigo.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
ENDLIST
echo "✅ app/compalavra/page.tsx"

# ─── Página do artigo ─────────────────────────────────────────
cat > "app/compalavra/[slug]/page.tsx" << 'ENDSLUG'
import { kv } from '@/lib/kv';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ArtigoComPalavra {
  id: string; slug: string; titulo: string; conteudo: string;
  resumo: string; imagem?: string; publicado: boolean; destaque: boolean;
  createdAt: string; updatedAt: string;
}

async function getArtigo(slug: string): Promise<ArtigoComPalavra | null> {
  try {
    const data = await kv.get<ArtigoComPalavra[]>('artigos:compalavra');
    return (data || []).find(a => a.slug === slug && a.publicado) || null;
  } catch { return null; }
}

function renderConteudo(texto: string) {
  return texto.split('\n').map((linha, i) => {
    if (!linha.trim() || linha.trim() === '---') return <br key={i} />;
    if (linha.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: '28px 0 12px' }}>{linha.replace('## ', '')}</h2>;
    if (linha.startsWith('# ')) return <h1 key={i} style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', margin: '32px 0 14px' }}>{linha.replace('# ', '')}</h1>;
    return <p key={i} style={{ margin: '0 0 16px', lineHeight: 1.8, color: '#1f2937', fontSize: '1.05rem' }}>{linha}</p>;
  });
}

export default async function ArtigoComPalavraPage({ params }: { params: { slug: string } }) {
  const artigo = await getArtigo(params.slug);
  if (!artigo) notFound();

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      <nav style={{ marginBottom: '24px', fontSize: '0.8rem', color: '#6b7280' }}>
        <Link href="/" style={{ color: '#0f766e', textDecoration: 'none' }}>Início</Link>
        {' / '}
        <Link href="/compalavra" style={{ color: '#0f766e', textDecoration: 'none' }}>ComAPalavra</Link>
        {' / '}
        <span>{artigo.titulo}</span>
      </nav>

      <div style={{ borderBottom: '2px solid #0f766e', marginBottom: '32px', paddingBottom: '20px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#0f766e', textTransform: 'uppercase', marginBottom: '10px' }}>✍️ ComAPalavra · Adilson Costa</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: '0 0 14px', lineHeight: 1.2 }}>{artigo.titulo}</h1>
        {artigo.resumo && <p style={{ color: '#374151', fontSize: '1.1rem', margin: '0 0 16px', lineHeight: 1.6, fontStyle: 'italic' }}>{artigo.resumo}</p>}
        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          Publicado em {new Date(artigo.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {artigo.imagem && (
        <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={artigo.imagem} alt={artigo.titulo} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      )}

      <article>{renderConteudo(artigo.conteudo)}</article>

      <div style={{ marginTop: '48px', padding: '24px', backgroundColor: '#f0fdfa', borderRadius: '12px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
        <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1rem', marginBottom: '4px' }}>Adilson Costa</div>
        <div style={{ color: '#047857', fontSize: '0.875rem' }}>Psicanalista · Coluna ComAPalavra</div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link href="/compalavra" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>← Ver todos os artigos</Link>
      </div>
    </main>
  );
}
ENDSLUG
echo "✅ app/compalavra/[slug]/page.tsx"

# ─── Criar artigo ─────────────────────────────────────────────
cat > app/compalavra/criar/page.tsx << 'ENDCRIAR'
'use client';
import { useState } from 'react';

export default function CriarComPalavraPage() {
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [publicado, setPublicado] = useState(false);
  const [destaque, setDestaque] = useState(false);
  const [revisando, setRevisando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [revisao, setRevisao] = useState('');
  const [msg, setMsg] = useState('');

  async function revisar() {
    if (!conteudo.trim()) { setMsg('Escreva o conteúdo antes de revisar.'); return; }
    setRevisando(true); setMsg('');
    const res = await fetch('/api/compalavra/revisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conteudo }) });
    const data = await res.json();
    if (data.revisado) { setRevisao(data.revisado); setMsg('✅ Revisão pronta!'); }
    else setMsg('Erro: ' + (data.error || ''));
    setRevisando(false);
  }

  async function salvar() {
    if (!titulo.trim() || !conteudo.trim()) { setMsg('Título e conteúdo são obrigatórios.'); return; }
    setSalvando(true); setMsg('');
    const res = await fetch('/api/compalavra/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo, resumo, conteudo, imagem, publicado, destaque }) });
    const data = await res.json();
    if (data.id) { setMsg('✅ Artigo salvo!'); setTitulo(''); setResumo(''); setConteudo(''); setImagem(''); setPublicado(false); setDestaque(false); setRevisao(''); }
    else setMsg('Erro: ' + (data.error || ''));
    setSalvando(false);
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' };

  return (
    <main style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', marginBottom: '24px' }}>✍️ Novo artigo — ComAPalavra</h1>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Título</label>
          <input style={inp} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título do artigo" /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Resumo</label>
          <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={resumo} onChange={e => setResumo(e.target.value)} /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>URL da imagem</label>
          <input style={inp} value={imagem} onChange={e => setImagem(e.target.value)} placeholder="https://..." />
          {imagem && <img src={imagem} alt="" style={{ marginTop: '8px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />}</div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Conteúdo</label>
          <textarea style={{ ...inp, minHeight: '340px', resize: 'vertical', lineHeight: 1.7 }} value={conteudo} onChange={e => setConteudo(e.target.value)} placeholder="Escreva aqui..." />
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={revisar} disabled={revisando} style={{ backgroundColor: '#0f766e', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, cursor: revisando ? 'wait' : 'pointer' }}>
              {revisando ? '⏳ Revisando...' : '🤖 Revisar com IA'}</button>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Gramática · ilustrações · referências psicanalíticas</span>
          </div>
        </div>
        {revisao && (
          <div style={{ border: '2px solid #0f766e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>📝 Texto revisado pela IA</span>
              <button onClick={() => { setConteudo(revisao); setRevisao(''); setMsg('✅ Aplicado!'); }} style={{ backgroundColor: '#fff', color: '#0f766e', border: 'none', borderRadius: '6px', padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>✅ Aplicar</button>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f0fdfa', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.9rem', color: '#1f2937', maxHeight: '300px', overflowY: 'auto' }}>{revisao}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
            <input type="checkbox" checked={publicado} onChange={e => setPublicado(e.target.checked)} /> Publicado</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
            <input type="checkbox" checked={destaque} onChange={e => setDestaque(e.target.checked)} /> Destaque</label>
        </div>
        {msg && <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', fontWeight: 600 }}>{msg}</div>}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={salvar} disabled={salvando} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 32px', fontWeight: 800, fontSize: '1rem', cursor: salvando ? 'wait' : 'pointer' }}>
            {salvando ? 'Salvando...' : '💾 Salvar artigo'}</button>
          <a href="/compalavra/gerenciar" style={{ display: 'inline-flex', alignItems: 'center', color: '#6b7280', fontWeight: 600, textDecoration: 'none' }}>Gerenciar →</a>
        </div>
      </div>
    </main>
  );
}
ENDCRIAR
echo "✅ app/compalavra/criar/page.tsx"

# ─── Gerenciar artigos ────────────────────────────────────────
cat > app/compalavra/gerenciar/page.tsx << 'ENDGERENCIAR'
'use client';
import { useState, useEffect } from 'react';

interface ArtigoComPalavra {
  id: string; slug: string; titulo: string; conteudo: string;
  resumo: string; imagem?: string; publicado: boolean; destaque: boolean;
  createdAt: string; updatedAt: string;
}

export default function GerenciarComPalavraPage() {
  const [artigos, setArtigos] = useState<ArtigoComPalavra[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<ArtigoComPalavra | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [revisando, setRevisando] = useState(false);
  const [revisao, setRevisao] = useState('');

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const res = await fetch('/api/compalavra/save');
    const data = await res.json();
    setArtigos(Array.isArray(data) ? data.sort((a: ArtigoComPalavra, b: ArtigoComPalavra) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
    setCarregando(false);
  }

  async function salvar() {
    if (!editando) return;
    setSalvando(true); setMsg('');
    const res = await fetch('/api/compalavra/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editando) });
    const data = await res.json();
    if (data.id) { setMsg('✅ Salvo!'); setEditando(null); setRevisao(''); carregar(); }
    else setMsg('Erro: ' + (data.error || ''));
    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este artigo?')) return;
    await fetch('/api/compalavra/save', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    carregar();
  }

  async function revisar() {
    if (!editando?.conteudo.trim()) return;
    setRevisando(true); setMsg('');
    const res = await fetch('/api/compalavra/revisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conteudo: editando.conteudo }) });
    const data = await res.json();
    if (data.revisado) { setRevisao(data.revisado); setMsg('✅ Revisão pronta!'); }
    else setMsg('Erro: ' + (data.error || ''));
    setRevisando(false);
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' };

  if (carregando) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Carregando...</div>;

  if (editando) return (
    <main style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => { setEditando(null); setRevisao(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontWeight: 700, padding: 0 }}>← Voltar</button>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#111827' }}>Editar artigo</h1>
      </div>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Título</label>
          <input style={inp} value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Resumo</label>
          <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={editando.resumo} onChange={e => setEditando({ ...editando, resumo: e.target.value })} /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>URL da imagem</label>
          <input style={inp} value={editando.imagem || ''} onChange={e => setEditando({ ...editando, imagem: e.target.value })} /></div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Conteúdo</label>
          <textarea style={{ ...inp, minHeight: '300px', resize: 'vertical' }} value={editando.conteudo} onChange={e => setEditando({ ...editando, conteudo: e.target.value })} />
          <div style={{ marginTop: '8px' }}>
            <button onClick={revisar} disabled={revisando} style={{ backgroundColor: '#0f766e', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, cursor: revisando ? 'wait' : 'pointer', fontSize: '0.8rem' }}>
              {revisando ? '⏳ Revisando...' : '🤖 Revisar com IA'}</button>
          </div>
        </div>
        {revisao && (
          <div style={{ border: '2px solid #0f766e', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>📝 Revisão da IA</span>
              <button onClick={() => { setEditando({ ...editando, conteudo: revisao }); setRevisao(''); setMsg('✅ Aplicado!'); }} style={{ backgroundColor: '#fff', color: '#0f766e', border: 'none', borderRadius: '6px', padding: '4px 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>✅ Aplicar</button>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f0fdfa', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem', maxHeight: '240px', overflowY: 'auto' }}>{revisao}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={editando.publicado} onChange={e => setEditando({ ...editando, publicado: e.target.checked })} /> Publicado</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={editando.destaque} onChange={e => setEditando({ ...editando, destaque: e.target.checked })} /> Destaque</label>
        </div>
        {msg && <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', fontWeight: 600, fontSize: '0.875rem' }}>{msg}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={salvar} disabled={salvando} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: 800, cursor: salvando ? 'wait' : 'pointer' }}>
            {salvando ? 'Salvando...' : '💾 Salvar'}</button>
          <button onClick={() => { setEditando(null); setRevisao(''); setMsg(''); }} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#111827' }}>✍️ ComAPalavra — Gerenciar</h1>
        <a href="/compalavra/criar" style={{ backgroundColor: '#0f766e', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem' }}>+ Novo artigo</a>
      </div>
      {msg && <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', fontWeight: 600 }}>{msg}</div>}
      {artigos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Nenhum artigo. <a href="/compalavra/criar" style={{ color: '#0f766e', fontWeight: 700 }}>Criar →</a></div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {artigos.map(artigo => (
            <div key={artigo.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
              {artigo.imagem && <img src={artigo.imagem} alt="" style={{ width: '70px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{artigo.titulo || '(sem título)'}</span>
                  {artigo.destaque && <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>DESTAQUE</span>}
                  {artigo.publicado
                    ? <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>PUBLICADO</span>
                    : <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>RASCUNHO</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                  {new Date(artigo.createdAt).toLocaleDateString('pt-BR')} · /compalavra/{artigo.slug}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => { setEditando(artigo); setRevisao(''); setMsg(''); }} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', padding: '7px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                <a href={`/compalavra/${artigo.slug}`} target="_blank" rel="noopener" style={{ backgroundColor: '#f0fdfa', color: '#0f766e', textDecoration: 'none', borderRadius: '6px', padding: '7px 12px', fontWeight: 600, fontSize: '0.8rem', border: '1px solid #a7f3d0' }}>Ver</a>
                <button onClick={() => excluir(artigo.id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '7px 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
ENDGERENCIAR
echo "✅ app/compalavra/gerenciar/page.tsx"

echo ""
echo "🎉 ComAPalavra instalado com sucesso!"
echo ""
echo "Próximos passos:"
echo "  1. Adicione no .env.local:  comApalavra_OPENAI=sua-chave-openai"
echo "  2. Acesse /compalavra/criar para escrever o primeiro artigo"
echo "  3. Acesse /compalavra/gerenciar para publicar e marcar destaque"
echo "  4. A coluna pública fica em /compalavra"
