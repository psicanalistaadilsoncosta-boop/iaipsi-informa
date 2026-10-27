'use client';
// app/compalavra/VideoYouTube.tsx — vídeo do YouTube que só carrega ao clicar (a página continua leve)
import { useState } from 'react';

export default function VideoYouTube({ id, titulo, rotulo }: { id: string; titulo: string; rotulo: string }) {
  const [tocando, setTocando] = useState(false);
  return (
    <div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', marginBottom: 8 }}>{rotulo}</div>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
        {tocando ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <button type="button" onClick={() => setTocando(true)} aria-label={`Assistir: ${titulo}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: 0, border: 0, cursor: 'pointer',
              background: `#000 url(https://i.ytimg.com/vi/${id}/hqdefault.jpg) center/cover no-repeat` }}>
            <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 68, height: 48, borderRadius: 12,
              backgroundColor: 'rgba(220,38,38,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 0, height: 0, borderLeft: '18px solid #fff', borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: 4 }} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}