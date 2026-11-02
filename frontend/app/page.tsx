"use client";

import React from "react";
import Link from "next/link";
import {
  Scan,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Store,
  Calculator,
  ChevronRight,
  Award,
  Sparkles,
  Gavel,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
              ♻
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">ReLife AI</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Circular Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <Link href="/roi-calculator" className="hover:text-emerald-600 transition-colors">ROI Calculator</Link>
            <Link href="/store" className="hover:text-emerald-600 transition-colors">Storefront</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="primary" size="sm">
                Open App <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-radial from-emerald-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trained YOLOv8 Vision + 5-Pathway Decision Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Autonomous Product Recovery for the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Circular Economy
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate electronic waste and maximize net recovery value. ReLife AI combines computer vision defect diagnosis, functional test analytics, and algorithmic multi-pathway decisions to route returned devices in seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/inspector/products/new">
              <Button size="lg" className="w-full sm:w-auto font-bold shadow-md shadow-emerald-600/20">
                Launch Inspection Camera <Scan className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/roi-calculator">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold">
                Calculate Enterprise ROI <Calculator className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/store">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold">
                Visit Storefront <Store className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="max-w-5xl mx-auto px-6 mt-16">
          <div className="rounded-2xl border border-slate-200/80 shadow-2xl bg-white p-3 md:p-4 backdrop-blur-xl">
            <div className="bg-slate-900 rounded-xl p-4 md:p-6 text-white overflow-hidden relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-400 font-mono ml-2">ReLife AI Engine — Decision Dashboard</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Live Model v1.0 • 98.6% mAP@0.5
                </span>
              </div>

              {/* Grid Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Defect Detection</div>
                  <div className="text-xl font-bold text-white mt-1">2 Physical Defects</div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between bg-slate-900/60 p-2 rounded border border-slate-700">
                      <span className="text-emerald-400 font-medium">Hairline Scratch (Screen)</span>
                      <span className="text-slate-400 font-mono">92% conf</span>
                    </div>
                    <div className="flex justify-between bg-slate-900/60 p-2 rounded border border-slate-700">
                      <span className="text-amber-400 font-medium">Cosmetic Dent (Casing)</span>
                      <span className="text-slate-400 font-mono">99% conf</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-emerald-500/50 rounded-xl p-4 relative ring-2 ring-emerald-500/20">
                  <div className="absolute top-3 right-3 text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Recommended
                  </div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Winning Pathway</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">Direct Resale</div>
                  <div className="mt-3 text-xs space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Net Recovery:</span>
                      <span className="font-bold text-white font-mono">₹54,123</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Carbon Saved:</span>
                      <span className="font-bold text-emerald-400 font-mono">208.8 kg CO2</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Circularity Score:</span>
                      <span className="font-bold text-emerald-400 font-mono">96 / 100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Digital Passport</div>
                  <div className="text-xl font-bold text-white mt-1">Trust Score: 88/100</div>
                  <div className="mt-3 text-xs text-slate-400 leading-relaxed">
                    Automated provenance verified. 95% inspection completeness, clean hardware tests, eligible for certified refurbished warranty.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-200 bg-[#F8FAFB] py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 tracking-tight">98.6%</div>
            <div className="mt-1 text-xs md:text-sm font-semibold text-slate-600">CV Model mAP@0.5 Accuracy</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">64.0x</div>
            <div className="mt-1 text-xs md:text-sm font-semibold text-slate-600">Average Enterprise ROI</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 tracking-tight">38.5%</div>
            <div className="mt-1 text-xs md:text-sm font-semibold text-slate-600">Recovery Rate Uplift</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">0% Waste</div>
            <div className="mt-1 text-xs md:text-sm font-semibold text-slate-600">Zero-Landfill Circular Routing</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Workflow Architecture</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            From Return Ingestion to Automated Circulation
          </h3>
          <p className="mt-4 text-slate-600 text-sm md:text-base">
            Every device passes through an intelligent 4-step pipeline designed for speed, transparency, and value maximization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4 border border-emerald-100">
              01
            </div>
            <h4 className="text-lg font-bold text-slate-900">QR Ingestion & Voice Log</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Scan serialized QR code, capture angle-guided photos, and dictate speech notes parsed via natural language processing.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4 border border-emerald-100">
              02
            </div>
            <h4 className="text-lg font-bold text-slate-900">CV Defect Detection</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              OpenCV checks blur and lighting, while YOLOv8 identifies scratches, dents, cracks, missing parts, and deformations with calibrated confidence.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4 border border-emerald-100">
              03
            </div>
            <h4 className="text-lg font-bold text-slate-900">5-Pathway Evaluation</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Decision engine computes Net Recovery Value and environmental impact across Resale, Repair, Refurbish, Harvest, and Recycle.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4 border border-emerald-100">
              04
            </div>
            <h4 className="text-lg font-bold text-slate-900">Marketplace & Auctions</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Auto-allocated to waiting buyers or listed in reverse auctions with anti-sniping and Dutch price decay for zero waste.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlight Cards */}
      <section id="features" className="py-20 bg-[#F8FAFB] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Enterprise Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Scaled Circular Logistics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Scan className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Computer Vision Inspection</h4>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Trained YOLOv8s with CLAHE preprocessing and temperature-scaled confidence. Flags uncertain cases to the Human Review Queue automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">What-If Decision Simulator</h4>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Live weighted multi-criteria simulator allowing executives to adjust profit, speed, environmental impact, and risk priorities in real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Gavel className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Component Reverse Auctions</h4>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Harvested logic boards, displays, and modules are auctioned to certified repair shops with Dutch price decay and anti-sniping protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">ReLife AI</span>
            <span>• Circular Economy Product Recovery Platform</span>
          </div>
          <div>
            FastAPI + MongoDB (Beanie ODM) • Next.js 14 App Router • YOLOv8 Computer Vision
          </div>
        </div>
      </footer>
    </div>
  );
}
