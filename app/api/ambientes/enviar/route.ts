import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

function gerarHtml(produtos: ProdutoLista[]): string {
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
      <h1 style="color:#fff;margin:0 0 8px;font-size:22px;font-weight:900">🏠 Sua lista de ambiente</h1>
      <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px">Produtos selecionados com links de oferta</p>
    </div>

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
        Lista gerada em <a href="https://iaipsi.com/monte-seu-ambiente" style="color:#7c3aed">iaipsi.com</a> · Os links são de afiliado e podem mudar de preço a qualquer momento.
      </p>
    </div>

  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, emailsExtra, produtos } = await req.json();

    if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 });
    if (!produtos?.length) return NextResponse.json({ error: 'Lista vazia' }, { status: 400 });

    // Destinatários: e-mail principal + extras separados por vírgula
    const extras = (emailsExtra || '')
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean);
    const destinatarios = [email, ...extras].join(', ');

     const html = gerarHtml(produtos);

    await criarTransporter().sendMail({
      from: `"Monte seu Ambiente · iaipsi" <${process.env.ZOHO_SMTP_USER}>`,
      to: destinatarios,
      subject: `🏠 Sua lista de ambiente — ${produtos.length} produto${produtos.length > 1 ? 's' : ''} selecionado${produtos.length > 1 ? 's' : ''}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[enviar-ambiente]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
