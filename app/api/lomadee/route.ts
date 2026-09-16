import { NextResponse } from 'next/server';

export const revalidate = 900; // 15 min

const API_KEY = process.env.LOMADEE_API_KEY || '';
const BASE_URL = 'https://api.lomadee.com.br';


// Mapa de segmentos para categorias do site
const SEGMENTO_PARA_CATEGORIA: Record<string, string> = {
  // Eletrodomésticos & Eletrônicos
  'Eletrodomesticos': 'Eletro & Tech',
  'Eletrodomésticos': 'Eletro & Tech',
  'Eletrodom, Moda Casa, Smart TV, Eletroportáteis': 'Eletro & Tech',
  'Eletrodomésticos, Eletroportáteis e Utilidade domésticas ': 'Eletro & Tech',
  'Eletrônicos': 'Eletro & Tech',
  'Celular': 'Eletro & Tech',
  'Smartphone e acessórios ': 'Eletro & Tech',
  'Hardware, Notebokk, Monitores PC Gamer': 'Eletro & Tech',
  'Pc gamer, Acessórios gamer e Hardware': 'Eletro & Tech',
  'Ar Condicionado, Eletrodomésticos': 'Eletro & Tech',
  'Lavadoras de Alta Pressão, Aspiradores de Pó, Robôs Aspiradores, Limpadoras de Piso': 'Eletro & Tech',
  'technology': 'Eletro & Tech',

  // Gastronomia & Vinhos
  'Bebidas ': 'Gastronomia & Vinhos',
  'Bebidas alcoólicas e utensílios de bar': 'Gastronomia & Vinhos',
  'Cervejas Artesanais, Cervejas Importadas, Cervejas de Trigo': 'Gastronomia & Vinhos',
  'Yakisoba, Bowls e promoções': 'Gastronomia & Vinhos',
  'food': 'Gastronomia & Vinhos',
  'Lixeiras; Jogos de panelas, Faqueiros, Panelas, Panelas de pressão, Facas. ': 'Gastronomia & Vinhos',

  // Viagens
  'tourism': 'Viagens',
  'malas e mochilas': 'Viagens',

  // Casa & Móveis
  'Casa e Construção': 'Casa & Móveis',
  'casa e construção ': 'Casa & Móveis',
  'casa e decoração': 'Casa & Móveis',
  'Móveis, Eletrodomésticos': 'Casa & Móveis',
  'Sofás, Móveis, Cadeiras': 'Casa & Móveis',
  'Sala de jantar, cozinhas, guarda roupas, complementos ': 'Casa & Móveis',
  'Colchões': 'Casa & Móveis',
  'Quadros': 'Casa & Móveis',
  'Vasos decorativos': 'Casa & Móveis',
  'Lixeiras; Potes herméticos; Organização de geladeira; Organização de pia; Caixas e cestas organizadoras. ': 'Casa & Móveis',
  'móveis e casa ': 'Casa & Móveis',
  'Bombas de água, Pressurizadores de água, Construção civil, Piscinas': 'Casa & Móveis',
  'fogão ': 'Casa & Móveis',

  // Moda
  'Moda': 'Moda',
  'Moda geral ': 'Moda',
  'Moda Infantil': 'Moda',
  'Moda Praia, Moda Fitness': 'Moda',
  'Calças': 'Moda',
  'Camisas (sociais, polo, camisetas), ternos, blazers,  paletós, calças sociais, bermudas, jaquetas, malhas, sobretudos e pijamas': 'Moda',
  'Roupas femininas, masculinas e infantis': 'Moda',
  'roupas femininas': 'Moda',
  'roupas infantis': 'Moda',
  'bolsas, acessórios': 'Moda',
  'calçados': 'Moda',
  'corta vento': 'Moda',
  'fashion': 'Moda',

  // Saúde & Beleza
  'Perfumaria': 'Saúde & Beleza',
  'Perfumaria ': 'Saúde & Beleza',
  'Perfimaria e farmácia': 'Saúde & Beleza',
  'Skin care': 'Saúde & Beleza',
  'remédios e cosméticos': 'Saúde & Beleza',
  'creme para estria': 'Saúde & Beleza',
  'curativos': 'Saúde & Beleza',
  'sugadores': 'Saúde & Beleza',
  'health': 'Saúde & Beleza',
  '1- Saúde, 2- Desempenho Físico, 3- Perda de Peso, 4- Bem-estar, 5- Beleza': 'Saúde & Beleza',
  'Proteínas': 'Saúde & Beleza',

  // Bebês & Kids
  'Carrinho de Bebê, Berço, Cadeira de Carro, Bebê Conforto': 'Bebês & Kids',
  'Brinquedos ': 'Bebês & Kids',

  // Entretenimento
  'Streaming': 'Entretenimento',
  'Mídia': 'Entretenimento',
  'Colecionáveis': 'Entretenimento',
  'entertainment': 'Entretenimento',
  'livros ': 'Entretenimento',

  // Serviços & Outros
  'Câmbio PF e PJ': 'Serviços',
  'financial-services': 'Serviços',
  'serviços ': 'Serviços',
  'education': 'Serviços',
  'pneu': 'Outros',
  'retail': 'Outros',
  'industry': 'Outros',
  'others': 'Outros',
  'outros ': 'Outros',
};



async function fetchLomadee(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-api-key': API_KEY },
    signal: AbortSignal.timeout(10000),
  });
  return res.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo') || 'campaigns';
  const filtro = searchParams.get('filtro') || '';

  try {
         if (tipo === 'brands') {
      const pagina = searchParams.get('pagina') || '1';
      const data = await fetchLomadee(`/affiliate/brands?limit=20&page=${pagina}`);
      return NextResponse.json(data);
    }

    if (tipo === 'brands-categoria') {
      const categoria = searchParams.get('categoria') || '';
      // Busca todas as páginas
      const paginas = await Promise.all(
        [1,2,3,4,5,6,7].map(p => fetchLomadee(`/affiliate/brands?limit=20&page=${p}`))
      );
      const todasMarcas = paginas.flatMap((d: any) => d.data || []);

      // Mapeia categorias
      const marcasComCategoria = todasMarcas.map((m: any) => ({
        ...m,
        categoriaInterna: SEGMENTO_PARA_CATEGORIA[m.segment] || 'Outros',
      }));

      // Agrupa por categoria
      const porCategoria: Record<string, any[]> = {};
      marcasComCategoria.forEach((m: any) => {
        if (!porCategoria[m.categoriaInterna]) porCategoria[m.categoriaInterna] = [];
        porCategoria[m.categoriaInterna].push(m);
      });

      if (categoria && porCategoria[categoria]) {
        return NextResponse.json({
          data: porCategoria[categoria],
          categorias: Object.keys(porCategoria).sort(),
        });
      }

      return NextResponse.json({
        data: marcasComCategoria,
        categorias: Object.keys(porCategoria).sort(),
        porCategoria,
      });
    }
    if (tipo === 'products') {
      const q = searchParams.get('q') || '';
      const pagina = searchParams.get('pagina') || '1';
      const priceMin = searchParams.get('priceMin') || '';
      const priceMax = searchParams.get('priceMax') || '';
      const orgId = searchParams.get('orgId') || '';

      const params = new URLSearchParams({
        limit: '20',
        page: pagina,
        isAvailable: 'true',
      });
      if (q) params.set('search', q);
      if (priceMin && priceMax) params.set('price', `${parseInt(priceMin) * 100}:${parseInt(priceMax) * 100}`);
      if (orgId) params.set('organizationIds', orgId);

      const data = await fetchLomadee(`/affiliate/products?${params}`);

      const produtos = (data.data || [])
                 .filter((p: any) => {
          if (!p.name || p.name === '#N/A' || !p.images?.length) return false;
          if (!p.available) return false;
          if (searchParams.get('excluirShopee') === 'true') {
            if (p.url?.includes('shopee.com')) return false;
            if (p.organizationId === '124df9f6-2449-4bf5-ae80-dfc1fac6d46a') return false;
          }
          const stock = p.options?.[0]?.stocks?.[0]?.value;
          if (stock !== undefined && stock <= 0) return false;
          return true;
        })
        .map((p: any) => {
          const option = p.options?.[0];
          const pricing = option?.pricing?.[0];
          const preco = pricing?.price || 0;
          const precoOriginal = pricing?.listPrice || pricing?.price || 0;
          const desconto = precoOriginal > preco ? Math.round((1 - preco / precoOriginal) * 100) : 0;

          const estoque = p.options?.[0]?.stocks?.[0]?.value;
          const vendedor = p.options?.[0]?.seller || '';
          const loja = vendedor.includes('shopee') || p.url.includes('shopee.com')
            ? 'Shopee' : vendedor || 'Loja parceira';
          return {
            id: p.id,
            nome: p.name,
            imagem: p.images?.[0]?.url || '',
            link: p.url,
            preco,
            precoOriginal,
            desconto,
            disponivel: p.available,
            organizationId: p.organizationId,
            estoque: estoque ?? 99,
            loja,
          };
        });

      return NextResponse.json({ data: produtos, total: data.count || 0 });
    }



    if (tipo === 'segmentos') {
      // Busca todas as 7 páginas e extrai segmentos únicos
      const paginas = await Promise.all(
        [1,2,3,4,5,6,7].map(p => fetchLomadee(`/affiliate/brands?limit=20&page=${p}`))
      );
      const todasMarcas = paginas.flatMap((d: any) => d.data || []);
      const segmentos = [...new Set(todasMarcas.map((m: any) => m.segment).filter(Boolean))].sort();
      return NextResponse.json({ segmentos, total: segmentos.length });
    }

    // Busca todas as campanhas
    const pagina = searchParams.get('pagina') || '1';
    const limite = searchParams.get('limite') || '20';
    const data = await fetchLomadee(`/affiliate/campaigns?limit=${limite}&page=${pagina}`);
    const campanhas = data.data || [];

    // Filtra por tipo se solicitado
    let resultado = campanhas;
    if (filtro === 'cupons') {
      resultado = campanhas.filter((c: any) =>
        c.type === 'GenericCoupon' || c.type === 'PersonalCoupon'
      );
    } else if (filtro === 'ofertas') {
      resultado = campanhas.filter((c: any) => c.type === 'Offer');
      } else if (filtro === 'destaque') {
      // Prioriza: 1) isHighlight, 2) tem banner, 3) é oferta (não cupom), 4) mais recente
      resultado = campanhas
        .filter((c: any) => c.status === 'onTime')
        .sort((a: any, b: any) => {
          const scoreA =
            (a.isHighlight ? 100 : 0) +
            (a.mediaKit?.banners?.length ? 50 : 0) +
            (a.type === 'Offer' ? 25 : 0);
          const scoreB =
            (b.isHighlight ? 100 : 0) +
            (b.mediaKit?.banners?.length ? 50 : 0) +
            (b.type === 'Offer' ? 25 : 0);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 1);
    }

    return NextResponse.json({ data: resultado, total: resultado.length });
  } catch (e) {
    console.error('Erro Lomadee:', e);
    return NextResponse.json({ data: [], total: 0 });
  }
}