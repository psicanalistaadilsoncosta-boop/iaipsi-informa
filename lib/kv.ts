import { Redis } from '@upstash/redis';

export const kv = new Redis({
  url: process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL || '',
  token: process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || '',
});