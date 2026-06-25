/**
 * lib/laporan-pdf.js
 * Generate laporan keuangan PDF dari data Supabase (bukan link statis).
 * Menggunakan jsPDF + jspdf-autotable yang sudah ada di package.json.
 */

export async function generateLaporanPDF({
  totalMasuk,
  totalKeluar,
  saldo,
  transaksi,
}) {
  // Dynamic import untuk menghindari SSR error
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const now = new Date();
  const tanggalCetak = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatRp = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n ?? 0);

  // =========================================================
  // HEADER BANNER
  // =========================================================
  doc.setFillColor(15, 76, 58); // Warna tema utama masjid #0F4C3A
  doc.rect(0, 0, 210, 36, "F");

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("LAPORAN KEUANGAN MASJID", 105, 14, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Masjid At-Taqwa — Transparan & Amanah", 105, 22, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.setTextColor(180, 220, 210);
  doc.text(`Dicetak pada: ${tanggalCetak}`, 105, 30, { align: "center" });

  // =========================================================
  // RINGKASAN KEUANGAN (SUMMARY BOXES)
  // =========================================================
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Keuangan", 14, 48);

  const boxes = [
    {
      label: "TOTAL PEMASUKAN",
      value: formatRp(totalMasuk),
      bgColor: [240, 253, 244], // emerald-50
      textColor: [21, 128, 61], // emerald-700
    },
    {
      label: "TOTAL PENGELUARAN",
      value: formatRp(totalKeluar),
      bgColor: [255, 241, 242], // rose-50
      textColor: [190, 24, 74], // rose-700
    },
    {
      label: "SALDO AKHIR KAS",
      value: formatRp(saldo),
      bgColor: [15, 76, 58], // #0F4C3A tema utama
      textColor: [255, 255, 255], // Teks putih agar kontras
      bold: true,
    },
  ];

  boxes.forEach((box, i) => {
    const x = 14 + i * 62;
    // Gambar background kotak
    doc.setFillColor(...box.bgColor);
    doc.roundedRect(x, 52, 58, 22, 2.5, 2.5, "F");

    // Label Kotak
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(box.bold ? [200, 235, 220] : [100, 116, 139]));
    doc.text(box.label, x + 4, 59);

    // Nominal Angka
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...box.textColor);
    doc.text(box.value, x + 4, 68, { maxWidth: 50 });
  });

  // =========================================================
  // TABEL TRANSAKSI
  // =========================================================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Rincian Transaksi", 14, 86);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-400
  doc.text(`Menampilkan ${transaksi.length} transaksi terverifikasi`, 14, 91);

  // Map baris data tanpa merusak / memotong teks keterangan asli
  const tableRows = transaksi.map((t) => [
    t.tanggal,
    t.tipe === "masuk" ? "Pemasukan" : "Pengeluaran",
    t.kategori ? t.kategori.toUpperCase() : "UMUM",
    t.keterangan || "—",
    t.tipe === "masuk" ? `+ ${formatRp(t.jumlah)}` : "",
    t.tipe === "keluar" ? `- ${formatRp(t.jumlah)}` : "",
  ]);

  autoTable(doc, {
    startY: 94,
    head: [
      [
        "Tanggal",
        "Tipe",
        "Kategori",
        "Keterangan / Deskripsi",
        "Pemasukan",
        "Pengeluaran",
      ],
    ],
    body: tableRows,
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [51, 65, 85], // slate-700
      lineColor: [241, 245, 249], // slate-100
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 76, 58],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 24, halign: "center" }, // Tanggal
      1: { cellWidth: 22, halign: "center" }, // Tipe
      2: { cellWidth: 24, halign: "center" }, // Kategori
      3: { cellWidth: 58 }, // Keterangan (otomatis melakukan wrap text kebawah jika panjang)
      4: {
        cellWidth: 29,
        halign: "right",
        fontStyle: "bold",
        textColor: [21, 128, 61],
      }, // Pemasukan (Hijau)
      5: {
        cellWidth: 29,
        halign: "right",
        fontStyle: "bold",
        textColor: [190, 24, 74],
      }, // Pengeluaran (Merah)
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
    didDrawPage: (hookData) => {
      // Perhitungan jumlah halaman total secara dinamis
      const totalPages = doc.internal.pages.length - 1;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Halaman ${hookData.pageNumber} dari ${totalPages} — Laporan Transparansi Keuangan Masjid At-taqwa`,
        105,
        288,
        { align: "center" },
      );
    },
  });

  // =========================================================
  // FOOTER CATATAN SISTEM (DIPOSISIKAN SETELAH TABEL BERAKHIR)
  // =========================================================
  const finalY = doc.lastAutoTable?.finalY ?? 240;

  // Periksa sisa ruang di dasar kertas agar catatan tidak terpotong margin bawah
  if (finalY < 265) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Laporan ini dibuat secara otomatis melalui Sistem Informasi Manajemen Keuangan Terpadu Masjid At-Taqwa.",
      14,
      finalY + 10,
    );
    doc.text(
      "Setiap rincian transaksi di atas bersifat transparan, akuntabel, dan telah diverifikasi oleh dewan pengurus bendahara masjid.",
      14,
      finalY + 14,
    );
  }

  // Simpan file laporan otomatis ke komputer user
  const fileName = `laporan-keuangan-masjid-At-Taqwa${now.toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
