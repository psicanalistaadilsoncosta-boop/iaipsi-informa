import Parser from 'rss-parser';

interface FeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  category?: string;
  categoryColor?: string;
  imageUrl?: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
});

// Canais organizados com temas e cores
const FEEDS = [
  {
    url: 'https://ge.globo.com/rss/ge/',
    category: 'Esportes',
    color: '#ea580c', // Laranja
  },
  {
    url: 'https://g1.globo.com/rss/g1/politica/',
    category: 'Política',
    color: '#1e3a8a', // Azul escuro
  },
  {
    url: 'https://g1.globo.com/rss/g1/economia/',
    category: 'Economia',
    color: '#047857', // Verde
  },
  {
    url: 'https://news.google.com/rss/search?q=saude+mental&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    category: 'Saúde Mental',
    color: '#7c3aed', // Roxo
  },
  {
    url: 'https://g1.globo.com/rss/g1/ciencia-e-saude/',
    category: 'Saúde & Ciência',
    color: '#0284c7', // Azul claro
  },
];

// Trunca o texto para evitar resumos gigantes nos cards
function truncateText(text: string | undefined, maxLength: number = 110): string {
  if (!text) return '';
  const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.slice(0, maxLength) + '...';
}

function extractImageUrl(item: any): string | undefined {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item.mediaContent?.$.url) return item.mediaContent.$.url;

  const content = item.content || item['content:encoded'] || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

  return undefined;
}

async function getNews(): Promise<FeedItem[]> {
  try {
    const promises = FEEDS.map(async (feed) => {
      try {
        const res = await parser.parseURL(feed.url);
        return res.items.map((item) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: truncateText(item.contentSnippet || item.content),
          category: feed.category,
          categoryColor: feed.color,
          imageUrl: extractImageUrl(item),
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(promises);
    const allItems = results.flat();

    return allItems.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getNews();

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '30px', borderTop: '6px solid #2563eb' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#111827', margin: 0, fontWeight: 800 }}>IAIPSI Informa</h1>
        <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '1rem' }}>Esportes, Política, Economia e Saúde Mental em um só lugar</p>
      </header>

      {/* Grid de Notícias */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {posts.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Carregando notícias...</p>
        ) : (
          posts.map((item, index) => (
            <article key={index} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              
              {/* Imagem */}
              {item.imageUrl && (
                <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                  <img src={item.imageUrl} alt={item.title || 'Imagem'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                
                {/* Tag de Categoria */}
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ backgroundColor: item.categoryColor || '#2563eb', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.category}
                  </span>
                </div>

                {/* Título */}
                <h2 style={{ fontSize: '1.05rem', margin: '0 0 8px 0', lineHeight: '1.4', fontWeight: 700, height: '2.8em', overflow: 'hidden' }}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1f2937', textDecoration: 'none' }}>
                    {item.title}
                  </a>
                </h2>

                {/* Data */}
                {item.pubDate && (
                  <small style={{ color: '#9ca3af', display: 'block', marginBottom: '10px', fontSize: '0.8rem' }}>
                    📅 {new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </small>
                )}

                {/* Resumo com limite de tamanho e altura padronizada */}
                {item.contentSnippet && (
                  <p style={{ color: '#4b5563', margin: '0 0 16px 0', fontSize: '0.875rem', lineHeight: '1.5', height: '3.9em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.contentSnippet}
                  </p>
                )}

                {/* Link final */}
                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: item.categoryColor || '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                    Ler matéria completa →
                  </a>
                </div>

              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}