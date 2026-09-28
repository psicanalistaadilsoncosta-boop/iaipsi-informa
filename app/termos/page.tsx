import Link from 'next/link';

export default function TermosPrivacidadePage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '32px' }}>
        ← Voltar ao site
      </Link>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

        <div style={{ backgroundColor: '#2563eb', padding: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Termos de Uso e Privacidade</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0 }}>Com a Lupa — comlupa.com.br</p>
        </div>

        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Seção */}
          {[
            {
              titulo: '1. Sobre o Com a Lupa',
              icone: '🌐',
              texto: `O Com a Lupa (comlupa.com.br) é um agregador de notícias e curadoria de conteúdo mantido por Adilson Costa — Psicanalista, Consultor Organizacional e Desenvolvedor. O site reúne notícias de portais públicos via feeds RSS, análises editoriais elaboradas com auxílio de inteligência artificial e revisadas pelo autor, posts da seção Sabores & Destinos, e uma seleção curada de ofertas e produtos de parceiros afiliados.`,
            },
            {
              titulo: '2. Notícias e Conteúdo Jornalístico',
              icone: '📰',
              texto: `As notícias exibidas no site Com a Lupa são coletadas automaticamente de feeds RSS públicos de portais de comunicação como G1, CNN Brasil, BBC Brasil, UOL, Folha de S.Paulo, entre outros. O site Com a Lupa não é autor, responsável editorial ou proprietário dessas matérias. Todo o crédito pertence aos veículos originais. Os links sempre redirecionam para a fonte original.`,
            },
            {
              titulo: '3. Análises Editoriais e Sabores & Destinos',
              icone: '✍️',
              texto: `As análises editoriais e os posts da seção Sabores & Destinos são elaborados com auxílio de ferramentas de inteligência artificial (Claude, da Anthropic) e revisados, editados e assinados por Adilson Costa. O conteúdo representa a visão editorial do autor e não deve ser interpretado como aconselhamento profissional de saúde, psicológico, jurídico ou financeiro.`,
            },
            {
              titulo: '4. Ofertas, Cupons e Links de Afiliado',
              icone: '🛍',
              texto: `O site Com a Lupa participa de programas de afiliados (Lomadee, Awin, Rakuten e outros). Isso significa que ao clicar em certos links e realizar uma compra, o site pode receber uma comissão sem custo adicional para você.\n\nOs preços, condições de parcelamento e disponibilidade dos produtos são de responsabilidade exclusiva dos anunciantes e podem ser alterados a qualquer momento sem aviso prévio. Sempre confirme as condições finais no site do anunciante e no carrinho de compras antes de finalizar a compra.\n\nO site Com a Lupa não se responsabiliza por divergências de preço, cancelamentos, atrasos ou problemas na entrega dos produtos adquiridos, visto que é somente um agregador de ofertas.`,
            },
            {
  titulo: '5. Privacidade e Dados Pessoais (LGPD)',
  icone: '🔒',
  texto: `O site Com a Lupa não usa cookies de rastreamento nem pixels de publicidade, e não tem cadastro, login ou área de membros para visitantes.\n\nQue dados coletamos: somente quando você usa o Seu Universo e pede o envio da sua lista por e-mail. Nesse caso, guardamos o e-mail informado, os produtos ou seções que você escolheu e a data do pedido. E-mails adicionais que você indicar para receber a lista são usados apenas naquele envio e não são armazenados.\n\nPara que usamos: para enviar a lista que você montou e, eventualmente, novidades e curadorias do site. Não vendemos, não alugamos e não compartilhamos seus dados com terceiros. O envio dos e-mails é feito por meio do nosso provedor de e-mail (Zoho Mail).\n\nBase legal: o seu consentimento, dado ao informar o e-mail e solicitar o envio (Lei 13.709/2018 — LGPD, art. 7º, I).\n\nPor quanto tempo: seus dados ficam guardados até você pedir a remoção.\n\nSeus direitos: você pode, a qualquer momento e sem custo, pedir para confirmar se temos seus dados, acessá-los, corrigi-los, excluí-los ou deixar de receber nossos e-mails. Basta escrever para contato@comlupa.com.br.\n\nSegurança: os dados ficam em banco de dados protegido, com acesso restrito ao responsável pelo site.\n\nResponsável pelos dados (controlador): Adilson Costa — contato@comlupa.com.br.\n\nOs sites externos acessados pelos links (lojas, portais de notícias, parceiros afiliados) têm suas próprias políticas de privacidade e de cookies, sobre as quais não temos controle.`,
},
            {
              titulo: '6. Inteligência Artificial',
              icone: '🤖',
              texto: `Utilizamos ferramentas de inteligência artificial no processo editorial — especificamente Claude (Anthropic) — para auxiliar na redação e estruturação de análises e posts. Todo conteúdo gerado por IA passa por revisão humana antes da publicação. As frases editoriais curtas exibidas nas ofertas em destaque são geradas automaticamente por IA com base no nome e categoria do produto.`,
            },
            {
              titulo: '7. Propriedade Intelectual',
              icone: '©️',
              texto: `O conteúdo original do site Com a Lupa — análises editoriais, posts Sabores & Destinos, curadoria de ofertas e design do site — é de propriedade de Adilson Costa e protegido por direitos autorais. As notícias exibidas pertencem aos seus respectivos veículos. As imagens de produtos pertencem aos respectivos anunciantes.`,
            },
            {
              titulo: '8. Contato',
              icone: '✉️',
              texto: `Para dúvidas, solicitações ou sugestões, entre em contato pelo e-mail contato@comlupa.com.br`,
            },
          ].map(({ titulo, icone, texto }) => (
            <div key={titulo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>{icone}</span>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>{titulo}</h2>
              </div>
              <div style={{ paddingLeft: '34px' }}>
                {texto.split('\n\n').map((p, i) => (
                  <p key={i} style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.7, margin: '0 0 12px' }}>{p}</p>
                ))}
              </div>
              <div style={{ borderBottom: '1px solid #f3f4f6', marginTop: '8px' }} />
            </div>
          ))}

          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, textAlign: 'center' }}>
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

        </div>
      </div>

    </main>
  );
}
