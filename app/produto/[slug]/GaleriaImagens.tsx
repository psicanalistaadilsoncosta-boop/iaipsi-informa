'use client';
import { useState } from 'react';

export default function GaleriaImagens({ imagem, gallery, titulo }: { imagem: string; gallery: string[]; titulo: string }) {
  const todasImagens = [imagem, ...gallery.filter(g => g !== imagem)].filter(Boolean);
  const [ativa, setAtiva] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '100%', maxWidth: '300px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', padding: '16px' }}>
        <img src={todasImagens[ativa]} alt={titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>
      {todasImagens.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {todasImagens.map((img, i) => (
            <button key={i} onClick={() => setAtiva(i)} style={{ width: '52px', height: '52px', borderRadius: '6px', border: `2px solid ${ativa === i ? '#2563eb' : '#e5e7eb'}`, backgroundColor: '#fff', cursor: 'pointer', padding: '3px', overflow: 'hidden' }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}