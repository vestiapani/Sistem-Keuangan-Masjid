"use client";

import React, { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { ProfileProvider } from "@/context/ProfileContext";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProfileProvider>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />

          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
            {children}
          </div>
        </main>

        <Toaster
          position="top-right"
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!bg-white/20 !backdrop-blur-sm !border !border-white/20 !shadow-sm !rounded-xl !",
              closeButton:
                "!absolute !top-4 !right-1 !left-auto !bg-white/50 !border-0 !rounded-full !text-slate-500 hover:!text-slate-800",
            },
          }}
        />
      </div>
    </ProfileProvider>
  );
}
