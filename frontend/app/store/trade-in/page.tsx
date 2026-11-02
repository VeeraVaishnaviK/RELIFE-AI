"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { GuidedCaptureCamera } from "@/components/capture/GuidedCaptureCamera";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select, Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Coins,
  Leaf,
  Info,
} from "lucide-react";

export default function CustomerTradeInPage() {
  const { success } = useToast();
  const [step, setStep] = useState<"details" | "capture" | "result">("details");

  // Device specs
  const [category, setCategory] = useState("laptop");
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("MacBook Air M1");
  const [storage, setStorage] = useState("256GB");
  const [conditionSelf, setConditionSelf] = useState("good");
  const [powersOn, setPowersOn] = useState("yes");

  // Valuation result
  const [estimatedValue, setEstimatedValue] = useState<number>(36500);
  const [co2Saved, setCo2Saved] = useState<number>(184.2);

  const handleDetailsProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("capture");
  };

  const handleCaptureDone = (cvResult?: any) => {
    // Fire confetti celebration!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10B981", "#059669", "#34D399", "#F59E0B"],
    });

    setEstimatedValue(category === "laptop" ? 38500 : 22000);
    setCo2Saved(category === "laptop" ? 195.4 : 64.2);
    setStep("result");
    success("Vision scan processed! Trade-in valuation locked.", "Trade-In Estimated");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-900">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-base">
              ♻
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              ReLife Trade-In
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/store">
              <Button variant="ghost" size="sm" className="text-xs">
                Back to Storefront
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant AI Diagnostic Appraisal • Best Value Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Exchange Old Tech for Instant Cash or Store Credit
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
            Our computer vision model inspects cosmetic wear in seconds, calculating instant payouts
            backed by real secondary market demand.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8 text-xs font-semibold">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              step === "details"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            <span>1</span> <span>Device Specs</span>
          </div>
          <span className="text-slate-300">──</span>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              step === "capture"
                ? "bg-emerald-600 text-white"
                : step === "result"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            <span>2</span> <span>AI Visual Scan</span>
          </div>
          <span className="text-slate-300">──</span>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              step === "result"
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            <span>3</span> <span>Guaranteed Offer</span>
          </div>
        </div>

        {/* Step 1: Specs Manifest */}
        {step === "details" && (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Step 1: Tell Us About Your Device</CardTitle>
              <p className="text-xs text-slate-500">Provide basic hardware parameters</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDetailsProceed} className="space-y-4 text-xs">
                <Select
                  label="Asset / Category Type"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: "laptop", label: "Laptop (MacBook / Windows)" },
                    { value: "smartphone", label: "Smartphone (iPhone / Android)" },
                    { value: "tablet", label: "Tablet / iPad" },
                    { value: "clothes", label: "Apparel & Clothes / Fashion" },
                    { value: "footwear", label: "Footwear & Shoes / Sneakers" },
                    { value: "smartwatch", label: "Smartwatch & Wearables" },
                    { value: "audio", label: "Audio & Headphones" },
                    { value: "home_appliances", label: "Home Appliances" },
                  ]}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    options={[
                      { value: "Apple", label: "Apple" },
                      { value: "Dell", label: "Dell" },
                      { value: "Lenovo", label: "Lenovo" },
                      { value: "Samsung", label: "Samsung" },
                      { value: "HP", label: "HP" },
                    ]}
                  />
                  <Input
                    label="Model Name"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    placeholder="e.g. MacBook Air M1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Storage Size"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    options={[
                      { value: "128GB", label: "128 GB" },
                      { value: "256GB", label: "256 GB" },
                      { value: "512GB", label: "512 GB" },
                      { value: "1TB", label: "1 TB" },
                    ]}
                  />
                  <Select
                    label="Power Functionality"
                    value={powersOn}
                    onChange={(e) => setPowersOn(e.target.value)}
                    options={[
                      { value: "yes", label: "Powers On Completely" },
                      { value: "no", label: "Does Not Boot / Dead Battery" },
                    ]}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full font-bold">
                    Continue to AI Photo Scan
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Camera Capture */}
        {step === "capture" && (
          <div className="space-y-4">
            <GuidedCaptureCamera
              productId="tradein-temp"
              category={category}
              onSuccess={handleCaptureDone}
            />

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCaptureDone()}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Skip camera and view algorithmic estimation →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Celebratory Result Card */}
        {step === "result" && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-400">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white p-8 shadow-2xl text-center relative overflow-hidden">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Coins className="w-8 h-8 text-emerald-300" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                Guaranteed Instant Trade-In Value
              </span>

              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-3 text-white">
                ₹{estimatedValue.toLocaleString()}
              </div>

              <p className="text-xs text-emerald-100 max-w-sm mx-auto leading-relaxed">
                Appraisal locked for <strong>{brand} {model}</strong> ({storage}). Payout available via
                UPI, Direct Bank Transfer, or Store Credit with a +10% bonus.
              </p>

              {/* Environmental Impact Pill */}
              <div className="mt-6 inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs text-emerald-300 font-semibold">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>You will avert {co2Saved} kg of CO₂ emissions!</span>
              </div>
            </div>

            {/* Confidence Disclaimer Pill (Transparent & Professional) */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">Transparent Appraisal Guarantee:</h5>
                <p className="mt-0.5 leading-relaxed text-amber-800">
                  This instant offer is based on optical diagnosis of your submitted photos and stated
                  functional parameters. When our courier picks up the device, a 2-minute diagnostic rig
                  confirms hardware specs. If the final value differs, you can reject with 100% free return shipping.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full font-bold shadow-md shadow-emerald-600/20"
                onClick={() => {
                  success("Pickup scheduled! Free prepaid insured kit dispatched.", "Trade-In Initiated");
                }}
              >
                Accept Offer &amp; Schedule Free Pickup
                <CheckCircle2 className="w-4 h-4 ml-1.5" />
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => setStep("details")}
                className="w-full text-xs font-semibold"
              >
                Appraise Another Device
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
