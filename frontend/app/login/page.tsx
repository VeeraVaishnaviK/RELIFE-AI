"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, ArrowRight, UserCheck } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "admin", email: "admin@relife.ai", pass: "Admin@123", label: "Admin" },
  { role: "inspector", email: "inspector@relife.ai", pass: "Inspector@123", label: "Inspector" },
  { role: "reseller", email: "reseller@relife.ai", pass: "Reseller@123", label: "Reseller" },
  { role: "customer", email: "customer@relife.ai", pass: "Customer@123", label: "Customer" },
  { role: "repair_partner", email: "repair@relife.ai", pass: "Repair@123", label: "Repair Partner" },
  { role: "recycler", email: "recycler@relife.ai", pass: "Recycler@123", label: "Recycler" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("admin@relife.ai");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await endpoints.login({ email, password });
      const { access_token, user } = res.data;
      setAuth(user, access_token);

      // Route by role
      const routes: Record<string, string> = {
        admin: "/admin/dashboard",
        inspector: "/inspector/products/new",
        reseller: "/reseller/marketplace",
        customer: "/store",
        repair_partner: "/repair-partner/jobs",
        recycler: "/recycler/marketplace",
      };
      router.push(routes[user.role] || "/admin/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((e: any) => e.msg || JSON.stringify(e)).join("; ") : "Invalid email or password credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const prefill = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left Branding Side */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-emerald-950/40 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
              ♻
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">ReLife AI</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Judge & Enterprise Demo Environment</span>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight">
            Intelligent Circular Economy Decision Platform
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            From automated visual defect detection to dynamic 5-pathway optimization and component reverse auctions — sign in to access your role workspace.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          FastAPI Backend • Motor / Beanie ODM • YOLOv8 Computer Vision
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex flex-col justify-center p-8 md:p-16 max-w-md mx-auto w-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Sign In to ReLife AI
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials or click any demo role below for 1-click access.
          </p>
        </div>

        {/* Demo Fast-Login Pills for Judges */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quick-Fill Test Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => prefill(acc)}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  email === acc.email
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button type="submit" size="lg" className="w-full font-bold" isLoading={loading}>
            Sign In to Workspace <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
            Register as a partner or buyer
          </Link>
        </div>
      </div>
    </div>
  );
}
