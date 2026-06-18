"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

export default function ExportPdfButton({
  periode,
  totalMasuk,
  totalKeluar,
  surplus,
  rows,
}) {
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Laporan Keuangan Masjid", 14, 20);

    doc.setFontSize(11);
    doc.text(`Periode: ${periode}`, 14, 30);

    doc.text(
      `Total Pemasukan: Rp ${totalMasuk.toLocaleString("id-ID")}`,
      14,
      40,
    );

    doc.text(
      `Total Pengeluaran: Rp ${totalKeluar.toLocaleString("id-ID")}`,
      14,
      48,
    );

    doc.text(
      `Surplus / Defisit: Rp ${surplus.toLocaleString("id-ID")}`,
      14,
      56,
    );

    autoTable(doc, {
      startY: 65,
      head: [["Tanggal", "Keterangan", "Pemasukan", "Pengeluaran"]],
      body: rows.map((row) => [
        row.tanggal,
        row.deskripsi,
        row.pemasukan ? row.pemasukan.toLocaleString("id-ID") : "-",
        row.pengeluaran ? row.pengeluaran.toLocaleString("id-ID") : "-",
      ]),
    });

    doc.save(`laporan-keuangan-${periode.replace(/\s+/g, "-")}.pdf`);
  };

  return <Button onClick={exportPDF} className="bg-[#0F4C3A] hover:bg-[#0A3629] text-white flex items-center justify-center space-x-2 py-2.5 rounded-md font-medium text-sm transition-colors">Export PDF</Button>;
}
