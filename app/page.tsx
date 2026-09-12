import Parser from 'rss-parser';

async function getNewsFeed() {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'mediaContent'],
        ['media:thumbnail', 'mediaThumbnail'],
        ['content:encoded', 'contentEncoded']
      ]
    }
  });

  const feedUrl = 'https://g1.globo.com/rss/g1/tecnologia/';

  try {
    const feed = await parser.parseURL(feedUrl);

    return feed.items.map((item: any) => {
      let imageUrl = null;

      if (item.mediaContent && item.mediaContent.$.url) {
        imageUrl = item.mediaContent.$.url;
      } else if (item.mediaThumbnail && item.mediaThumbnail.$.url) {
        imageUrl = item.mediaThumbnail.$.url;
      } else {
        const htmlContent = item.contentEncoded || item.content || '';
        const imgMatch = htmlContent.match(/src="([^"]+\.(?:jpg|jpeg|png|webp))"/i);
        if (imgMatch) imageUrl = imgMatch[1];
      }

      const defaultImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop';

      return {
        title: item.title,
        link: item.link,
        snippet: item.contentSnippet ? item.contentSnippet.slice(0, 120) + '...' : 'Confira os detalhes da matéria completa no portal.',
        pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString('pt-BR') : '',
        image: imageUrl || defaultImage
      };
    });
  } catch (error) {
    console.error('Erro ao buscar feed RSS:', error);
    return [];
  }
}

export default async function HomePage() {
  const newsList = await getNewsFeed();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* 1. CABEÇALHO */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Portal de Atualidades</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">IAIPSI<span className="text-indigo-600"> INFORMA</span></h1>
          </div>
          
          <a
            href="https://wa.me/5511999999999" // Substitua pelo seu WhatsApp
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-full transition shadow-md"
          >
            Agendar Consulta
          </a>
        </div>
      </header>

      {/* 2. BANNER TOPO DE PSICANÁLISE */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 border-b border-indigo-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Atendimento Psicanalítico
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-3 tracking-tight">
            O ritmo das informações te deixa sobrecarregado?
          </h2>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-6">
            Diante de tantas mudanças e notícias diárias, encontre um espaço de escuta analítica para elaborar suas questões com singularidade.
          </p>
          <a
            href="https://wa.me/5511999999999" // Substitua pelo seu WhatsApp
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            Conhecer Espaço de Escuta
          </a>
        </div>
      </section>

      {/* 3. VITRINE ESTILO LIVINGSOCIAL */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Principais Assuntos do Dia</h3>
          <span className="text-xs text-slate-500 font-medium">Atualização Automática</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news: any, index: number) => (
            <div key={index} className="contents">
              
              {/* CARD DE NOTÍCIA */}
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col group">
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md">
                    Notícia
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{news.pubDate}</span>
                    <h4 className="font-bold text-slate-900 text-lg mt-1 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition">
                      {news.title}
                    </h4>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                      {news.snippet}
                    </p>
                  </div>

                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 text-sm font-bold py-3 rounded-xl transition-colors duration-200"
                  >
                    Ler Matéria na Íntegra
                  </a>
                </div>
              </article>

              {/* BANNER INTERCALADO (A CADA 3 CARDS) */}
              {(index + 1) % 3 === 0 && (
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between border border-indigo-400/30 relative overflow-hidden">
                  <div>
                    <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4 backdrop-blur-md">
                      Destaque Psicanálise
                    </span>
                    <h4 className="text-2xl font-black leading-tight mb-3">
                      Escuta Analítica & Psicanálise
                    </h4>
                    <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                      Sua mente também precisa de digestão para o volume de informações do dia a dia. Agende uma conversa.
                    </p>
                  </div>

                  <a
                    href="https://wa.me/5511999999999" // Substitua pelo seu WhatsApp
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center bg-white text-indigo-950 hover:bg-indigo-50 font-black text-sm py-3 px-4 rounded-xl transition shadow-md"
                  >
                    Falar com Psicanalista
                  </a>
                </div>
              )}

            </div>
          ))}
        </div>
      </main>

      {/* 4. RODAPÉ */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} IAIPSI Informa — Espaço Psicanalítico & Atualidades.</p>
      </footer>

    </div>
  );
}