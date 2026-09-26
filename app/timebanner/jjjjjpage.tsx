import Image from 'next/image';

export default function TimesSquareBanner() {
  const images = {
    painelPrincipal: "/banner-1.jpg", 
    painelLateral: "/lateral.png",     
  };

  return (
    <main className="w-full min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 overflow-hidden">
      
      {/* Container Principal com tamanho controlado */}
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* 1. LETREIRO DE TOPO (Travado para não estourar a largura da página) */}
        <div className="w-full bg-black border-b border-yellow-500/20 text-yellow-400 font-mono text-xs py-2 uppercase tracking-widest overflow-hidden relative block">
          <div className="animate-marquee whitespace-nowrap inline-flex gap-8 will-change-transform">
            <span>⚡ COMPILADO NO SERVIDOR • HOSPEDADO NA VERCEL • PERFORMANCE MÁXIMA • CORE WEB VITALS 100% ⚡</span>
            <span>⚡ COMPILADO NO SERVIDOR • HOSPEDADO NA VERCEL • PERFORMANCE MÁXIMA • CORE WEB VITALS 100% ⚡</span>
          </div>
        </div>

        {/* 2. GRID DE PAINÉIS (Tamanhos definidos de forma rígida para evitar distorção) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
          
          {/* PAINEL CENTRAL / HERO */}
          <div className="relative md:col-span-2 h-[260px] md:h-[350px] border border-cyan-500/30 rounded-lg overflow-hidden group shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className="absolute inset-0 bg-cyan-950/10 z-10 mix-blend-color pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] z-20 pointer-events-none" />
            
            <Image 
              src={images.painelPrincipal}
              alt="Painel Principal"
              fill
              sizes="(max-w-768px) 100vw, 66vw"
              priority 
              className="object-cover brightness-90 contrast-125 transition-transform duration-700 group-hover:scale-103"
            />
            
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 z-30 flex flex-col justify-end h-full">
              <span className="text-cyan-400 text-[10px] font-mono tracking-widest uppercase mb-1">Destaque da Semana</span>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-tight">
                Velocidade Extrema <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Com Next.js</span>
              </h1>
            </div>
          </div>

          {/* PAINEL DIREITO / VERTICAL */}
          <div className="relative h-[200px] md:h-[350px] border border-pink-500/30 rounded-lg overflow-hidden group shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <div className="absolute inset-0 bg-purple-950/10 z-10 mix-blend-color pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] z-20 pointer-events-none" />
            
            <Image 
              src={images.painelLateral}
              alt="Painel Lateral"
              fill
              sizes="(max-w-768px) 100vw, 33vw"
              className="object-cover brightness-50 contrast-125 transition-transform duration-700 group-hover:scale-103"
            />

            <div className="absolute inset-0 p-5 z-30 flex flex-col justify-between bg-black/40">
              <div className="flex justify-between items-center">
                <span className="text-pink-500 text-[10px] font-mono font-bold tracking-widest uppercase animate-pulse">● LIVE BROADCAST</span>
                <span className="text-neutral-400 text-[9px] font-mono">NYC-04</span>
              </div>
              
              <div>
                <h2 className="text-lg font-black uppercase text-white tracking-wide leading-tight drop-shadow-[0_2px_10px_rgba(244,63,94,0.4)]">
                  Interface <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Ultraveloz</span>
                </h2>
                <p className="text-neutral-400 text-[11px] mt-2 font-light">Zero imagens pesadas, 100% focado na experiência.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
