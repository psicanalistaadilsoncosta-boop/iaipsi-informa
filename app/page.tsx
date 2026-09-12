export default function Home() {
  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#1e3a8a', fontSize: '2.5rem' }}>IAIPSI Informa</h1>
      <p style={{ color: '#475569', fontSize: '1.2rem', marginTop: '10px' }}>
        Seja bem-vindo ao portal de informações e publicações da IAIPSI.
      </p>
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
        <p style={{ color: '#0f172a', fontWeight: 'bold' }}>Status: Aplicação rodando com sucesso no Next.js!</p>
      </div>
    </main>
  );
}