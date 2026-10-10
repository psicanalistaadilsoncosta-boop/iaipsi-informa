// app/api/audios/upload/route.ts — autoriza o navegador do admin a enviar a gravação direto para o Blob.
// O arquivo não passa pelo servidor (a Vercel limita o corpo a ~4,5 MB; gravações passam disso).
import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const TIPOS = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm'];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const resposta = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname: string) => {
        if (!isAdmin(req)) throw new Error('não autorizado');
        if (!pathname.startsWith('audios/')) throw new Error('caminho inválido');
        return { allowedContentTypes: TIPOS, maximumSizeInBytes: 60 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => { /* o admin avisa a rota /api/audios logo em seguida */ },
    });
    return NextResponse.json(resposta);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 400 });
  }
}
