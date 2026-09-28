import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        // Painéis de administração
        '/admin',
        '/produtos/',
        '/editorial$',
        '/sabores$',
        '/compalavra/criar',
        '/compalavra/gerenciar',
        '/produto/criar',
        '/produto/gerenciar',
        '/viagem/criar',
        '/viagem/gerenciar',
        '/viagens/buscar',
        '/oferta-do-dia/editar',
        // Páginas de passagem / resultados (sem conteúdo próprio)
        '/ir',
        '/busca',
        '/noticia?',
      ],
    },
    sitemap: 'https://comlupa.com.br/sitemap.xml',
  };
}
