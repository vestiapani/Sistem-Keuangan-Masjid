"use client";

import React, { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
