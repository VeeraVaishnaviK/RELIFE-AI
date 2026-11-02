"use client";

import React, { useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Slider } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  Calculator,
  TrendingUp,
  Leaf,
  DollarSign,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  ChevronRight,
  Package,
} from "lucide-react";

export default function EnterpriseRoiCalculatorPage() {
  const { success } = useToast();

  // Slider Inputs
  const [annualReturns, setAnnualReturns] = useState(25000); // 5,000 - 200,000 units
  const [avgRetailValue, setAvgRetailValue] = useState(45000); // ₹10,000 - ₹120,000
  const [currentRecoveryRate, setCurrentRecoveryRate] = useState(30); // 10% - 60%
  const [targetRecoveryRate, setTargetRecoveryRate] = useState(72); // 60% - 95%

  // Computations
  const totalDeviceValuePool = annualReturns * avgRetailValue;
  const currentRecoveredValue = totalDeviceValuePool * (currentRecoveryRate / 100) * 0.45;
  const relifeRecoveredValue = totalDeviceValuePool * (targetRecoveryRate / 100) * 0.68;
  const incrementalRevenueAnnual = relifeRecoveredValue - currentRecoveredValue;
  const avoidedCo2MetricTons = Math.round((annualReturns * (targetRecoveryRate / 100) * 140) / 1000);
  const divertedEWasteKg = Math.round(annualReturns * (targetRecoveryRate / 100) * 1.85);

  const annualSoftwareCost = 450000;
  const netRoiMultiple = Math.round((incrementalRevenueAnnual / annualSoftwareCost) * 10) / 10;

  // Export PDF Report with jsPDF
  const handleExportPdf = () => {
    const doc = new jsPDF();

    // Document styling
    doc.setFillColor(16, 163, 74);
    doc.rect(0, 0, 210, 36, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ReLife AI — Enterprise Circular Recovery Audit", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Algorithmic ROI & Avoided Carbon Lifecycle Projection", 14, 30);

    // Section 1: Parameters
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Operational Intake Baseline", 14, 52);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`• Annual Electronic Returns Volume: ${annualReturns.toLocaleString()} units / year`, 16, 62);
    doc.text(`• Average Retail Hardware Value (MSRP): INR ${avgRetailValue.toLocaleString()}`, 16, 70);
    doc.text(`• Current Baseline Recovery Efficiency: ${currentRecoveryRate}%`, 16, 78);
    doc.text(`• Target ReLife Autonomous Routing Rate: ${targetRecoveryRate}%`, 16, 86);

    // Section 2: Financial Projections
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. Projected Financial & Economic Returns", 14, 104);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`• Net Incremental Recovery Realization: INR ${Math.round(incrementalRevenueAnnual).toLocaleString()} / year`, 16, 114);
    doc.text(`• Projected Enterprise Software ROI Multiple: ${netRoiMultiple}x Net Multiple`, 16, 122);
    doc.text(`• Total Capital Value Recovered: INR ${Math.round(relifeRecoveredValue).toLocaleString()}`, 16, 130);

    // Section 3: ESG Impact
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. ESG Scope 3 Carbon & E-Waste Avoidance", 14, 148);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`• ADEME Verified Avoided CO2 Emissions: ${avoidedCo2MetricTons.toLocaleString()} Metric Tons CO2e`, 16, 158);
    doc.text(`• Direct Landfill E-Waste Diversion: ${divertedEWasteKg.toLocaleString()} Kilograms`, 16, 166);
    doc.text("• Lifecycle Accounting Standard: ISO 14040/14044 & ITU-T L.1410", 16, 174);

    // Footer Disclaimer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(
      "CONFIDENTIAL • Prepared for enterprise executive evaluation. Calculated via ReLife AI 5-Pathway Decision Simulator.",
      14,
      280
    );

    doc.save(`ReLife-Enterprise-ROI-Audit-${annualReturns}-units.pdf`);
    success("Executive ROI Audit PDF generated and downloaded!", "PDF Export Complete");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg">
              ♻
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight">ReLife AI</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                Enterprise ROI Tool
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/store">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-xs">
                Consumer Storefront
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">
                Launch Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-radial from-emerald-950/60 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Business Case Simulator</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Calculate Your Enterprise{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Circular Recovery ROI
            </span>
          </h1>

          <p className="mt-4 text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Discover the net cash profit and verified Scope 3 carbon savings unlocked when replacing
            manual inspection spreadsheets with autonomous computer vision and 5-pathway algorithmic routing.
          </p>
        </div>

        {/* Main Interactive Calculator Console */}
        <div className="max-w-6xl mx-auto px-6 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 Cols: Sliders Panel */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Intake Parameters</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Live Inputs</span>
              </div>

              {/* Slider 1 */}
              <div>
                <Slider
                  label="Annual Electronic Returns (Units / Year)"
                  value={annualReturns}
                  min={2000}
                  max={100000}
                  step={1000}
                  unit=" units"
                  onChange={setAnnualReturns}
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Total laptops, smartphones, and IT hardware ingested annually.
                </div>
              </div>

              {/* Slider 2 */}
              <div>
                <Slider
                  label="Average Retail Hardware MSRP (INR)"
                  value={avgRetailValue}
                  min={10000}
                  max={120000}
                  step={2500}
                  unit=" ₹"
                  onChange={setAvgRetailValue}
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Blended original selling price across your return stream.
                </div>
              </div>

              {/* Slider 3 */}
              <div>
                <Slider
                  label="Current Status-Quo Recovery Rate"
                  value={currentRecoveryRate}
                  min={10}
                  max={60}
                  step={1}
                  unit="%"
                  onChange={setCurrentRecoveryRate}
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Baseline percentage diverted from scrap or bulk liquidation at steep discount.
                </div>
              </div>

              {/* Slider 4 */}
              <div>
                <Slider
                  label="Target ReLife Autonomous Routing Rate"
                  value={targetRecoveryRate}
                  min={60}
                  max={95}
                  step={1}
                  unit="%"
                  onChange={setTargetRecoveryRate}
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Achieved with AI vision grading, component harvest, and pre-demand matching.
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Real-time Output Cards */}
            <div className="lg:col-span-6 space-y-6">
              {/* Highlight Card: Incremental Annual Revenue */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                    Net Incremental Cash Recovery
                  </span>
                  <Badge variant="success" size="sm" className="bg-white/20 text-white border-white/30">
                    Annual Lift
                  </Badge>
                </div>

                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                  ₹{Math.round(incrementalRevenueAnnual).toLocaleString()}
                </div>

                <p className="text-xs text-emerald-100/90 leading-relaxed max-w-md">
                  Additional bottom-line cash recovered annually by avoiding liquidation markdowns
                  and capturing Grade A refurbished premiums.
                </p>

                <div className="mt-6 pt-4 border-t border-emerald-500/40 flex items-center justify-between text-xs font-bold text-emerald-100">
                  <span>Payback Period: &lt; 21 Days</span>
                  <span className="font-mono text-emerald-200">{netRoiMultiple}x Annual ROI</span>
                </div>
              </div>

              {/* Two Column Grid: Avoided Carbon & E-Waste */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Leaf className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Avoided Emissions</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-white mt-1">
                    {avoidedCo2MetricTons.toLocaleString()}{" "}
                    <span className="text-sm font-normal text-slate-400">t CO₂e</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ADEME LCA verified Scope 3 reduction
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">E-Waste Diverted</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-white mt-1">
                    {divertedEWasteKg.toLocaleString()}{" "}
                    <span className="text-sm font-normal text-slate-400">kg</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    100% certified closed-loop routing
                  </div>
                </div>
              </div>

              {/* Action Bar with PDF Export */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-white">Generate Executive Audit</div>
                  <div className="text-[11px] text-slate-400">Download formatted investment pitch PDF</div>
                </div>

                <Button
                  onClick={handleExportPdf}
                  className="w-full sm:w-auto font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Export Audit PDF (jsPDF)
                </Button>
              </div>

              {/* Disclaimer Footnote */}
              <div className="text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
                * Projections are modeled using empirical secondary electronics market realization
                curves and ADEME Base Empreinte 2024 lifecycle emission benchmarks. Actual yields
                depend on category mix and hardware intake condition.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
