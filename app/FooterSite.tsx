// Substitua o <footer> atual no NewsClient.tsx por este componente
// Cole no topo do NewsClient.tsx: import FooterSite from './FooterSite';
// E no JSX substitua o <footer>...</footer> por <FooterSite />

export default function FooterSite() {
  const ano = new Date().getFullYear();

  return (
    <footer style={{ marginTop: '48px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', fontFamily: 'system-ui, sans-serif' }}>

      {/* Faixa superior */}
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 20px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '32px' }}>

          {/* Coluna 1 — Marca */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>IAIPSI Informa</h3>
            <p style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 16px' }}>
              Agregador de notícias com curadoria editorial, análises psicanalíticas e seleção de ofertas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a href="https://iaipsi.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                🌐 iaipsi.com — Instituto de Psicanálise
              </a>
              <a href="https://sistemaconsciente.com.br" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                🧠 sistemaconsciente.com.br — Liderança Consciente
              </a>
              <a href="https://arquivopsi.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                📁 arquivopsi.com — SaaS para Psicanalistas
              </a>
            </div>
          </div>

          {/* Coluna 2 — Conteúdo */}
          <div>
            <h4 style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Conteúdo</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { href: '/arquivo-editorial', label: '📰 Análises Editoriais' },
                { href: '/arquivo-sabores', label: '🍽 Sabores & Destinos' },
                { href: '/ofertas', label: '🛍 Ofertas & Cupons' },
                { href: '/ofertas-selecionadas', label: '⭐ Ofertas Selecionadas' },
                { href: '/parcelado', label: '💳 Parcelado sem Juros' },
                { href: '/oferta-do-dia', label: '🔥 Ofertas do Dia' },
              ].map(({ href, label }) => (
                <a key={href} href={href} style={{ fontSize: '0.65rem', color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Coluna 3 — Sobre */}
          <div>
            <h4 style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sobre</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/termos" style={{ fontSize: '0.65rem', color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>📄 Termos de Uso</a>
              <a href="/termos" style={{ fontSize: '0.65rem', color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>🔒 Política de Privacidade</a>
            </div>
            <div style={{ marginTop: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '12px 14px', border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '0.65rem', color: '#047857', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                🍪 Não utilizamos cookies de rastreamento.<br />
                </p>
            </div>
          </div>

          {/* Coluna 4 — Adilson */}
          <div>
            <h4 style={{ fontSize: '0.55rem', fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}></h4>
           </div>

        </div>
      </div>

      {/* Faixa de disclaimers */}
      <div style={{ borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: '#6b7280' }}>Notícias:</strong> Coletadas automaticamente dos principais portais de comunicação do Brasil e do mundo via feeds RSS públicos. O IAIPSI Informa não é autor das matérias jornalísticas exibidas.
          </p>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: '#6b7280' }}>Análises editoriais e Sabores & Destinos:</strong> Elaboradas com auxílio de inteligência artificial e revisadas.
          </p>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: '#6b7280' }}>Ofertas e afiliados:</strong> Os produtos, ofertas e cupons exibidos são de responsabilidade exclusiva dos respectivos anunciantes. Preços, condições e disponibilidade estão sujeitos a alteração. Confira sempre o valor final no site do anunciante antes de concluir a compra. Links de afiliado — ao comprar através deles você apoia o IAIPSI Informa sem custo adicional para você.
          </p>
        </div>
      </div>

      {/* Rodapé final */}
      <div style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
            © {ano} IAIPSI Informa · Todos os direitos reservados
          </p>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
            Desenvolvido por <a href="https://iaipsi.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>Adilson Costa</a>
          </p>
        </div>
      </div>

    </footer>
  );
}
