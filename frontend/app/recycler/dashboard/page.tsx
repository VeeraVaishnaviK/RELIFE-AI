"use client";

import React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Recycle, Gavel, Leaf, Package, ArrowRight, ShieldCheck } from "lucide-react";

export default function RecyclerDashboardPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="R2 Certified Recycler Console"
        description="Scrap materials procurement, precious metal extraction yields, and e-waste regulatory compliance logging."
        badge={<Badge variant="success">R2v3 Certified Downstream</Badge>}
        action={
          <Link href="/recycler/marketplace">
            <Button size="sm">
              <Gavel className="w-4 h-4 mr-1.5" />
              Scrap Material Auctions
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Scrap Ingested"
          value="4,820 kg"
          icon={Package}
          subtitle="Non-repairable residue"
          trend={{ value: "100% landfill averted", isPositive: true }}
          accentColor="slate"
        />
        <StatCard
          title="Gold & Copper Yield"
          value="312 Grams"
          icon={Recycle}
          subtitle="Precious element refining"
          trend={{ value: "High assay purity", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="EPA / CPCB Compliance"
          value="100% Pass"
          icon={ShieldCheck}
          subtitle="Hazardous material audit"
          trend={{ value: "Battery lithium recycled", isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Avoided Smelting CO2"
          value="3,150 kg"
          icon={Leaf}
          subtitle="Virgin mining avoided"
          trend={{ value: "Scope 3 credit issued", isPositive: true }}
          accentColor="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active E-Waste & Scrap Lots</CardTitle>
              <p className="text-xs text-slate-500">Reverse Dutch bidding for bulk circuit boards & plastics</p>
            </div>
            <Link href="/recycler/marketplace">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-700 font-bold">
                Bid on Lots <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Bulk Scrap Lot: 25kg Mixed Motherboard Gold Fingers</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Current Bid: ₹18,200 • Closes in 1h</div>
              </div>
              <Link href="/recycler/marketplace">
                <Button size="sm" className="text-xs font-bold">
                  Bid
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Circularity Audit Export</CardTitle>
              <p className="text-xs text-slate-500">Government certified destruction & refining slips</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Every unit dispatched to the recycling pathway generates a serialized Certificate of
              Destruction and Precious Element Manifest for regulatory Scope 3 filings.
            </p>
            <Link href="/admin/analytics/environmental">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                View Circularity Impact Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
