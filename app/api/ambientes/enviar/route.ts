import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { kv } from '@/lib/kv';
import { linkAfiliadoOk } from '@/lib/links-afiliados';


function criarTransporter() {
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port: Number(process.env.ZOHO_SMTP_PORT),
    secure: true,
    tls: { rejectUnauthorized: false },
    auth: {
      user: process.env.ZOHO_SMTP_USER,
      pass: process.env.ZOHO_SMTP_PASS,
    },
  });
}


type Secao = { titulo: string; emoji: string };

const SECOES: Record<string, Secao> = {
  'monte-seu-ambiente': { titulo: 'Monte seu Ambiente', emoji: '🏠🪴' },
  'monte-seu-momento':  { titulo: 'Monte seu Momento',  emoji: '🍷☕' },
  'vista-se':           { titulo: 'Vista-se',           emoji: '👔👗' },
  'vista-seu-filho':    { titulo: 'Vista seu Filho',    emoji: '👶👟' },
  'beleza':             { titulo: 'Beleza',             emoji: '🧴💄' },
  'mercado':            { titulo: 'Mercado',            emoji: '🛒🧺' },
};

SECOES['dia-das-criancas'] = { titulo: 'Dia das Crianças', emoji: '🎈' };
SECOES['natal'] = { titulo: 'Natal', emoji: '🎄' };

const SECAO_PADRAO: Secao = { titulo: 'Seu Universo', emoji: '✨' };

function identificarSecao(referer: string | null): Secao {
  try {
    const pagina = new URL(referer || '').pathname.split('/')[1];
    return SECOES[pagina] || SECAO_PADRAO;
  } catch {
    return SECAO_PADRAO;
  }
}


interface ProdutoLista {
  nome: string;
  preco: number;
  precoOriginal?: number;
  desconto?: number;
  parcelas?: string;
  valorParcela?: string;
  link: string;
  imagem?: string;
  ambiente?: string;
  tipoAmbiente?: string;
  loja?: string;
}

function esc(t: string) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function gerarHtml(produtos: ProdutoLista[], secao: Secao, mensagem = ''): string {
  const itens = produtos.map(p => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f3f4f6;vertical-align:top;width:70px">
        ${p.imagem ? `<img src="${p.imagem}" alt="" style="width:64px;height:64px;object-fit:contain;border-radius:6px;background:#f9fafb" />` : ''}
      </td>
      <td style="padding:12px;border-bottom:1px solid #f3f4f6;vertical-align:top">
        <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:4px">${p.nome}</div>
        ${p.ambiente ? `<div style="font-size:12px;color:#7c3aed;margin-bottom:4px">🏠 ${p.ambiente}${p.tipoAmbiente ? ` · ${p.tipoAmbiente}` : ''}</div>` : ''}
        ${p.loja ? `<div style="font-size:12px;color:#047857;margin-bottom:4px">🏪 ${p.loja}</div>` : ''}
        ${p.precoOriginal && p.precoOriginal > p.preco ? `<div style="font-size:12px;color:#9ca3af;text-decoration:line-through">R$ ${p.precoOriginal.toFixed(2).replace('.', ',')}</div>` : ''}
        <div style="font-size:18px;font-weight:800;color:#dc2626">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
        ${p.parcelas && p.valorParcela ? `<div style="font-size:12px;color:#047857;font-weight:600">${p.parcelas}x de R$ ${parseFloat(p.valorParcela).toFixed(2).replace('.', ',')}</div>` : ''}
      </td>
      <td style="padding:12px;border-bottom:1px solid #f3f4f6;vertical-align:middle;text-align:right">
        <a href="${p.link}" style="display:inline-block;padding:8px 16px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700">
          Ver oferta →
        </a>
        ${p.desconto && p.desconto > 0 ? `<div style="font-size:11px;color:#dc2626;font-weight:700;margin-top:4px">-${p.desconto}%</div>` : ''}
      </td>
    </tr>
  `).join('');

  const total = produtos.reduce((s, p) => s + p.preco, 0);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#2563eb 100%);padding:32px 24px;text-align:center">
      <h1 style="color:#fff;margin:0 0 8px;font-size:22px;font-weight:900">${secao.emoji} Sua lista · ${secao.titulo}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px">Produtos selecionados com links de oferta</p>
    </div>

    ${mensagem ? `<div style="margin:20px 16px 4px;padding:16px 18px;background:#fff7ed;border-left:4px solid #f59e0b;border-radius:10px;font-size:15px;line-height:1.6;color:#1f2937">${esc(mensagem).replace(/\n/g, '<br>')}</div>` : ''}

    <!-- Produtos -->
    <div style="padding:0 16px">
      <table style="width:100%;border-collapse:collapse">
        <tbody>${itens}</tbody>
      </table>
    </div>

    <!-- Total -->
    <div style="margin:0 16px 16px;padding:14px 16px;background:#f5f3ff;border-radius:10px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:14px;color:#6b7280">Total estimado:</span>
      <span style="font-size:20px;font-weight:900;color:#7c3aed">R$ ${total.toFixed(2).replace('.', ',')}</span>
    </div>

    <!-- Rodapé -->
    <div style="padding:20px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center">
      <p style="font-size:12px;color:#9ca3af;margin:0">
      Lista gerada em <a href="https://comlupa.com.br" style="color:#7c3aed">comlupa.com.br</a> · Os links são de afiliado e podem mudar de preço a qualquer momento.
      </p>
    </div>

  </div>
</body>
</html>`;
}

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_DEST = 5;
const MAX_PRODUTOS = 10;

// conta envios numa janela de tempo; true = passou do limite
async function estourou(chave: string, max: number, janelaMin: number) {
  const agora = Date.now();
  const v = await kv.get<{ n: number; ate: number }>(chave);
  const atual = v && v.ate > agora ? v : { n: 0, ate: agora + janelaMin * 60000 };
  if (atual.n >= max) return true;
  await kv.set(chave, { n: atual.n + 1, ate: atual.ate });
  return false;
}


export async function POST(req: NextRequest) {
  try {
    const { site, email, emailsExtra, produtos, mensagem } = await req.json();
    if (site) return NextResponse.json({ success: true }); // robô: finge que enviou
    const msg = typeof mensagem === 'string' ? mensagem.trim().slice(0, 3000) : '';

    if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 });
    if (!produtos?.length) return NextResponse.json({ error: 'Lista vazia' }, { status: 400 });

    // Destinatários: e-mail principal + extras separados por vírgula
    const extras = (emailsExtra || '')
       .split(/[,;\s]+/)
      .map((e: string) => e.trim())
      .filter(Boolean);
    const todos = [String(email).trim(), ...extras].map((e: string) => e.toLowerCase());
    if (todos.length > MAX_DEST) {
      return NextResponse.json({ error: `Você pode enviar cópia para até ${MAX_DEST - 1} e-mails.` }, { status: 400 });
    }
    if (!todos.every((e: string) => EMAIL_OK.test(e))) {
      return NextResponse.json({ error: 'Confira os e-mails digitados.' }, { status: 400 });
    }
    if (!Array.isArray(produtos) || produtos.length > MAX_PRODUTOS) {
      return NextResponse.json({ error: `A lista pode ter até ${MAX_PRODUTOS} produtos.` }, { status: 400 });
    }
    const ruins = produtos.filter((p: any) => !linkAfiliadoOk(String(p?.link || '')));
    if (ruins.length) {
      console.warn('[enviar] link recusado:', ruins.slice(0, 3).map((p: any) => p?.link));
      return NextResponse.json({ error: 'Um dos produtos tem um link que não reconhecemos. Tire-o da lista e tente de novo.' }, { status: 400 });
    }
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'sem-ip';
    if (await estourou(`envio:ip:${ip}`, 10, 60)) {
      return NextResponse.json({ error: 'Muitos envios seguidos. Tente de novo daqui a pouco.' }, { status: 429 });
    }
    if (await estourou('envio:site', 300, 1440)) {
      return NextResponse.json({ error: 'O envio por e-mail está muito procurado hoje. Tente amanhã ou compartilhe pelo WhatsApp.' }, { status: 429 });
    }
    const destinatarios = todos.join(', ');

    const secao = identificarSecao(req.headers.get('referer'));
    const html = gerarHtml(produtos, secao, msg);

    await criarTransporter().sendMail({
            from: `"${secao.titulo} · Com a Lupa" <${process.env.ZOHO_FROM || process.env.ZOHO_SMTP_USER}>`,
      to: destinatarios,
      subject: msg ? `💌 Lista de pedidos · ${secao.titulo}` : `${secao.emoji} Sua lista · ${secao.titulo} — ${produtos.length} produto${produtos.length > 1 ? 's' : ''} selecionado${produtos.length > 1 ? 's' : ''}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[enviar-ambiente]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
