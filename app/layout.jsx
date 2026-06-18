import "./globals.css";

export const metadata = {
  title: "Sistem Keuangan Masjid",
  description: "Aplikasi pencatatan keuangan untuk transparansi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}