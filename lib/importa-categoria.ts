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
  if (ehVtex(pag1)) return paginaVtex(pag1, n); // loja VTEX: 50 por página, sem precisar do link da página 2
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

// ---------- Plano B: lojas Salesforce (Demandware), ex.: L'Occitane ----------
// Essas lojas não trazem o bloco JSON-LD, mas cada cartão de produto tem data-pid e um
// data-gtmobject com nome e preço. Usado só quando o JSON-LD não acha nada.
const MARCAS: Record<string, string> = { acute: '\u0301', grave: '\u0300', circ: '\u0302', tilde: '\u0303', uml: '\u0308', cedil: '\u0327' };
function decodificar(t: string): string {
  return String(t || '')
    .replace(/&([A-Za-z])(acute|grave|circ|tilde|uml|cedil);/g, (_, l, m) => l + MARCAS[m])
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .normalize('NFC');
}

function extrairCartoesSalesforce(html: string, base: string): { produtos: ProdutoLido[]; total: number } {
  const produtos: ProdutoLido[] = [];
  const vistos = new Set<string>();
  const re = /<div class="(product(?: [^"]*)?)" data-pid="([^"]+)"/g;
  const marcas = [...html.matchAll(re)];
  for (let i = 0; i < marcas.length; i++) {
    const classe = marcas[i][1], pid = marcas[i][2];
    if (/best-seller|recommend|carousel/i.test(classe) || vistos.has(pid)) continue;
    const ini = marcas[i].index ?? 0;
    const fim = i + 1 < marcas.length ? (marcas[i + 1].index ?? html.length) : Math.min(html.length, ini + 30000);
    const bloco = html.slice(ini, Math.max(fim, ini + 200));
    let nome = '', preco = 0;
    const g = bloco.match(/data-gtmobject="([^"]+)"/);
    if (g) {
      try {
        const it = JSON.parse(decodificar(g[1]))?.ecommerce?.items?.[0];
        nome = String(it?.name || '');
        preco = Number(it?.price) || 0;
      } catch { /* cartão diferente: tenta abaixo */ }
    }
    if (!preco) { const c = bloco.match(/class="[^"]*\bvalue\b[^"]*"[^>]*content="([\d.]+)"/); if (c) preco = Number(c[1]) || 0; }
    if (!nome) { const a = bloco.match(/class="[^"]*(?:pdp-link|product-name|link)[^"]*"[^>]*>\s*([^<]{3,})</); if (a) nome = a[1]; }
    const h = bloco.match(/href="([^"#]+?\.html)/);
    const im = bloco.match(/<img[^>]+?(?:data-src|src)="([^"]+)"/);
    if (!nome || !preco || !h) continue;
    let url = '', imagem = '';
    try { url = new URL(decodificar(h[1]), base).href; } catch { continue; }
    try { imagem = im ? new URL(decodificar(im[1]), base).href : ''; } catch {}
    vistos.add(pid);
    produtos.push({ nome: decodificar(nome).trim().slice(0, 160), preco, imagem, url, sku: pid, esgotado: false });
  }
  return { produtos, total: marcas.length };
}

// Botão "Ver mais" das lojas Salesforce: devolve o endereço da próxima página (ou null)
export function proximaPaginaSalesforce(html: string): string | null {
  const m = html.match(/<button[^>]*class="[^"]*\bmore\b[^"]*"[^>]*data-url="([^"]+start=\d+[^"]*)"/i)
    || html.match(/data-url="([^"]*Search-UpdateGrid[^"]*start=[1-9]\d*[^"]*)"/i);
  return m ? decodificar(m[1]) : null;
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
  // sem JSON-LD de produto: tenta os cartões das lojas Salesforce
  if (achados.length === 0) {
    const sf = extrairCartoesSalesforce(html, base);
    if (sf.produtos.length) return { produtos: sf.produtos, semPreco: 0, esgotados: 0, semLink: 0, totalBlocos: sf.total };
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
// ---------- Feed XML da rede de afiliados (Google Shopping / RSS ou YML) ----------
// Quando o link é um feed (ex.: Actionpay .../yml/yml3033.xml?key=...), lê todos os produtos de uma vez.
export function ehFeed(txt: string): boolean {
  const ini = txt.slice(0, 3000);
  return /^\s*(<\?xml|<rss|<yml_catalog|<feed)/i.test(ini) || (/<(item|offer)[\s>]/i.test(ini) && /<(g:)?price>/i.test(txt.slice(0, 20000)));
}

function textoTag(bloco: string, nomes: string[]): string {
  for (const n of nomes) {
    const m = bloco.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i'));
    if (m) {
      const v = m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
      if (v) return decodificar(v);
    }
  }
  return '';
}

function numeroDoPreco(t: string): number {
  const m = String(t || '').match(/\d[\d.,]*/);
  if (!m) return 0;
  let s = m[0];
  if (s.includes(',') && s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.'); // 1.299,90
  else s = s.replace(/,/g, '');                                                                              // 1,299.90
  return Number(s) || 0;
}

export function lerFeed(xml: string, base: string, avisos: string[]): Resultado {
  const blocos = [...xml.matchAll(/<(item|entry|offer)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi)];
  if (!blocos.length) return { status: 'sem-dados', mensagem: 'O feed abriu, mas não tem produtos.', avisos };
  const todos = new Map<string, ProdutoLido>();
  let semPreco = 0, esgotados = 0;
  for (const b of blocos.slice(0, 3000)) {
    const attrs = b[2] || '', bloco = b[3];
    const nome = textoTag(bloco, ['title', 'g:title', 'name', 'model']);
    let url = textoTag(bloco, ['link', 'g:link', 'url']);
    try { url = url ? new URL(url, base).href : ''; } catch { url = ''; }
    if (!nome || !url) continue;
    const promo = numeroDoPreco(textoTag(bloco, ['g:sale_price', 'sale_price']));
    const cheio = numeroDoPreco(textoTag(bloco, ['g:price', 'price']));
    const preco = promo && (!cheio || promo < cheio) ? promo : cheio;
    if (!preco) { semPreco++; continue; }
    const disp = textoTag(bloco, ['g:availability', 'availability']);
    const esgotado = /out.of.stock|esgotad|indispon|discontinued/i.test(disp) || /available\s*=\s*["']false/i.test(attrs);
    if (esgotado) esgotados++;
    const imagem = textoTag(bloco, ['g:image_link', 'image_link', 'picture', 'image']);
    const marca = textoTag(bloco, ['g:brand', 'brand', 'vendor']) || undefined;
    const sku = textoTag(bloco, ['g:id', 'id']) || (attrs.match(/\bid\s*=\s*["']([^"']+)/i)?.[1]) || undefined;
    if (!todos.has(url)) todos.set(url, { nome: nome.slice(0, 160), preco, imagem, url, marca, sku, esgotado });
  }
  const produtos = [...todos.values()];
  if (!produtos.length) return { status: 'sem-dados', mensagem: 'O feed abriu, mas nenhum produto tinha nome, link e preço.', avisos };
  avisos.push(`Feed XML: ${produtos.length} produtos lidos de uma vez (não precisa de página 2).`);
  if (blocos.length > 3000) avisos.push(`O feed tem ${blocos.length} produtos: li os 3.000 primeiros.`);
  if (esgotados) avisos.push(`${esgotados} esgotados na loja (vêm desmarcados).`);
  if (semPreco) avisos.push(`${semPreco} sem preço (pulados).`);
  return { status: 'ok', produtos, paginasLidas: 1, avisos };
}

// ---------- Lojas VTEX (ex.: Livrarias Curitiba): API pública de catálogo ----------
// Link no formato https://loja.com.br/api/catalog_system/pub/products/search/caminho/da/categoria?map=c,c,c
// A API devolve até 50 produtos por pedido; a página N vira _from/_to.
export const ehVtex = (u: string) => /\/api\/catalog_system\/pub\/products\/search/i.test(u);

export function paginaVtex(pag1: string, n: number): string {
  // tira _from/_to que já existam e põe os da página n (sem mexer no resto do link)
  let s = pag1.trim().replace(/[?&]_(from|to)=\d+/gi, '');
  if (!s.includes('?') && s.includes('&')) s = s.replace('&', '?');
  return `${s}${s.includes('?') ? '&' : '?'}_from=${(n - 1) * 50}&_to=${n * 50 - 1}`;
}

export function extrairVtex(txt: string, base: string) {
  let lista: any[];
  try { lista = JSON.parse(txt); } catch {
    return { produtos: [] as ProdutoLido[], semPreco: 0, esgotados: 0, semLink: 0, totalBlocos: 0, erro: 'A loja não devolveu a lista de produtos (o link da API está certo?).' };
  }
  if (!Array.isArray(lista)) return { produtos: [] as ProdutoLido[], semPreco: 0, esgotados: 0, semLink: 0, totalBlocos: 0, erro: 'Resposta inesperada da loja.' };
  let semPreco = 0, esgotados = 0, semLink = 0;
  const produtos: ProdutoLido[] = [];
  const origem = (() => { try { return new URL(base).origin; } catch { return ''; } })();
  for (const p of lista) {
    const item = p?.items?.[0];
    const vendedores: any[] = item?.sellers || [];
    const of = (vendedores.find(s => s?.sellerDefault) || vendedores[0])?.commertialOffer || {};
    let url = String(p?.link || '');
    if (!url && p?.linkText && origem) url = `${origem}/${p.linkText}/p`;
    try { url = url ? new URL(url, base).href : ''; } catch { url = ''; }
    if (!url) { semLink++; continue; }
    const preco = Number(of.Price) || 0;
    if (!preco) { semPreco++; continue; }
    const esgotado = of.IsAvailable === false || !(Number(of.AvailableQuantity) > 0);
    if (esgotado) esgotados++;
    produtos.push({
      nome: String(p?.productName || '').trim().slice(0, 160),
      preco,
      imagem: String(item?.images?.[0]?.imageUrl || ''),
      url,
      marca: p?.brand || undefined,
      sku: p?.productId ? String(p.productId) : undefined,
      esgotado,
    });
  }
  return { produtos, semPreco, esgotados, semLink, totalBlocos: lista.length, erro: '' };
}


export async function lerCategoria(pag1: string, pag2: string, paginas: number): Promise<Resultado> {
  const avisos: string[] = [];
  const todos = new Map<string, ProdutoLido>();
  let lidas = 0;
  const n = Math.min(Math.max(paginas, 1), 5);

  let proximaAuto: string | null = null; // "Ver mais" das lojas Salesforce, quando não há link da página 2
  for (let i = 1; i <= n; i++) {
    const end = (!pag2 && i > 1 && proximaAuto) ? proximaAuto : enderecoDaPagina(pag1, pag2, i);
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
    // link de feed (XML da rede de afiliados): lê tudo de uma vez, sem páginas
    if (i === 1 && ehFeed(html)) return lerFeed(html, end, avisos);
    const vtex = ehVtex(end) ? extrairVtex(html, end) : null;
    if (vtex?.erro) {
      if (i === 1) return { status: 'erro', mensagem: vtex.erro, avisos };
      avisos.push(`Página ${i}: ${vtex.erro}`); break;
    }
    if (vtex && i > 1 && vtex.totalBlocos === 0) { avisos.push(`A categoria acabou na página ${i - 1}.`); break; }
    const { produtos, semPreco, esgotados, semLink, totalBlocos } = vtex || extrairProdutos(html, end);
    proximaAuto = proximaPaginaSalesforce(html);
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
