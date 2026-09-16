const url = 'https://www.vivavinho.com.br/vinho-branco-portugues-pedro-e-ines-doc-750ml/p';

const res = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9',
  },
});

const html = await res.text();
console.log('Status:', res.status);
console.log('Tamanho:', html.length);
console.log('Tem JSON-LD?', html.includes('application/ld+json'));
console.log('Tem "139"?', html.includes('139'));

const matches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
console.log('JSON-LD encontrados:', matches?.length || 0);
if (matches) {
  matches.forEach((m, i) => {
    console.log(`\n--- JSON-LD ${i} ---`);
    console.log(m.substring(0, 800));
  });
}