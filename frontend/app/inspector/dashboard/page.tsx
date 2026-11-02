"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { endpoints } from "@/lib/api";
import {
  ScanLine,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";

export default function InspectorDashboardPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await endpoints.getProducts({ limit: 10 });
        setProducts(res.data.products || res.data || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <DashboardShell>
      <PageHeader
        title="Inspector Station #04 Console"
        description="Intake inspection workstation with integrated YOLOv8 computer vision and voice-to-defect logging."
        badge={<Badge variant="success">Station Online</Badge>}
        action={
          <Link href="/inspector/products/new">
            <Button size="sm">
              <ScanLine className="w-4 h-4 mr-1.5" />
              Register New Return
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Units Inspected Today"
          value="18 Devices"
          icon={ScanLine}
          subtitle="Passed camera diagnosis"
          trend={{ value: "+4 vs quota", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="Average Scan Duration"
          value="48 Secs"
          icon={Camera}
          subtitle="Multi-angle AR guided"
          trend={{ value: "98.6% blur pass rate", isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Defects Detected"
          value="24 Items"
          icon={AlertTriangle}
          subtitle="Localized by YOLOv8"
          trend={{ value: "Calibrated conf > 80%", isPositive: true }}
          accentColor="slate"
        />
        <StatCard
          title="Auto-Routed Without Review"
          value="94.4%"
          icon={CheckCircle2}
          subtitle="Exceeded autonomous threshold"
          trend={{ value: "1 case flagged", isPositive: true }}
          accentColor="green"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Queue for Physical Inspection</CardTitle>
            <p className="text-xs text-slate-500">Select any device to launch angle-guided camera</p>
          </div>
          <Link href="/inspector/products/new">
            <Button variant="outline" size="sm" className="text-xs">
              + New Intake
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Return Channel</th>
                  <th className="py-3 px-4">Intake Reason</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{p.brand} {p.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.product_uid}</div>
                    </td>
                    <td className="py-3.5 px-4 capitalize">{p.category}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-500">
                      {p.return_info?.return_channel?.replace("_", " ") || "E-commerce"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {p.return_info?.return_reason || "Customer return"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/inspector/inspections/${p._id || p.id}`}>
                        <Button size="sm" className="text-xs font-bold">
                          Launch Vision Scan <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
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
