import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.informa_KV_REST_API_URL,
  token: process.env.informa_KV_REST_API_TOKEN,
});

const arr = (await kv.get('produtos:pinados')) || [];
const comMomento = arr.filter(x => x.momento);
console.log('Total:', arr.length, '| Com momento:', comMomento.length);
if (comMomento.length > 0) console.log('Exemplo:', JSON.stringify(comMomento[0], null, 2));