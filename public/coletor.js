// public/coletor.js — Coletor Com a Lupa: lê lojas que bloqueiam o servidor (403), pelo seu navegador.
// Uso: abra a página de categoria da loja, F12 > Console, cole tudo e Enter. Depois cole a lista em /admin/importar.
(async () => {
  const MAX_PAGINAS = 60;
  const fala = (t) => console.log('%c' + t, 'font-size:14px;font-weight:bold;color:#5B3E96');
  const limpa = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const abs = (u) => { try { return u ? new URL(u, location.origin).href : ''; } catch (e) { return ''; } };
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---- Leitor VNDA (ex.: Cristais Cá d'Oro) ----
  function lerVnda(doc, html) {
    const caixas = doc.querySelectorAll('[data-product-box]');
    if (!caixas.length) return null;
    const precos = {};
    const m = html.match(/dataLayer\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/);
    if (m) {
      try {
        JSON.parse(m[1]).forEach((ev) => ((ev.ecommerce || {}).items || []).forEach((it) => {
          precos[String(it.item_id)] = { preco: Number(it.price) || 0, nome: it.item_name };
        }));
      } catch (e) {}
    }
    const out = [];
    caixas.forEach((c) => {
      const id = c.getAttribute('data-product-box');
      const a = c.querySelector('a.name-product.-active') || c.querySelector('.name a') || c.querySelector('a[href*="/produto/"]');
      const img = c.querySelector('a.link.-active img') || c.querySelector('img');
      let imagem = '';
      if (img) {
        const ss = img.getAttribute('data-srcset') || img.getAttribute('srcset') || '';
        const urls = ss.split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean);
        imagem = urls[urls.length - 1] || img.getAttribute('data-src') || img.getAttribute('src') || '';
      }
      const cor = c.querySelector('.colors.-active[data-available]') || c.querySelector('[data-product-id="' + id + '"][data-available]');
      const p = precos[id] || {};
      out.push({
        nome: limpa(a && a.textContent) || p.nome || '',
        url: abs(a && a.getAttribute('href')),
        imagem: abs(imagem),
        preco: p.preco || 0,
        esgotado: cor ? cor.getAttribute('data-available') === 'false' : false,
      });
    });
    return { plataforma: 'vnda', produtos: out };
  }

  const LEITORES = [lerVnda]; // outras plataformas bloqueadas entram aqui

  function ler(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    for (const f of LEITORES) { const r = f(doc, html); if (r) return r; }
    return null;
  }

  const origem = new URL(location.href);
  origem.searchParams.delete('page'); origem.hash = '';
  const enderecoPag = (n) => { const u = new URL(origem.href); if (n > 1) u.searchParams.set('page', String(n)); return u.href; };
  const total = Math.min((window._pagination && window._pagination.totalPages) || MAX_PAGINAS, MAX_PAGINAS);

  const vistos = new Map();
  let plataforma = '';
  let lidas = 0;
  for (let n = 1; n <= total; n++) {
    let html = '';
    try {
      const r = await fetch(enderecoPag(n), { credentials: 'include' });
      if (!r.ok) { fala('⚠️ Página ' + n + ' respondeu ' + r.status + '. Parei aqui.'); break; }
      html = await r.text();
    } catch (e) { fala('⚠️ Erro ao abrir a página ' + n + '. Parei aqui.'); break; }
    const lido = ler(html);
    if (!lido) {
      if (n === 1) { fala('❌ Não reconheci os produtos desta loja. Mande o código da página para o Claude.'); return; }
      break;
    }
    plataforma = lido.plataforma;
    let novos = 0;
    lido.produtos.forEach((p) => { if (p.url && p.nome && !vistos.has(p.url)) { vistos.set(p.url, p); novos++; } });
    console.log('Página ' + n + ' de ' + total + ' · ' + vistos.size + ' produtos');
    if (!novos) break; // acabou a categoria
    lidas = n;
    await espera(400);
  }

  const produtos = [...vistos.values()];
  const meta = document.querySelector('meta[property="og:site_name"]');
  const saida = JSON.stringify({
    coletor: 'comlupa', versao: 1, plataforma,
    loja: limpa(meta && meta.getAttribute('content')) || location.hostname.replace(/^www\./, ''),
    origem: origem.href, paginasLidas: lidas, coletadoEm: new Date().toISOString(), produtos,
  });

  // caixa na página com o botão de copiar (o clique garante a cópia)
  const caixa = document.createElement('div');
  caixa.style.cssText = 'position:fixed;z-index:2147483647;top:20px;right:20px;background:#fff;border:3px solid #5B3E96;border-radius:14px;padding:18px 20px;font:15px system-ui;box-shadow:0 10px 30px rgba(0,0,0,.25);max-width:320px;color:#111';
  const esgotados = produtos.filter((p) => p.esgotado).length;
  caixa.innerHTML = '<div style="font-weight:800;font-size:17px;margin-bottom:6px">🔍 Coletor Com a Lupa</div>'
    + '<div>' + produtos.length + ' produtos (' + esgotados + ' esgotados)</div>'
    + '<button style="margin-top:12px;padding:10px 16px;border:0;border-radius:9px;background:#5B3E96;color:#fff;font-weight:700;cursor:pointer;font-size:14px">📋 Copiar lista</button>'
    + '<button style="margin:12px 0 0 8px;padding:10px 12px;border:1px solid #ccc;border-radius:9px;background:#fff;cursor:pointer;font-size:14px">Fechar</button>'
    + '<div data-ok style="margin-top:10px;color:#047857;font-weight:700"></div>';
  const [bCopiar, bFechar] = caixa.querySelectorAll('button');
  const ok = caixa.querySelector('[data-ok]');
  bCopiar.onclick = async () => {
    try { await navigator.clipboard.writeText(saida); ok.textContent = '✅ Copiado! Agora cole em /admin/importar.'; }
    catch (e) { ok.textContent = 'Não consegui copiar. Tente de novo.'; }
  };
  bFechar.onclick = () => caixa.remove();
  document.body.appendChild(caixa);
  window.__coletorComLupa = saida;
  fala('✅ ' + produtos.length + ' produtos lidos. Clique em "📋 Copiar lista" na caixa roxa da página.');
})();
