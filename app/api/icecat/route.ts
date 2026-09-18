import { NextRequest, NextResponse } from 'next/server';

const USERNAME = process.env.ICECAT_USERNAME || '';
const APP_KEY = process.env.ICECAT_APP_KEY || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gtin = searchParams.get('gtin') || '';
  const nome = searchParams.get('nome') || '';
  const marca = searchParams.get('marca') || '';

  if (!gtin && !nome) {
    return NextResponse.json({ error: 'Informe gtin ou nome' }, { status: 400 });
  }

  try {
    let url = '';
    if (gtin) {
      url = `https://live.icecat.biz/api/?UserName=${USERNAME}&app_key=${APP_KEY}&Language=pt&GTIN=${gtin}`;
    } else {
      url = `https://live.icecat.biz/api/?UserName=${USERNAME}&app_key=${APP_KEY}&Language=pt&Brand=${encodeURIComponent(marca)}&ProductName=${encodeURIComponent(nome)}`;
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    if (!data.data) {
      return NextResponse.json({ error: 'Produto não encontrado no Icecat' }, { status: 404 });
    }

    const d = data.data;
    const info = d.GeneralInfo;
    const img = d.Image;
    const gallery = d.Gallery || [];
    const features = d.FeaturesGroups || [];

    // Mapeia specs em formato legível
    const specs: Record<string, { grupo: string; itens: { nome: string; valor: string }[] }> = {};
    for (const grupo of features) {
      const nomeGrupo = grupo.FeatureGroup?.Name?.Value || 'Geral';
      specs[nomeGrupo] = {
        grupo: nomeGrupo,
        itens: (grupo.Features || []).map((f: any) => ({
          nome: f.Feature?.Name?.Value || '',
          valor: f.LocalValue || f.PresentationValue || '',
        })).filter((f: any) => f.nome && f.valor),
      };
    }

    return NextResponse.json({
      icecatId: info.IcecatId,
      titulo: info.Title,
      marca: info.Brand,
      marcaLogo: info.BrandLogo,
      categoria: info.Category?.Name?.Value || '',
      gtin: info.GTIN?.[0] || gtin,
      descricaoLonga: info.SummaryDescription?.LongSummaryDescription || '',
      descricaoCurta: info.SummaryDescription?.ShortSummaryDescription || '',
      bulletPoints: info.GeneratedBulletPoints?.Values || [],
      imagem: img?.HighPic || img?.Pic500x500 || '',
      imagemMedia: img?.Pic500x500 || '',
      gallery: gallery.slice(0, 6).map((g: any) => g.Pic500x500 || g.Pic || '').filter(Boolean),
      specs,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}