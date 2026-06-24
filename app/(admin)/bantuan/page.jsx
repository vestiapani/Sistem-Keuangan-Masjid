"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Search,
  WalletCards,
  CreditCard,
  FileBox,
  Shield,
  CalendarDays,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";

// ─── Data Bantuan ─────────────────────────────────────────────────
const KATEGORI = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "bg-slate-100 text-slate-600",
    artikel: [
      {
        pertanyaan: "Apa yang ditampilkan di halaman Dashboard?",
        jawaban:
          "Dashboard menampilkan ringkasan keuangan masjid untuk periode yang dipilih: total saldo kas keseluruhan, total donasi masuk, dan total pengeluaran pada bulan berjalan. Di bawahnya terdapat grafik tren arus kas 6 bulan terakhir, daftar 5 transaksi terkini, serta aktivitas notifikasi terbaru.",
        link: null,
      },
      {
        pertanyaan: "Bagaimana cara mengganti periode yang ditampilkan?",
        jawaban:
          "Di pojok kanan atas halaman Dashboard terdapat dropdown pilihan periode (bulan dan tahun). Pilih periode yang diinginkan — data ringkasan, transaksi, dan grafik akan otomatis diperbarui sesuai pilihan.",
        link: null,
      },
      {
        pertanyaan: "Kenapa angka di Dashboard berbeda dengan yang di Laporan?",
        jawaban:
          "Dashboard menghitung saldo dari seluruh transaksi (semua waktu), sedangkan kartu Donasi dan Pengeluaran di Dashboard hanya menampilkan total untuk periode bulan yang dipilih. Laporan Keuangan juga menggunakan filter periode yang sama. Pastikan periode yang dipilih di kedua halaman sama agar angkanya sesuai.",
        link: null,
      },
    ],
  },
  {
    id: "donasi",
    label: "Donasi Masuk",
    icon: WalletCards,
    color: "bg-emerald-50 text-emerald-700",
    artikel: [
      {
        pertanyaan: "Bagaimana cara mencatat donasi baru?",
        jawaban:
          'Buka menu "Donasi Masuk" di sidebar, lalu klik tombol hijau "Tambah Donasi" di pojok kanan atas. Isi formulir: nama donatur (boleh dikosongkan untuk Hamba Allah), pilih kategori (Zakat / Infak / Sedekah / Wakaf), masukkan nominal, pilih metode pembayaran, lalu klik "Simpan Donasi". Donasi yang dicatat lewat sini langsung berstatus terverifikasi dan masuk ke laporan.',
        link: { label: "Buka Donasi Masuk", href: "/donasi" },
      },
      {
        pertanyaan: "Apa perbedaan donasi dari admin dan donasi dari jamaah?",
        jawaban:
          'Donasi yang dicatat admin lewat menu "Donasi Masuk" langsung berstatus verified dan masuk ke laporan keuangan. Donasi yang dikirim jamaah lewat halaman publik "Konfirmasi Donasi" berstatus pending — harus diverifikasi dulu oleh admin di menu Verifikasi Donasi sebelum masuk ke laporan.',
        link: { label: "Buka Verifikasi Donasi", href: "/verifikasi" },
      },
      {
        pertanyaan: "Bagaimana cara mengedit atau menghapus donasi?",
        jawaban:
          'Untuk mengedit atau menghapus donasi, buka menu "Laporan Keuangan" di sidebar. Di tabel rincian transaksi, setiap baris memiliki ikon pensil (edit nominal) dan ikon tempat sampah (hapus). Konfirmasi sebelum menghapus karena tindakan ini tidak bisa dibatalkan.',
        link: { label: "Buka Laporan", href: "/laporan" },
      },
    ],
  },
  {
    id: "verifikasi",
    label: "Verifikasi Donasi",
    icon: Shield,
    color: "bg-amber-50 text-amber-700",
    artikel: [
      {
        pertanyaan: "Bagaimana cara memverifikasi donasi dari jamaah?",
        jawaban:
          'Buka menu "Verifikasi Donasi". Pastikan tab "Menunggu" aktif untuk melihat donasi yang belum diproses. Klik ikon centang hijau untuk memverifikasi, atau ikon silang merah untuk menolak. Sebuah konfirmasi akan muncul sebelum tindakan dieksekusi. Setelah diverifikasi, donasi otomatis masuk ke laporan keuangan.',
        link: { label: "Buka Verifikasi", href: "/verifikasi" },
      },
      {
        pertanyaan:
          "Bagaimana cara melihat bukti transfer yang dikirim jamaah?",
        jawaban:
          'Di halaman Verifikasi Donasi, pada kolom "Bukti" klik tautan "Lihat bukti" untuk membuka preview gambar atau PDF yang diupload jamaah. Anda juga dapat membukanya di tab baru untuk melihat lebih jelas sebelum memutuskan untuk memverifikasi atau menolak.',
        link: null,
      },
      {
        pertanyaan: "Apakah donasi yang ditolak bisa dipulihkan?",
        jawaban:
          'Donasi yang ditolak tidak otomatis terhapus — statusnya berubah menjadi "Ditolak" dan masih bisa dilihat di tab "Ditolak" pada halaman Verifikasi. Namun untuk memverifikasinya, Anda perlu meminta jamaah mengirim ulang konfirmasi donasi lewat halaman publik.',
        link: null,
      },
    ],
  },
  {
    id: "pengeluaran",
    label: "Pengeluaran Kas",
    icon: CreditCard,
    color: "bg-rose-50 text-rose-700",
    artikel: [
      {
        pertanyaan: "Bagaimana cara mencatat pengeluaran?",
        jawaban:
          'Buka menu "Pengeluaran Kas" di sidebar. Isi tanggal transaksi, pilih kategori (Operasional, Pemeliharaan, Kegiatan, atau Insentif), tuliskan keperluan secara rinci, masukkan nominal, dan opsional upload bukti nota atau kwitansi. Klik "Simpan Pengeluaran" untuk menyimpan. Pengeluaran yang disimpan langsung masuk ke laporan dan mempengaruhi saldo kas.',
        link: { label: "Buka Pengeluaran", href: "/pengeluaran" },
      },
      {
        pertanyaan: "Format file apa yang diterima untuk bukti pengeluaran?",
        jawaban:
          "Sistem menerima file bukti dalam format JPG, PNG, dan PDF dengan ukuran maksimal yang disesuaikan. Disarankan untuk mengupload foto nota atau kwitansi yang jelas dan terbaca agar memudahkan audit keuangan di kemudian hari.",
        link: null,
      },
      {
        pertanyaan: "Bagaimana cara mengedit nominal pengeluaran yang salah?",
        jawaban:
          'Pengeluaran yang sudah disimpan dapat diedit nominalnya melalui menu "Laporan Keuangan". Di tabel rincian transaksi, gunakan filter "Pengeluaran", lalu klik ikon pensil pada baris yang ingin diubah. Masukkan nominal yang benar pada kotak yang muncul.',
        link: { label: "Buka Laporan", href: "/laporan" },
      },
    ],
  },
  {
    id: "laporan",
    label: "Laporan Keuangan",
    icon: FileBox,
    color: "bg-blue-50 text-blue-700",
    artikel: [
      {
        pertanyaan: "Bagaimana cara mencetak atau mengekspor laporan?",
        jawaban:
          'Buka menu "Laporan Keuangan" dan pilih periode bulan yang diinginkan dari dropdown di pojok kanan atas. Klik tombol "Export PDF" untuk mengunduh laporan dalam format PDF yang sudah terformat rapi, berisi ringkasan keuangan dan tabel rincian transaksi.',
        link: { label: "Buka Laporan", href: "/laporan" },
      },
      {
        pertanyaan: "Apa fungsi tombol Simpan Laporan?",
        jawaban:
          'Tombol "Simpan Laporan" menyimpan snapshot ringkasan keuangan (total masuk, total keluar, surplus/defisit) untuk periode yang dipilih ke database. Ini berguna untuk arsip bulanan dan audit internal. Data yang disimpan tidak memengaruhi catatan transaksi yang ada.',
        link: null,
      },
      {
        pertanyaan: "Bagaimana cara memfilter transaksi di laporan?",
        jawaban:
          'Di halaman Laporan Keuangan terdapat dropdown filter di kanan atas tabel. Pilih "Semua" untuk melihat seluruh transaksi, "Pemasukan" untuk donasi saja, atau "Pengeluaran" untuk pengeluaran kas saja. Filter ini tidak memengaruhi angka ringkasan di kartu atas.',
        link: null,
      },
    ],
  },
  {
    id: "kegiatan",
    label: "Manajemen Kegiatan",
    icon: CalendarDays,
    color: "bg-purple-50 text-purple-700",
    artikel: [
      {
        pertanyaan: "Bagaimana cara menambah kegiatan baru?",
        jawaban:
          'Buka menu "Manajemen Kegiatan" dan klik tombol "Tambah Kegiatan". Isi judul, deskripsi singkat, pilih kategori (Kajian, Sosial, Edukasi, atau Remaja), tentukan tanggal dan waktu, lokasi, serta kuota peserta jika diperlukan. Anda juga dapat menambahkan URL gambar untuk tampilan visual di halaman publik. Klik "Tambah Kegiatan" untuk menyimpan.',
        link: { label: "Buka Manajemen Kegiatan", href: "/admin_kegiatan" },
      },
      {
        pertanyaan: "Bagaimana cara mengubah status kegiatan menjadi selesai?",
        jawaban:
          'Di halaman Manajemen Kegiatan, klik ikon pensil pada kegiatan yang ingin diubah. Di formulir edit, ubah field "Status" dari "aktif" menjadi "selesai". Klik "Simpan Perubahan". Kegiatan yang berstatus selesai akan tampil di bagian "Sudah Selesai" pada halaman publik dengan tampilan yang lebih redup.',
        link: null,
      },
      {
        pertanyaan: "Apakah kegiatan yang dihapus bisa dikembalikan?",
        jawaban:
          'Tidak. Penghapusan kegiatan bersifat permanen dan tidak dapat dibatalkan. Jika kegiatan hanya perlu disembunyikan dari publik tanpa dihapus, sebaiknya ubah statusnya menjadi "dibatalkan" — kegiatan tetap ada di database namun tidak aktif.',
        link: null,
      },
    ],
  },
];

// ─── Komponen Accordion ───────────────────────────────────────────
function ArtikelItem({ artikel, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800 leading-snug">
          {artikel.pertanyaan}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 mt-0.5 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            {artikel.jawaban}
          </p>
          {artikel.link && (
            <Link
              href={artikel.link.href}
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#0F4C3A] hover:underline"
            >
              {artikel.link.label}
              <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────
export default function BantuanPage() {
  const [search, setSearch] = useState("");
  const [activeKategori, setActiveKategori] = useState("semua");

  // Filter artikel berdasarkan search & kategori
  const filteredKategori = useMemo(() => {
    const q = search.trim().toLowerCase();

    return KATEGORI.map((kat) => {
      const artikel = kat.artikel.filter((a) => {
        const matchSearch =
          !q ||
          a.pertanyaan.toLowerCase().includes(q) ||
          a.jawaban.toLowerCase().includes(q);
        const matchKat =
          activeKategori === "semua" || activeKategori === kat.id;
        return matchSearch && matchKat;
      });
      return { ...kat, artikel };
    }).filter((kat) => kat.artikel.length > 0);
  }, [search, activeKategori]);

  const totalHasil = filteredKategori.reduce(
    (sum, k) => sum + k.artikel.length,
    0,
  );

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Pusat Bantuan</h3>
        <p className="text-sm text-slate-500 mt-1">
          Panduan penggunaan Sistem Informasi Keuangan Masjid.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari panduan, misal: cara verifikasi donasi..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#0F4C3A]/20 focus:border-[#0F4C3A] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Filter Kategori */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveKategori("semua")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
            activeKategori === "semua"
              ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua
        </button>
        {KATEGORI.map((kat) => (
          <button
            key={kat.id}
            onClick={() =>
              setActiveKategori(activeKategori === kat.id ? "semua" : kat.id)
            }
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              activeKategori === kat.id
                ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <kat.icon size={12} />
            {kat.label}
          </button>
        ))}
      </div>

      {/* Hasil pencarian info */}
      {search && (
        <p className="text-xs text-slate-400">
          {totalHasil === 0
            ? `Tidak ada hasil untuk "${search}"`
            : `${totalHasil} artikel ditemukan untuk "${search}"`}
        </p>
      )}

      {/* Konten */}
      {filteredKategori.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm">
            Panduan yang Anda cari tidak ditemukan.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveKategori("semua");
            }}
            className="mt-3 text-xs text-[#0F4C3A] font-semibold hover:underline"
          >
            Tampilkan semua panduan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredKategori.map((kat) => (
            <div
              key={kat.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Header kategori */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                <span className={`p-2 rounded-lg ${kat.color}`}>
                  <kat.icon size={15} />
                </span>
                <div className="flex items-center justify-between flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {kat.label}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {kat.artikel.length} artikel
                  </span>
                </div>
              </div>

              {/* Daftar artikel */}
              <div>
                {kat.artikel.map((artikel, idx) => (
                  <ArtikelItem
                    key={idx}
                    artikel={artikel}
                    defaultOpen={
                      search.trim() !== "" && kat.artikel.length === 1
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div className="bg-[#0F4C3A]/5 border border-[#0F4C3A]/15 rounded-xl px-6 py-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-[#0F4C3A] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <FileBox size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Panduan tidak tersedia untuk topik Anda?
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Periksa kembali langkah-langkah yang tersedia di atas, atau coba
            eksplorasi langsung fitur yang ingin Anda gunakan.
          </p>
        </div>
      </div>
    </div>
  );
}
