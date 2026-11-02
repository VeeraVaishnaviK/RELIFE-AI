"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, UserProfile } from "@/store/authStore";
import { useMessageStore } from "@/store/messageStore";
import {
  Bell,
  LogOut,
  Shield,
  Award,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Mail,
  Share2,
  Check,
  MessageSquare,
  X,
  ExternalLink
} from "lucide-react";

const DEMO_ROLES: { role: UserProfile["role"]; name: string; email: string }[] = [
  { role: "admin", name: "Alice Admin", email: "admin@relife.ai" },
  { role: "inspector", name: "Bob Inspector", email: "inspector@relife.ai" },
  { role: "reseller", name: "CyberTech Resellers", email: "reseller@relife.ai" },
  { role: "customer", name: "Priya Sharma", email: "customer@relife.ai" },
  { role: "repair_partner", name: "Apex Fix Services", email: "repair@relife.ai" },
  { role: "recycler", name: "EcoRefine Recyclers", email: "recycler@relife.ai" },
];

export const Topbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth, logout } = useAuthStore();
  const { messages, markAllRead, loadMessages } = useMessageStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const unreadCount = messages.filter((m) => m.unread).length;

  // Compute clean breadcrumb
  const getBreadcrumbTitle = () => {
    if (!pathname) return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Overview";
    const last = segments[segments.length - 1];
    return last
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const switchRole = (item: typeof DEMO_ROLES[0]) => {
    setAuth(
      {
        id: `mock_${item.role}`,
        name: item.name,
        email: item.email,
        role: item.role,
        reliability_score: item.role === "reseller" ? 96.5 : 100.0,
      },
      "demo_token"
    );
    setShowRoleMenu(false);

    // Redirect to matching role dashboard
    const redirects: Record<string, string> = {
      admin: "/admin/dashboard",
      inspector: "/inspector/products/new",
      reseller: "/reseller/marketplace",
      customer: "/store",
      repair_partner: "/repair-partner/jobs",
      recycler: "/recycler/marketplace",
    };
    router.push(redirects[item.role] || "/admin/dashboard");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="h-18 bg-white border-b border-slate-200/70 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      {/* Breadcrumb Navigation with Back/Forward buttons */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.back()}
            title="Go back"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => router.forward()}
            title="Go forward"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="text-slate-500">ReLife AI</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Right Actions: Utility Icons, User Profile & Emerald Persona Switcher */}
      <div className="flex items-center gap-3">
        {/* API Status */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-[#F4F5F7] border border-slate-200/60 px-3 py-1.5 rounded-xl font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>API: <strong className="text-slate-700">Online</strong></span>
        </div>

        {/* Circular Utility Buttons */}
        <div className="hidden md:flex items-center gap-1.5 relative">
          <button
            title="Help"
            onClick={() => router.push("/roi-calculator")}
            className="w-8 h-8 rounded-full border border-slate-200/70 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* In-App Messages / Partner Dispatch Inbox */}
          <div className="relative">
            <button
              title="Application Messages & Partner Inquiries"
              onClick={() => {
                setShowMessages(!showMessages);
                if (!showMessages) markAllRead();
              }}
              className="relative w-8 h-8 rounded-full border border-slate-200/70 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* In-App Messages Dropdown Drawer */}
            {showMessages && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 text-slate-900">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Application Messages ({messages.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setShowMessages(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {messages.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No dispatched partner messages yet.
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{m.partnerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mb-1">
                          Re: {m.productName} ({m.pathway})
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                          {m.messageText}
                        </p>
                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Ref: {m.id}</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            title="Notifications"
            className="relative w-8 h-8 rounded-full border border-slate-200/70 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* User Avatar with Profile Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/70">
          <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || "Demo User"}
            </div>
            <div className="text-[10px] text-slate-400 capitalize font-medium">
              {user?.role ? user.role.replace("_", " ") : "Admin"}
            </div>
          </div>
        </div>

        {/* Switch Persona / Share Emerald Pill Button */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="bg-[#0C5A3E] hover:bg-[#094731] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Switch Persona</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Persona (Judging Demo)
              </div>
              {DEMO_ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => switchRole(r)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    user?.role === r.role
                      ? "bg-[#0C5A3E]/10 text-[#0C5A3E] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="capitalize">{r.role.replace("_", " ")}</div>
                    <div className="text-[10px] text-slate-400">{r.name}</div>
                  </div>
                  {user?.role === r.role && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0C5A3E]"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
