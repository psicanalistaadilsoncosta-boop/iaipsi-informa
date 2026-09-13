'use server';
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

const FEEDS = [
  {
    url: 'https://noticias.uol.com.br/ultimas/index.xml',
    category: 'Esportes & UOL',
    color: '#ea580c',
  },
  {
    url: 'https://g1.globo.com/rss/g1/politica/',
    category: 'Política',
    color: '#1e3a8a',
  },
  {
    url: 'https://g1.globo.com/rss/g1/economia/',
    category: 'Economia',
    color: '#047857',
  },
  {
    url: 'https://news.google.com/rss/search?q=saude+mental&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    category: 'Saúde Mental',
    color: '#7c3aed',
  },
  {
    url: 'https://g1.globo.com/rss/g1/ciencia-e-saude/',
    category: 'Saúde & Ciência',
    color: '#0284c7',
  },
];

// ─── CONFIGURAÇÃO DE ANÚNCIOS ────────────────────────────────────────────────
// Adicione, remova ou edite anúncios aqui. Eles ciclam automaticamente.
const ADS = [
  {
    href: 'https://iaipsi.com',
    imageUrl: 'https://via.placeholder.com/1100x180?text=IAIPSI+—+Inteligência+Organizacional',
    alt: 'IAIPSI — Inteligência Organizacional',
    label: 'IAIPSI',
    tagline: 'Mapeamento de Inteligência Organizacional para líderes e equipes',
  },
  {
    href: 'https://arquivopsi.com',
    imageUrl: 'https://via.placeholder.com/1100x180?text=ArquivoPsi+—+Software+para+Psicanalistas',
    alt: 'ArquivoPsi',
    label: 'ArquivoPsi',
    tagline: 'O prontuário eletrônico feito para psicanalistas',
  },
  {
    href: 'https://sistemaconsciente.com.br',
    imageUrl: 'https://via.placeholder.com/1100x180?text=Liderança+Consciente+—+Sistema+4D',
    alt: 'Liderança Consciente',
    label: 'Sistema 4D — Liderança Consciente',
    tagline: 'Diagnóstico e desenvolvimento de líderes e organizações',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function truncateText(text: string | undefined, maxLength: number = 220): string {
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

    // Filtra títulos com placeholders xx% / x%
    const filtered = allItems.filter(
      (item) => !item.title?.match(/\bxx%|x%;|x%\b/i)
    );

    return filtered.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return [];
  }
}

// ─── Card de Anúncio ─────────────────────────────────────────────────────────
function AdCard({ index }: { index: number }) {
  const ad = ADS[index % ADS.length];
  return (
    <div style={{
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      {/* Label "Publicidade" */}
      <div style={{
        position: 'absolute', top: '10px', right: '12px', zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: '6px', padding: '2px 8px',
      }}>
        <span style={{ fontSize: '0.6rem', color: '#ffffff', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Publicidade
        </span>
      </div>

      <a href={ad.href} target="_blank" rel="noopener noreferrer sponsored" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
          <img src={ad.imageUrl} alt={ad.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{
          backgroundColor: '#f8fafc', padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e40af' }}>{ad.label}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>{ad.tagline}</p>
          </div>
          <span style={{
            backgroundColor: '#2563eb', color: '#fff',
            padding: '6px 16px', borderRadius: '8px',
            fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            Saiba mais →
          </span>
        </div>
      </a>
    </div>
  );
}

// ─── Card Hero (notícia principal do grupo) ───────────────────────────────────
function HeroCard({ item }: { item: FeedItem }) {
  return (
    <article style={{
      backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden',
      border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
    }}>
      {item.imageUrl ? (
        <div style={{ height: '280px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
          <img src={item.imageUrl} alt={item.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ height: '8px', backgroundColor: item.categoryColor || '#2563eb' }} />
      )}
      <div style={{ padding: '22px 26px 26px' }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{
            backgroundColor: item.categoryColor || '#2563eb', color: '#fff',
            fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
            borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.6px',
          }}>
            {item.category}
          </span>
        </div>
        <h2 style={{ fontSize: '1.3rem', margin: '0 0 8px', lineHeight: '1.4', fontWeight: 800, color: '#111827' }}>
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            {item.title}
          </a>
        </h2>
        {item.pubDate && (
          <small style={{ color: '#9ca3af', display: 'block', marginBottom: '10px', fontSize: '0.78rem' }}>
            📅 {new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </small>
        )}
        {item.contentSnippet && (
          <p style={{ color: '#4b5563', margin: '0 0 16px', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {item.contentSnippet}
          </p>
        )}
        <a href={item.link} target="_blank" rel="noopener noreferrer"
          style={{ color: item.categoryColor || '#2563eb', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'block' }}>
          Ler matéria completa →
        </a>
      </div>
    </article>
  );
}

// ─── Card Secundário (coluna lateral) ────────────────────────────────────────
function SecondaryCard({ item }: { item: FeedItem }) {
  return (
    <article style={{
      backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden',
      border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
    }}>
      {item.imageUrl && (
        <div style={{ height: '150px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
          <img src={item.imageUrl} alt={item.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{
            backgroundColor: item.categoryColor || '#2563eb', color: '#fff',
            fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px',
            borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {item.category}
          </span>
        </div>
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 6px', lineHeight: '1.4', fontWeight: 700, color: '#111827' }}>
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            {item.title}
          </a>
        </h3>
        {item.pubDate && (
          <small style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontSize: '0.75rem' }}>
            📅 {new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </small>
        )}
        {item.contentSnippet && (
          <p style={{ color: '#4b5563', margin: '0 0 12px', fontSize: '0.82rem', lineHeight: '1.55' }}>
            {item.contentSnippet}
          </p>
        )}
        <a href={item.link} target="_blank" rel="noopener noreferrer"
          style={{ color: item.categoryColor || '#2563eb', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'block' }}>
          Ler matéria completa →
        </a>
      </div>
    </article>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default async function Home() {
  const posts = await getNews();

  // Agrupa em blocos de 3: 1 hero + 2 secundários
  const grouped: FeedItem[][] = [];
  for (let i = 0; i < posts.length; i += 3) {
    grouped.push(posts.slice(i, i + 3));
  }

  let adCounter = 0;

  return (
    <main style={{
      maxWidth: '1100px', margin: '0 auto', padding: '30px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f1f5f9', minHeight: '100vh',
    }}>

      {/* Cabeçalho */}
      <header style={{
        backgroundColor: '#ffffff', padding: '24px 28px', borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '20px',
        borderTop: '6px solid #2563eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#111827', margin: 0, fontWeight: 800 }}>IAIPSI Informa</h1>
          <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '0.95rem', margin: '4px 0 0' }}>
            Notícias, Esportes, Política, Economia e Saúde Mental
          </p>
        </div>
        <a href="https://www.uol.com.br/esporte/futebol/central-de-jogos/" target="_blank" rel="noopener noreferrer"
          style={{ backgroundColor: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
          ⚽ Central de Jogos UOL ↗
        </a>
      </header>

      {/* Grupos de notícias intercalados com anúncios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {grouped.map((group, gi) => (
          <div key={gi}>
            {/* Anúncio a cada 2 grupos (≈ 6 notícias) */}
            {gi > 0 && gi % 2 === 0 && (
              <div style={{ marginBottom: '24px' }}>
                <AdCard index={adCounter++} />
              </div>
            )}

            {/* Bloco hero + lateral */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: group.length === 1 ? '1fr' : '2fr 1fr',
              gap: '16px',
              alignItems: 'start',
            }}>
              {/* Hero */}
              {group[0] && <HeroCard item={group[0]} />}

              {/* Coluna lateral */}
              {group.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {group.slice(1).map((item, si) => (
                    <SecondaryCard key={si} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
