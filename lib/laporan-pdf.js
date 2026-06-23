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
  const bulanTahun = now.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const tanggalCetak = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatRp = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n ?? 0);

  // =========================================================
  // HEADER
  // =========================================================
  // Kotak header hijau
  doc.setFillColor(15, 76, 58); // #0F4C3A
  doc.rect(0, 0, 210, 35, "F");

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("LAPORAN KEUANGAN MASJID", 105, 14, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Masjid Al-Ikhlas — Transparan & Amanah", 105, 22, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.setTextColor(180, 220, 210);
  doc.text(`Dicetak pada: ${tanggalCetak}`, 105, 30, { align: "center" });

  // =========================================================
  // RINGKASAN KEUANGAN
  // =========================================================
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Keuangan", 14, 46);

  // Tiga kotak ringkasan
  const boxes = [
    {
      label: "Total Pemasukan",
      value: formatRp(totalMasuk),
      color: [220, 252, 231],
    },
    {
      label: "Total Pengeluaran",
      value: formatRp(totalKeluar),
      color: [254, 226, 226],
    },
    {
      label: "Saldo Akhir",
      value: formatRp(saldo),
      color: [209, 250, 229],
      bold: true,
    },
  ];

  boxes.forEach((box, i) => {
    const x = 14 + i * 62;
    doc.setFillColor(...box.color);
    doc.roundedRect(x, 50, 58, 22, 2, 2, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(box.label, x + 4, 57);
    doc.setFontSize(10);
    doc.setFont("helvetica", box.bold ? "bold" : "bold");
    doc.setTextColor(
      box.bold ? 15 : 30,
      box.bold ? 76 : 30,
      box.bold ? 58 : 30,
    );
    doc.text(box.value, x + 4, 66, { maxWidth: 50 });
  });

  // =========================================================
  // TABEL TRANSAKSI
  // =========================================================
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Rincian Transaksi", 14, 84);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Menampilkan ${transaksi.length} transaksi terverifikasi`, 14, 89);

  const tableRows = transaksi.map((t) => [
    t.tanggal,
    t.tipe === "masuk" ? "Pemasukan" : "Pengeluaran",
    t.kategori,
    t.keterangan?.length > 40 ? t.keterangan.slice(0, 40) + "…" : t.keterangan,
    t.tipe === "masuk" ? formatRp(t.jumlah) : "",
    t.tipe === "keluar" ? formatRp(t.jumlah) : "",
  ]);

  autoTable(doc, {
    startY: 92,
    head: [
      ["Tanggal", "Tipe", "Kategori", "Keterangan", "Pemasukan", "Pengeluaran"],
    ],
    body: tableRows,
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      lineColor: [230, 230, 230],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 76, 58],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 22 },
      3: { cellWidth: 65 },
      4: { cellWidth: 28, halign: "right", textColor: [5, 120, 60] },
      5: { cellWidth: 28, halign: "right", textColor: [200, 30, 30] },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: (hookData) => {
      // Footer setiap halaman
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Halaman ${hookData.pageNumber} dari ${pageCount} — Masjid Al-Ikhlas`,
        105,
        290,
        { align: "center" },
      );
    },
  });

  // =========================================================
  // FOOTER TERAKHIR
  // =========================================================
  const finalY = doc.lastAutoTable?.finalY ?? 240;
  if (finalY < 260) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Laporan ini dibuat secara otomatis dari sistem informasi keuangan Masjid Al-Ikhlas.",
      14,
      finalY + 8,
    );
    doc.text(
      "Untuk informasi lebih lanjut, hubungi bendahara masjid.",
      14,
      finalY + 13,
    );
  }

  // Simpan file
  const fileName = `laporan-keuangan-masjid-${now.toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
