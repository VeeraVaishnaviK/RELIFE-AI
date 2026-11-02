"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, ShoppingBag, Store, Wrench, Recycle } from "lucide-react";

const ROLES = [
  { id: "reseller", title: "Reseller / B2B", icon: ShoppingBag, desc: "Purchase certified devices & bulk lots" },
  { id: "customer", title: "Consumer", icon: Store, desc: "Buy refurbished devices & trade-in old tech" },
  { id: "repair_partner", title: "Repair Service", icon: Wrench, desc: "Receive dispatch jobs & buy OEM parts" },
  { id: "recycler", title: "Recycler", icon: Recycle, desc: "Bid on raw scrap & e-waste lots" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reseller");
  const [phone, setPhone] = useState("+91 ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await endpoints.register({ name, email, password, role, phone });
      const { access_token, user } = res.data;
      setAuth(user, access_token);
      router.push(role === "reseller" ? "/reseller/marketplace" : "/store");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((e: any) => e.msg || JSON.stringify(e)).join("; ") : "Registration failed. Try another email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-6 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-base">
              ♻
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">ReLife AI</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Partner or Buyer Account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join the automated circular economy ecosystem
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-emerald-700" : "text-slate-400"}`} />
                    <div className="text-sm font-bold text-slate-900">{r.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name / Company"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Apex Refurbishing Ltd."
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="operations@company.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a strong password"
          />

          <Button type="submit" size="lg" className="w-full font-bold" isLoading={loading}>
            Create Account <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
