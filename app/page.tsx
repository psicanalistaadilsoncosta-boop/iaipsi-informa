import Parser from 'rss-parser';

export const revalidate = 60; // Atualiza o RSS a cada 60 segundos

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
}

async function getFeed() {
  const parser = new Parser();
  try {
    // Feed de notícias sobre psicologia/saúde mental
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=psicanalise+saude+mental&hl=pt-BR&gl=BR&ceid=BR:pt-419');
    return feed.items || [];
  } catch (error) {
    console.error('Erro ao buscar RSS:', error);
    return [];
  }
}

export default async function Home() {
  const posts: RSSItem[] = await getFeed();

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">IAIPSI Informa</h1>
        <p className="text-slate-600">Notícias e Atualizações em Psicanálise & Saúde Mental</p>
      </header>

      <section className="max-w-4xl mx-auto grid gap-4">
        {posts.length > 0 ? (
          posts.map((item, index) => (
            <article key={index} className="p-4 bg-white rounded-lg shadow border border-slate-200">
              <h2 className="text-xl font-semibold text-blue-700 hover:underline">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h2>
              {item.pubDate && (
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(item.pubDate).toLocaleDateString('pt-BR')}
                </p>
              )}
              {item.contentSnippet && (
                <p className="text-sm text-slate-600 mt-2">{item.contentSnippet}</p>
              )}
            </article>
          ))
        ) : (
          <p className="text-center text-slate-500">Nenhuma notícia encontrada no momento.</p>
        )}
      </section>
    </main>
  );
}