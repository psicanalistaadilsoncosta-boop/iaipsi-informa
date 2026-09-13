import Parser from 'rss-parser';

interface FeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
}

const parser = new Parser();

async function getNews() {
  try {
    // Substitua pela URL do seu feed RSS oficial
    const feed = await parser.parseURL('https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419');
    return feed.items as FeedItem[];
  } catch (error) {
    console.error('Erro ao buscar RSS:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getNews();

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: '#111', margin: 0 }}>IAIPSI Informa</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>Atualizações e notícias em tempo real</p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.length === 0 ? (
          <p>Nenhuma notícia encontrada no momento.</p>
        ) : (
          posts.slice(0, 10).map((item, index) => (
            <article key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 10px 0' }}>
                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                  {item.title}
                </a>
              </h2>
              {item.pubDate && (
                <small style={{ color: '#9ca3af', display: 'block', marginBottom: '10px' }}>
                  {new Date(item.pubDate).toLocaleDateString('pt-BR')}
                </small>
              )}
              {item.contentSnippet && (
                <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {item.contentSnippet}
                </p>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}