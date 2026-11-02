"use client";

import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuthStore } from "@/store/authStore";

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const { loadFromStorage, setAuth } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
    // Default fallback to Admin if none selected yet
    const storedToken = localStorage.getItem("relife_token");
    if (!storedToken) {
      setAuth(
        {
          id: "admin_seed",
          name: "Alice Admin",
          email: "admin@relife.ai",
          role: "admin",
          reliability_score: 100.0,
        },
        "seed_token"
      );
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F1F3F6] text-slate-900 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
