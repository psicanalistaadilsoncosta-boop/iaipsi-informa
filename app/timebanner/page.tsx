import MonitorBanner from "@/components/MonitorBanner";

export default function TimeBannerPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <MonitorBanner
          monitorSrc="/essemonitor.png"
          imagens={[
            "/banner1.jpg",
            "/banner2.jpg",
            "/banner3.jpg",
          ]}
          intervalo={1000}
        />
      </div>

      <p className="mt-8 text-neutral-500 text-sm font-mono tracking-widest uppercase animate-pulse">
        ⚡ Conexão estabelecida com sucesso ⚡
      </p>
    </main>
  );
}