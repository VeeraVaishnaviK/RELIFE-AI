"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  ScanLine,
  Layers,
  ShoppingBag,
  Gavel,
  Calculator,
  RotateCcw,
  Wrench,
  Recycle,
  BarChart3,
  FileSearch,
  CheckCircle2,
  Store,
  ShieldCheck,
  Package,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const role = user?.role || "admin";

  // Role-specific navigation items (All strictly preserved)
  const getNavSections = () => {
    switch (role) {
      case "inspector":
        return [
          {
            title: "MAIN MENU",
            links: [
              { label: "Overview", href: "/inspector/dashboard", icon: LayoutDashboard },
              { label: "New Inspection", href: "/inspector/products/new", icon: ScanLine },
            ],
          },
          {
            title: "OPERATIONS",
            links: [
              { label: "Products Registry", href: "/inspector/products", icon: Package, badge: "18" },
              { label: "Review Queue", href: "/inspector/review-queue", icon: FileSearch, badge: "3" },
            ],
          },
        ];
      case "reseller":
        return [
          {
            title: "MAIN MENU",
            links: [
              { label: "Reseller Dashboard", href: "/reseller/dashboard", icon: LayoutDashboard },
              { label: "Component Marketplace", href: "/reseller/marketplace", icon: Gavel, badge: "Live" },
            ],
          },
          {
            title: "OPERATIONS",
            links: [
              { label: "My Allocations", href: "/reseller/allocations", icon: CheckCircle2 },
              { label: "Pre-Demand Enquiries", href: "/reseller/enquiries", icon: ShoppingBag, badge: "12" },
            ],
          },
        ];
      case "customer":
        return [
          {
            title: "MAIN MENU",
            links: [
              { label: "Storefront", href: "/store", icon: Store },
              { label: "Device Trade-In", href: "/store/trade-in", icon: RotateCcw },
            ],
          },
          {
            title: "OPERATIONS",
            links: [
              { label: "My Allocations", href: "/customer/allocations", icon: CheckCircle2 },
              { label: "ROI Calculator", href: "/roi-calculator", icon: Calculator },
            ],
          },
        ];
      case "repair_partner":
        return [
          {
            title: "MAIN MENU",
            links: [
              { label: "Repair Dashboard", href: "/repair-partner/dashboard", icon: LayoutDashboard },
              { label: "Assigned Jobs", href: "/repair-partner/jobs", icon: Wrench, badge: "5" },
            ],
          },
          {
            title: "OPERATIONS",
            links: [
              { label: "Parts Catalog", href: "/repair-partner/parts", icon: Layers },
            ],
          },
        ];
      case "recycler":
        return [
          {
            title: "MAIN MENU",
            links: [
              { label: "Recycler Dashboard", href: "/recycler/dashboard", icon: LayoutDashboard },
              { label: "Scrap & Auctions", href: "/recycler/marketplace", icon: Recycle, badge: "Hot" },
            ],
          },
          {
            title: "OPERATIONS",
            links: [
              { label: "Circularity Metrics", href: "/recycler/environmental", icon: BarChart3 },
            ],
          },
        ];
      case "admin":
      default:
        return [
          {
            title: "MAIN MENU",
            links: [
              { label: "Executive Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
              { label: "Product Inventory", href: "/admin/products", icon: Package, badge: "18" },
              { label: "Decision Engine", href: "/admin/decisions", icon: Layers, badge: "AI" },
              { label: "Human Review Queue", href: "/admin/review-queue", icon: FileSearch, badge: "3" },
            ],
          },
          {
            title: "FEATURES & IMPACT",
            links: [
              { label: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
              { label: "Circularity Impact", href: "/admin/analytics/environmental", icon: ShieldCheck },
              { label: "Reverse Auctions", href: "/admin/auctions", icon: Gavel },
              { label: "Storefront Preview", href: "/store", icon: Store },
              { label: "ROI Calculator", href: "/roi-calculator", icon: Calculator },
            ],
          },
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/70 flex flex-col shrink-0 h-screen sticky top-0 z-20 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="h-18 flex items-center px-6 gap-3 pt-2">
        {/* Brand Green Logo Mark */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0C5A3E] to-[#12724F] flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-1.5 leading-tight">
            <span>ReLife AI</span>
          </div>
          <div className="text-[10px] font-semibold tracking-wide text-slate-400 capitalize">
            {role.replace("_", " ")} Workspace
          </div>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between bg-[#F4F5F7] hover:bg-[#EEF0F3] transition-colors rounded-xl px-3 py-2 text-xs border border-transparent focus-within:border-slate-300 focus-within:bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 w-24"
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-white/80 border border-slate-200/80 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-5 custom-scroll">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              {section.title}
            </div>
            {section.links
              .filter((link) =>
                searchQuery
                  ? link.label.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              )
              .map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/admin/dashboard" &&
                    link.href !== "/inspector/dashboard" &&
                    link.href !== "/reseller/dashboard" &&
                    pathname?.startsWith(`${link.href}/`));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#18181B] text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-slate-400"
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600 border border-slate-200/60"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>
        ))}

        {/* GENERAL SECTION */}
        <div className="space-y-1 pt-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
            GENERAL
          </div>
          <Link
            href="/roi-calculator"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help Desk</span>
          </a>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 transition-all text-left"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Log out</span>
          </button>
        </div>
      </nav>

      {/* Bottom Promo / Circular Status Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-[#FAF8F5] border border-[#EDE7DD] rounded-2xl p-3.5 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
            <span>Circular Loop Active</span>
            <span className="text-amber-500">🔥</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed mb-3">
            Real-time multi-pathway zero-waste engine.
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/roi-calculator"
              className="bg-[#0C5A3E] hover:bg-[#094731] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>Explore ROI</span>
            </Link>
            <span className="text-[11px] font-medium text-slate-600">v2.0 Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
