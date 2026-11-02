"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { endpoints } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Leaf,
  DollarSign,
  Package,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

// Demo Time Series Data
const MONTHLY_RECOVERY_DATA = [
  { month: "Jan", revenue: 42000, cost: 8400, co2_kg: 840, units: 12 },
  { month: "Feb", revenue: 58000, cost: 11200, co2_kg: 1120, units: 16 },
  { month: "Mar", revenue: 74000, cost: 13500, co2_kg: 1480, units: 21 },
  { month: "Apr", revenue: 89000, cost: 16200, co2_kg: 1780, units: 25 },
  { month: "May", revenue: 104000, cost: 18500, co2_kg: 2140, units: 29 },
  { month: "Jun", revenue: 128500, cost: 21300, co2_kg: 2680, units: 36 },
];

const PATHWAY_DISTRIBUTION = [
  { name: "Direct Resale", value: 42, color: "#10B981" },
  { name: "Repair & Return", value: 28, color: "#0EA5E9" },
  { name: "Certified Refurbish", value: 18, color: "#6366F1" },
  { name: "Harvest Parts", value: 8, color: "#F59E0B" },
  { name: "Scrap Recycle", value: 4, color: "#94A3B8" },
];

const CATEGORY_PERFORMANCE = [
  { category: "Laptops", nrv_rate: 88, units: 64, margin: "72%" },
  { category: "Smartphones", nrv_rate: 81, units: 92, margin: "68%" },
  { category: "Tablets", nrv_rate: 76, units: 34, margin: "64%" },
  { category: "Wearables", nrv_rate: 69, units: 18, margin: "58%" },
];

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState("6m");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await endpoints.getOutcomesAnalytics();
        setAnalytics(res.data);
      } catch (e) {
        console.error("Outcomes analytics load error:", e);
      }
    }
    load();
  }, []);

  return (
    <DashboardShell>
      <PageHeader
        title="Platform Recovery & Circularity Analytics"
        description="Comprehensive telemetry across Net Recovery Realization, ADEME lifecycle carbon offsets, and pathway velocity."
        badge={<Badge variant="success">Real-Time Aggregations Active</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/analytics/environmental">
              <Button size="sm" variant="outline" className="font-bold text-emerald-800 border-emerald-300 bg-emerald-50/50">
                <Leaf className="w-4 h-4 mr-1.5 text-emerald-600" />
                ESG Circularity Scorecard
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 mb-8 shadow-xs">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            Reporting View:
          </span>
          <div className="flex gap-1.5">
            {["30d", "90d", "6m", "ytd"].map((val) => (
              <button
                key={val}
                onClick={() => setDateRange(val)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  dateRange === val
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {val.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: "all", label: "All Product Lines" },
              { value: "laptops", label: "Enterprise Laptops" },
              { value: "smartphones", label: "Consumer Smartphones" },
            ]}
            className="text-xs py-1.5"
          />
        </div>
      </div>

      {/* Top 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Net Recovery Value"
          value="₹495,500"
          icon={DollarSign}
          subtitle="Direct secondary & auction revenue"
          trend={{ value: "+34.2% YoY", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="Lifecycle Carbon Avoided"
          value="10,040 kg"
          icon={Leaf}
          subtitle="ADEME LCA factor certified"
          trend={{ value: "Equivalent to 4.2 cars off road", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="Mean Turnaround Velocity"
          value="3.4 Days"
          icon={TrendingUp}
          subtitle="Intake to liquidation"
          trend={{ value: "-62% vs manual RMA", isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Landfill Diversion Rate"
          value="96.2%"
          icon={Package}
          subtitle="E-waste completely averted"
          trend={{ value: "Zero-landfill certified", isPositive: true }}
          accentColor="slate"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left 2 Cols: Monthly Revenue vs Cost Trend */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Net Recovery Revenue vs Outlay</CardTitle>
                <p className="text-xs text-slate-500">
                  Monthly realizations across all 5 circular recovery pathways
                </p>
              </div>
              <Badge variant="success" size="sm">
                Gross Margin: 82%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_RECOVERY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, ""]}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                    <Bar dataKey="revenue" name="Recovery Revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="cost" name="Repair & Processing Cost" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Pathway Distribution Pie */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pathway Allocation</CardTitle>
              <p className="text-xs text-slate-500">Distribution across 5 recovery loops</p>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PATHWAY_DISTRIBUTION}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {PATHWAY_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [`${val}%`, "Share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 mt-2">
                {PATHWAY_DISTRIBUTION.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Category Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Hardware Category Efficiency</CardTitle>
          <p className="text-xs text-slate-500">
            Intake volume, Net Recovery Value (NRV) conversion, and average margin
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Processed Units</th>
                  <th className="py-3 px-4">NRV Realization Rate</th>
                  <th className="py-3 px-4">Average Recovery Margin</th>
                  <th className="py-3 px-4 text-right">Circularity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {CATEGORY_PERFORMANCE.map((cat, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{cat.category}</td>
                    <td className="py-3.5 px-4 font-mono">{cat.units} units</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${cat.nrv_rate}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-900">{cat.nrv_rate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{cat.margin}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="success" size="sm">
                        High Yield Loop
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
