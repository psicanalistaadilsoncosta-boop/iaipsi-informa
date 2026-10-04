// lib/importa-categoria.ts
// Lê páginas de categoria de uma loja e extrai os produtos do bloco de dados padrão (JSON-LD "Product").
// Só leitura: não grava nada.

export type ProdutoLido = { nome: string; preco: number; imagem: string; url: string; marca?: string; sku?: string; esgotado?: boolean };
export type Resultado =
  | { status: 'ok'; produtos: ProdutoLido[]; paginasLidas: number; avisos: string[] }
  | { status: 'bloqueio' | 'sem-dados' | 'erro'; mensagem: string; avisos: string[] };

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const espera = (ms: number) => new Promise(r => setTimeout(r, ms));

// Monta o endereço da página N a partir do link da página 2 (troca o "2" de paginação pelo N).
export function enderecoDaPagina(pag1: string, pag2: string, n: number): string | null {
    if (n === 1) return pag1;
  if (!pag2) return null;
  if (n === 2) return pag2;
  const padroes: [RegExp, string][] = [
    [/([-_]p)2(\.html)/i, `$1${n}$2`],                                  // Wine: ...-p2.html
    [/([?&](?:pn|page|pg|pagina|p)=)2(?!\d)/gi, `$1${n}`],              // ?pn=2, ?page=2 ...
  ];
  let saida = pag2, mudou = false;
  for (const [re, troca] of padroes) {
    const novo = saida.replace(re, troca);
    if (novo !== saida) { saida = novo; mudou = true; }
  }
  const start = pag2.match(/[?&]start=(\d+)/i);                         // Salesforce: ?start=24&sz=24
  if (start) {
    const passo = Number(start[1]);
    saida = saida.replace(/([?&]start=)\d+/i, `$1${passo * (n - 1)}`);
    mudou = true;
  }
  return mudou ? saida : null;
}

function primeiraImagem(img: any): string {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (Array.isArray(img)) return primeiraImagem(img[0]);
  return img.url || img.contentUrl || '';
}

function lerOferta(of: any): { preco: number; esgotado: boolean; url?: string } {
  const o = Array.isArray(of) ? of[0] : of;
  if (!o) return { preco: 0, esgotado: false };
  const preco = Number(String(o.price ?? o.lowPrice ?? '').replace(',', '.')) || 0;
  const esgotado = /OutOfStock|SoldOut|Discontinued/i.test(String(o.availability || ''));
  return { preco, esgotado, url: o.url };
}

// Junta todos os objetos "Product" do HTML (soltos, em @graph ou dentro de ItemList)
export function extrairProdutos(html: string, base: string) {
  const achados: any[] = [];
  const visitar = (o: any) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach(visitar); return; }
    const tipo = o['@type'];
    if (tipo === 'Product' || (Array.isArray(tipo) && tipo.includes('Product'))) achados.push(o);
    if (o['@graph']) visitar(o['@graph']);
    if (o.itemListElement) visitar(o.itemListElement);
    if (o.item) visitar(o.item);
  };
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visitar(JSON.parse(m[1].trim())); } catch { /* bloco com erro: ignora */ }
  }
  let semPreco = 0, esgotados = 0, semLink = 0;
  const produtos: ProdutoLido[] = [];
  for (const p of achados) {
    const of = lerOferta(p.offers);
    const bruto = of.url || p.url || '';
    let url = '';
    try { url = bruto ? new URL(bruto, base).href : ''; } catch {}
    if (!url) { semLink++; continue; }
    if (of.esgotado) esgotados++;
    if (!of.preco) { semPreco++; continue; }
    let imagem = primeiraImagem(p.image);
    try { imagem = imagem ? new URL(imagem, base).href : ''; } catch { imagem = ''; }
    produtos.push({
      nome: String(p.name || '').trim().slice(0, 160),
      preco: of.preco,
      imagem,
      url,
      marca: typeof p.brand === 'string' ? p.brand : p.brand?.name,
           sku: p.sku ? String(p.sku) : undefined,
      esgotado: of.esgotado,
    });
  }
  return { produtos, semPreco, esgotados, semLink, totalBlocos: achados.length };
}

export async function lerCategoria(pag1: string, pag2: string, paginas: number): Promise<Resultado> {
  const avisos: string[] = [];
  const todos = new Map<string, ProdutoLido>();
  let lidas = 0;
  const n = Math.min(Math.max(paginas, 1), 5);

  for (let i = 1; i <= n; i++) {
    const end = enderecoDaPagina(pag1, pag2, i);
    if (!end) { if (i === 2) avisos.push('Sem o link da página 2 (ou não reconheci a paginação): li só a primeira página.'); break; }
    let r: Response;
    try {
      r = await fetch(end, { headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'pt-BR,pt;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(15000), cache: 'no-store' });
    } catch {
      if (i === 1) return { status: 'erro', mensagem: 'A loja não respondeu. Tente de novo mais tarde.', avisos };
      avisos.push(`A página ${i} não respondeu.`); break;
    }
    if (r.status === 403 || r.status === 429 || r.status === 401) {
      if (i === 1) return { status: 'bloqueio', mensagem: `Esta loja bloqueia leitura automática (código ${r.status}). Use um cartão de categoria.`, avisos };
      avisos.push(`A loja bloqueou a página ${i} (código ${r.status}).`); break;
    }
    if (!r.ok) {
      if (i === 1) return { status: 'erro', mensagem: `A loja respondeu com erro ${r.status}. Confira o link.`, avisos };
      avisos.push(`A página ${i} deu erro ${r.status}.`); break;
    }
    const html = await r.text();
    const { produtos, semPreco, esgotados, semLink, totalBlocos } = extrairProdutos(html, end);
    if (i === 1 && totalBlocos === 0) {
      return { status: 'sem-dados', mensagem: 'A página abriu, mas não traz os dados dos produtos. Use um cartão de categoria.', avisos };
    }
    const antes = todos.size;
    for (const p of produtos) if (!todos.has(p.url)) todos.set(p.url, p);
    lidas++;
    if (semPreco) avisos.push(`Página ${i}: ${semPreco} sem preço (pulados).`);
    if (esgotados) avisos.push(`Página ${i}: ${esgotados} marcados como esgotados pela loja (vêm desmarcados).`);
    if (semLink) avisos.push(`Página ${i}: ${semLink} sem link (pulados).`);
    if (i > 1 && todos.size === antes) { avisos.push(`A página ${i} repetiu produtos: parei aqui.`); break; }
    if (i < n) await espera(800); // calma com a loja
  }
  const lista = [...todos.values()];
  if (lista.length && lista.every(p => p.esgotado)) {
    lista.forEach(p => { p.esgotado = false; });
    avisos.push('A loja marcou todos como esgotados, o que não parece real: ignorei essa marcação. Confira na loja antes de publicar.');
  }
  return { status: 'ok', produtos: lista, paginasLidas: lidas, avisos };
}
