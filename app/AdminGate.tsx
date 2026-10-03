'use client';

import { useState, useEffect, ReactNode } from 'react';

// Envolve qualquer página de admin: só mostra o conteúdo depois do login.
export default function AdminGate({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetch('/api/editorial/auth/check')
      .then(r => r.json())
      .then(d => setAuth(!!d.ok))
      .catch(() => setAuth(false));
  }, []);

  // marca este navegador como do admin: a /ir não conta os cliques dele
  useEffect(() => {
    if (auth) { try { localStorage.setItem('comlupa:admin', '1'); } catch {} }
  }, [auth]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch('/api/editorial/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: senha }),
      });
      if (res.ok) setAuth(true);
      else setErro('Senha incorreta.');
    } catch {
      setErro('Erro ao verificar.');
    } finally {
      setCarregando(false);
    }
  }

  if (auth === null) {
    return <main style={{ padding: '40px', fontFamily: 'system-ui', color: '#6b7280' }}>Verificando acesso...</main>;
  }

  if (auth) return <>{children}</>;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', borderTop: '5px solid #5B3E96' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{titulo}</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 28px' }}>Área restrita</p>
        <form onSubmit={entrar}>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            autoFocus
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box' }}
          />
          {erro && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0 0 10px' }}>{erro}</p>}
          <button
            type="submit"
            disabled={carregando}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#5B3E96', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            {carregando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
