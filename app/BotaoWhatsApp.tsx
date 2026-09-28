'use client';

// Botão "Mandar no WhatsApp" para qualquer oferta.
// O link compartilhado passa pela página /ir do Com a Lupa, então a comissão do afiliado é mantida.

const SITE = 'https://comlupa.com.br';

function formatarPreco(preco: number | string | undefined | null): string | null {
  const n = typeof preco === 'string' ? parseFloat(preco.replace(',', '.')) : Number(preco);
  if (!n || isNaN(n) || n <= 0) return null;
  return n.toFixed(2).replace('.', ',');
}

export default function BotaoWhatsApp({
  nome,
  link,
  imagem,
  preco,
  destaque = false,
}: {
  nome: string;
  link: string;
  imagem?: string;
  preco?: number | string | null;
  destaque?: boolean;
}) {
  function compartilhar(e: React.MouseEvent) {
    // O botão fica dentro do card, que já é um link: impede abrir a oferta
    e.preventDefault();
    e.stopPropagation();

    const urlOferta = `${SITE}/ir?url=${encodeURIComponent(link)}&nome=${encodeURIComponent(nome)}&imagem=${encodeURIComponent(imagem || '')}`;
    const precoTexto = formatarPreco(preco);
    const mensagem =
      `🔍 Olha essa que achei no Com a Lupa:\n` +
      `*${nome}*` +
      (precoTexto ? `\npor R$ ${precoTexto}` : '') +
      `\n👉 ${urlOferta}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      aria-label={`Mandar ${nome} no WhatsApp`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        marginTop: '6px',
        padding: destaque ? '11px' : '7px',
        borderRadius: destaque ? '10px' : '8px',
        border: '1.5px solid #25D366',
        backgroundColor: '#fff',
        color: '#128C7E',
        fontWeight: 700,
        fontSize: destaque ? '0.95rem' : '0.8rem',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <svg width={destaque ? 18 : 15} height={destaque ? 18 : 15} viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.37 9.37 0 0 1 6.67 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43m8.02-17.45A11.27 11.27 0 0 0 12.05.74C5.8.74.72 5.82.72 12.07c0 2 .52 3.95 1.52 5.66L.62 23.26l5.66-1.48a11.3 11.3 0 0 0 5.77 1.47h.01c6.24 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01" />
      </svg>
      Mandar no WhatsApp
    </button>
  );
}
