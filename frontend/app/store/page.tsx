"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  Store,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Bell,
  Search,
  Cpu,
  Layers,
  ChevronRight,
  Wrench,
  Battery,
} from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  category: "laptop" | "smartphone" | "tablet";
  brand: string;
  price: number;
  originalPrice: number;
  condition: "Pristine Grade A" | "Certified Refurbished" | "Good Condition";
  trustScore: number;
  image: string;
  specs: string;
  co2Saved: number;
  passport: {
    origin: string;
    inspectionDate: string;
    defectsFixed: string[];
    batteryHealth: number;
    warrantyMonths: number;
  };
}

const DEMO_STORE_ITEMS: StoreItem[] = [
  {
    id: "prod-1",
    name: "MacBook Pro 14\" M1 Pro (16GB RAM, 512GB SSD)",
    category: "laptop",
    brand: "Apple",
    price: 94500,
    originalPrice: 194900,
    condition: "Certified Refurbished",
    trustScore: 94,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    specs: "Space Grey • 8-Core CPU, 14-Core GPU • Liquid Retina XDR",
    co2Saved: 208.8,
    passport: {
      origin: "Corporate Lease Return (Clean Audit)",
      inspectionDate: "2024-10-18",
      defectsFixed: ["Replaced keyboard keycap", "Cleaned internal fans", "Thermal paste refreshed"],
      batteryHealth: 92,
      warrantyMonths: 12,
    },
  },
  {
    id: "prod-2",
    name: "ThinkPad X1 Carbon Gen 10 (i7-1260P, 16GB, 1TB)",
    category: "laptop",
    brand: "Lenovo",
    price: 68000,
    originalPrice: 142000,
    condition: "Pristine Grade A",
    trustScore: 96,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    specs: "Deep Black • 14\" WUXGA IPS • Intel Iris Xe • 1.12kg",
    co2Saved: 215.4,
    passport: {
      origin: "B2B Tech Fleet Rotation",
      inspectionDate: "2024-10-22",
      defectsFixed: ["Zero hardware faults detected", "Ultrasonic casing clean"],
      batteryHealth: 96,
      warrantyMonths: 12,
    },
  },
  {
    id: "prod-3",
    name: "iPhone 13 Pro 128GB - Sierra Blue",
    category: "smartphone",
    brand: "Apple",
    price: 49999,
    originalPrice: 119900,
    condition: "Pristine Grade A",
    trustScore: 91,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80",
    specs: "Super Retina XDR with ProMotion • Ceramic Shield • A15 Bionic",
    co2Saved: 68.4,
    passport: {
      origin: "Consumer 14-Day E-Commerce Return",
      inspectionDate: "2024-10-25",
      defectsFixed: ["Polished hairline frame blemish", "100% genuine screen verified"],
      batteryHealth: 89,
      warrantyMonths: 6,
    },
  },
  {
    id: "prod-4",
    name: "Dell XPS 13 9310 (i7 11th Gen, 16GB RAM, 512GB)",
    category: "laptop",
    brand: "Dell",
    price: 52000,
    originalPrice: 115000,
    condition: "Good Condition",
    trustScore: 88,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
    specs: "Platinum Silver • 13.4\" FHD+ InfinityEdge • CNC Aluminum",
    co2Saved: 198.0,
    passport: {
      origin: "Enterprise Fleet Upgrade",
      inspectionDate: "2024-10-15",
      defectsFixed: ["Fresh high-capacity battery installed", "Re-pasted CPU heatsink"],
      batteryHealth: 99,
      warrantyMonths: 12,
    },
  },
  {
    id: "prod-5",
    name: "Samsung Galaxy S22 Ultra 5G (12GB / 256GB)",
    category: "smartphone",
    brand: "Samsung",
    price: 44500,
    originalPrice: 109999,
    condition: "Certified Refurbished",
    trustScore: 89,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
    specs: "Phantom Black • S-Pen Integrated • Dynamic AMOLED 2X",
    co2Saved: 74.2,
    passport: {
      origin: "Telecom Operator Upgrade Intake",
      inspectionDate: "2024-10-19",
      defectsFixed: ["Replaced back glass cover with OEM original", "Camera modules re-calibrated"],
      batteryHealth: 91,
      warrantyMonths: 6,
    },
  },
  {
    id: "prod-6",
    name: "iPad Air 5th Gen (M1, 64GB Wi-Fi, Space Gray)",
    category: "tablet",
    brand: "Apple",
    price: 36500,
    originalPrice: 59900,
    condition: "Pristine Grade A",
    trustScore: 95,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
    specs: "10.9\" Liquid Retina • Apple M1 Chip • Touch ID Top Button",
    co2Saved: 88.5,
    passport: {
      origin: "Education Device Return",
      inspectionDate: "2024-10-24",
      defectsFixed: ["Zero scratches found", "Digitizer response 100% calibrated"],
      batteryHealth: 97,
      warrantyMonths: 12,
    },
  },
];

export default function StorefrontPage() {
  const { success } = useToast();
  const [items] = useState<StoreItem[]>(DEMO_STORE_ITEMS);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<StoreItem | null>(null);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (conditionFilter !== "all" && item.condition !== conditionFilter) return false;
    return true;
  });

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    success(
      `You're on the priority allocation list! We'll alert ${notifyEmail} when new matching units drop.`,
      "Alert Registered"
    );
    setNotifyModalOpen(false);
    setNotifyEmail("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
                ♻
              </div>
              <div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">ReLife AI</span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Certified Store
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 ml-4">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`transition-colors ${categoryFilter === "all" ? "text-emerald-600 font-bold" : "hover:text-slate-900"}`}
              >
                All Tech
              </button>
              <button
                onClick={() => setCategoryFilter("laptop")}
                className={`transition-colors ${categoryFilter === "laptop" ? "text-emerald-600 font-bold" : "hover:text-slate-900"}`}
              >
                Laptops
              </button>
              <button
                onClick={() => setCategoryFilter("smartphone")}
                className={`transition-colors ${categoryFilter === "smartphone" ? "text-emerald-600 font-bold" : "hover:text-slate-900"}`}
              >
                Smartphones
              </button>
              <button
                onClick={() => setCategoryFilter("tablet")}
                className={`transition-colors ${categoryFilter === "tablet" ? "text-emerald-600 font-bold" : "hover:text-slate-900"}`}
              >
                Tablets
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/store/trade-in">
              <Button variant="outline" size="sm" className="font-bold text-xs border-emerald-300 text-emerald-800 bg-emerald-50/50">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Trade-In Your Device
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="text-xs font-bold">
                Partner Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Diagnostic Verification • 12-Month Guarantee</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Refurbished Electronics with Cryptographic Provenance
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                Every unit features an immutable Digital Recovery Passport with AI defect scans,
                original parts provenance, and verified avoided carbon footprint.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setNotifyModalOpen(true)}
              className="font-bold shrink-0"
            >
              <Bell className="w-4 h-4 mr-2 text-emerald-600" />
              Set Stock Alerts
            </Button>
          </div>
        </div>
      </div>

      {/* Main Catalog with Filters Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" /> Filter Store
                </h3>
                <button
                  onClick={() => {
                    setCategoryFilter("all");
                    setConditionFilter("all");
                  }}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Reset
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Category
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: "all", label: "All Categories" },
                    { id: "laptop", label: "Laptops & Ultrabooks" },
                    { id: "smartphone", label: "Smartphones" },
                    { id: "tablet", label: "Tablets & iPads" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
                        categoryFilter === cat.id
                          ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Grade */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Condition Tier
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: "all", label: "Any Certified Grade" },
                    { id: "Pristine Grade A", label: "Pristine Grade A (Like New)" },
                    { id: "Certified Refurbished", label: "Certified Refurbished" },
                    { id: "Good Condition", label: "Good Condition (Value)" },
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      onClick={() => setConditionFilter(cond.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
                        conditionFilter === cond.id
                          ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500">
                Showing <strong>{filteredItems.length}</strong> certified circular devices
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const discountPct = Math.round(
                  ((item.originalPrice - item.price) / item.originalPrice) * 100
                );

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Product Image + Trust Score Ring Badge */}
                      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Circular Trust Score Ring Badge */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5">
                          <div className="relative w-7 h-7 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-200"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-emerald-600"
                                strokeDasharray={`${item.trustScore}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute text-[10px] font-black text-slate-900 font-mono">
                              {item.trustScore}
                            </span>
                          </div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase leading-none">
                            Trust<br />Score
                          </div>
                        </div>

                        {/* Discount Pill */}
                        <div className="absolute bottom-3 left-3 bg-emerald-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                          Save {discountPct}%
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {item.brand}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-semibold text-emerald-700">
                            {item.condition}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.specs}</p>

                        {/* Carbon Savings pill */}
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Avoids {item.co2Saved} kg manufacturing CO₂</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Details CTA */}
                    <div className="p-5 pt-0">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-black text-slate-900 font-mono">
                          ₹{item.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ₹{item.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs font-bold"
                          onClick={() => setSelectedProduct(item)}
                        >
                          Digital Passport
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs font-bold"
                          onClick={() => {
                            success(`Reserved ${item.name} for 24 hours!`, "Cart Reservation");
                          }}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Recovery Passport Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Digital Recovery Passport & Integrity Ledger"
        maxWidth="lg"
      >
        {selectedProduct && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Header Device Summary */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-slate-900">{selectedProduct.name}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">{selectedProduct.specs}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="success" size="sm">
                    Trust Score: {selectedProduct.trustScore}/100
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {selectedProduct.passport.warrantyMonths}-Month Guarantee
                  </Badge>
                </div>
              </div>
            </div>

            {/* Passport Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Traceable Life Cycle Timeline
              </h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                <div className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Chain-of-Custody Ingestion</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {selectedProduct.passport.origin}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">YOLOv8 & Hardware Diagnostics</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Completed on {selectedProduct.passport.inspectionDate} with zero unverified faults.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Actions & Refurbishment Log</div>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600">
                      {selectedProduct.passport.defectsFixed.map((fix, idx) => (
                        <li key={idx}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      Battery Health Rating: {selectedProduct.passport.batteryHealth}%
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Meets or exceeds certified enterprise endurance thresholds.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Certified Price:</span>
                <span className="font-mono font-black text-slate-900 text-base ml-2">
                  ₹{selectedProduct.price.toLocaleString()}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  success(`Reserved ${selectedProduct.name}!`, "Cart Reserved");
                  setSelectedProduct(null);
                }}
                className="font-bold"
              >
                Claim Certified Unit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Notify Me Modal */}
      <Modal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        title="Get Instant Drops & Allocation Notifications"
        maxWidth="md"
      >
        <form onSubmit={handleNotifySubmit} className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Specify your email to receive direct reservation notifications the moment refurbished
            units in your preferred category pass automated QA.
          </p>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notification Email
            </label>
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setNotifyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Subscribe to Drops
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
