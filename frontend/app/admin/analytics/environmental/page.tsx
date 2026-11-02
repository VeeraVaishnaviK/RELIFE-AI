"use client";

import React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Leaf,
  ShieldCheck,
  RotateCcw,
  Package,
  Award,
  Zap,
  Download,
  ArrowLeft,
  CheckCircle2,
  TreeDeciduous,
  Car,
  Factory,
} from "lucide-react";

export default function EnvironmentalCircularityPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Circularity Impact & ESG Sustainability Scorecard"
        description="Certified lifecycle carbon accounting, electronic waste diversion metrics, and GHG Protocol Scope 3 avoidance report."
        badge={<Badge variant="success">ADEME / ITU-T L.1410 Verified</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/analytics">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Analytics
              </Button>
            </Link>
            <Button size="sm" className="font-bold">
              <Download className="w-4 h-4 mr-1.5" />
              Export ESG Audit Certificate
            </Button>
          </div>
        }
      />

      {/* Large Circularity Impact Hero Scorecard (ESG Report Style) */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white p-8 md:p-12 mb-8 shadow-2xl border border-emerald-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/80 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Award className="w-4 h-4" />
            <span>Official Circular Economy Declaration • FY 2024-2025</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            18,450 kg CO₂e Embodied Manufacturing Emissions Avoided
          </h2>

          <p className="mt-4 text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-2xl">
            By diverting inspected laptops, smartphones, and logic assemblies away from premature
            shredding and back into secondary functional life, ReLife AI eliminates virgin raw
            mineral extraction and chip fabrication carbon overhead.
          </p>

          {/* Equivalency Pills */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-900/60 border border-emerald-700/60 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-300 mb-1">
                <TreeDeciduous className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Forest Carbon Offset</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">842 Trees</div>
              <div className="text-[11px] text-emerald-200/70 mt-0.5">Growing for 10 full years</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-900/60 border border-emerald-700/60 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-300 mb-1">
                <Car className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Passenger Vehicle Miles</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">45,800 Miles</div>
              <div className="text-[11px] text-emerald-200/70 mt-0.5">Driven by an average petrol car</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-900/60 border border-emerald-700/60 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-300 mb-1">
                <Factory className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Semiconductor Fab Power</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">22.4 MWh</div>
              <div className="text-[11px] text-emerald-200/70 mt-0.5">Clean energy conserved</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Supporting ESG Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total E-Waste Diverted"
          value="4,280 kg"
          icon={Package}
          subtitle="Direct landfill diversion"
          trend={{ value: "100% toxic element safe", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="Average Life Extension"
          value="+3.2 Years"
          icon={RotateCcw}
          subtitle="Beyond original replacement cycle"
          trend={{ value: "Grade A/B refurb certified", isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Precious Metals Reclaimed"
          value="184 Grams"
          icon={Zap}
          subtitle="Gold, silver, copper & cobalt"
          trend={{ value: "R2 standard closed-loop", isPositive: true }}
          accentColor="slate"
        />
        <StatCard
          title="Circular Integrity Index"
          value="98.2 / 100"
          icon={ShieldCheck}
          subtitle="Traceable serial lifecycle"
          trend={{ value: "Scope 3 audit ready", isPositive: true }}
          accentColor="green"
        />
      </div>

      {/* Methodology & Verification Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Lifecycle Assessment (LCA) Methodology & Compliance</CardTitle>
          <p className="text-xs text-slate-500">
            Adheres to ISO 14040/14044 and ADEME Base Empreinte standards
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Laptop Avoided Emission Calculation:</h4>
            <p>
              According to ITU-T L.1410 and ADEME, the manufacture of a modern high-performance
              laptop accounts for ~75-85% of its total lifetime carbon footprint (average 208.8 kg
              CO2e). When a device is routed through Direct Resale or Targeted Repair instead of being
              discarded, this embodied manufacturing emission is credited as carbon avoidance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Smartphone Avoided Emission Calculation:</h4>
            <p>
              An average flagship smartphone embodies ~68.4 kg CO2e during silicon wafer fabrication,
              rare earth magnet assembly, and logistics. Extending device longevity by 2 years
              reduces annualized consumer device emissions by 48.2%.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
