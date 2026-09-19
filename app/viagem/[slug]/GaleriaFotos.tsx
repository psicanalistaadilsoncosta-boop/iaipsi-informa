'use client';
import { useState } from 'react';

export default function GaleriaFotos({ imagem, gallery, titulo }: { imagem: string; gallery: string[]; titulo: string }) {
  const todasImagens = [imagem, ...gallery.filter(g => g !== imagem)].filter(Boolean);
  const [ativa, setAtiva] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '100%', maxWidth: '420px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {todasImagens[ativa]
          ? <img src={todasImagens[ativa]} alt={titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '3rem' }}>🌍</span>
        }
      </div>
      {todasImagens.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {todasImagens.map((img, i) => (
            <button key={i} onClick={() => setAtiva(i)} style={{ width: '56px', height: '56px', borderRadius: '6px', border: `2px solid ${ativa === i ? '#0f766e' : '#e5e7eb'}`, backgroundColor: '#f1f5f9', cursor: 'pointer', padding: '2px', overflow: 'hidden' }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
