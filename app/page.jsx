import { redirect } from "next/navigation";

export default function HomePage() {
  // Mengalihkan pengunjung dari root (/) langsung ke halaman dashboard
  redirect("/beranda");
}