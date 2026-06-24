"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  Landmark,
} from "lucide-react";
import { getInfoMasjid } from "@/lib/publik";

/**
 * InfoMasjidPublik — tampilkan data info masjid dari DB di halaman publik.
 * Bisa dipakai di beranda, laporan keuangan, atau halaman about.
 *
 * Usage:
 *   import InfoMasjidPublik from "@/components/publik/InfoMasjidPublik";
 *   <InfoMasjidPublik />
 */
export default function InfoMasjidPublik() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInfoMasjid()
      .then((data) => setInfo(data))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  // Jika tidak ada data sama sekali, jangan render section
  if (!loading && !info) return null;

  const items = loading
    ? []
    : [
        info.alamat && {
          icon: MapPin,
          label: "Alamat",
          value: info.alamat,
          href: info.alamat
            ? `https://maps.google.com/?q=${encodeURIComponent(info.alamat)}`
            : null,
        },
        info.telepon && {
          icon: Phone,
          label: "Telepon",
          value: info.telepon,
          href: `tel:${info.telepon}`,
        },
        info.email_masjid && {
          icon: Mail,
          label: "Email",
          value: info.email_masjid,
          href: `mailto:${info.email_masjid}`,
        },
        info.website && {
          icon: Globe,
          label: "Website",
          value: info.website.replace(/^https?:\/\//, ""),
          href: info.website,
        },
        info.kapasitas && {
          icon: Users,
          label: "Kapasitas",
          value: `${Number(info.kapasitas).toLocaleString("id-ID")} jamaah`,
          href: null,
        },
        info.tahun_berdiri && {
          icon: Calendar,
          label: "Berdiri",
          value: `Tahun ${info.tahun_berdiri}`,
          href: null,
        },
      ].filter(Boolean);

  // Tidak ada field yang diisi → sembunyikan
  if (!loading && items.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark size={18} className="text-[#0F4C3A]" />
            <span className="text-xs font-semibold text-[#0F4C3A] uppercase tracking-wide">
              Informasi Masjid
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Tentang Kami
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ icon: Icon, label, value, href }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#0F4C3A]/8 rounded-lg shrink-0">
                  <Icon size={16} className="text-[#0F4C3A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-slate-800 hover:text-[#0F4C3A] transition-colors break-words"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 break-words">
                      {value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
