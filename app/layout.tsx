export const metadata = {
  title: 'IAIPSI Informa',
  description: 'Portal de Informações IAIPSI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}