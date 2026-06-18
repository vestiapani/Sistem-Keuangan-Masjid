"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />

        <div className="flex-1 overflow-auto p-8 relative">{children}</div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
