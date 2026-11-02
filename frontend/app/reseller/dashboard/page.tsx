"use client";

import React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShoppingBag,
  Gavel,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function ResellerDashboardPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Reseller & Wholesale Partner Portal"
        description="Direct-from-source circular electronics allocation, verified B2B parts lots, and real-time reverse bidding."
        badge={<Badge variant="success">Tier-1 Verified Partner</Badge>}
        action={
          <div className="flex gap-2">
            <Link href="/reseller/marketplace">
              <Button size="sm">
                <Gavel className="w-4 h-4 mr-1.5" />
                Live Auctions
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Active Allocations"
          value="3 Lots"
          icon={CheckCircle2}
          subtitle="Reserved for 24h"
          trend={{ value: "Priority standing match", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="Won Reverse Bids"
          value="14 Lots"
          icon={Gavel}
          subtitle="Display & logic assemblies"
          trend={{ value: "+28% margin vs OEM", isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Partner Reliability Score"
          value="96 / 100"
          icon={ShieldCheck}
          subtitle="Fulfillment promptness"
          trend={{ value: "Top 5% Partner", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="CO2 Avoided via Purchases"
          value="2,480 kg"
          icon={Sparkles}
          subtitle="Circularity credit issued"
          trend={{ value: "ADEME verified", isPositive: true }}
          accentColor="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Inventory Reservations</CardTitle>
              <p className="text-xs text-slate-500">Fast-lock before allocation timer expires</p>
            </div>
            <Link href="/reseller/allocations">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-700 font-bold">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">MacBook Pro 14" M1 Pro</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">₹88,500 • Grade A Certified</div>
              </div>
              <Link href="/reseller/allocations">
                <Button size="sm" className="text-xs font-bold">
                  Confirm
                </Button>
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">ThinkPad X1 Carbon Gen 9</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">₹54,000 • Grade B Certified</div>
              </div>
              <Link href="/reseller/allocations">
                <Button size="sm" className="text-xs font-bold">
                  Confirm
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Component Auctions Live</CardTitle>
              <p className="text-xs text-slate-500">Reverse Dutch auction listings</p>
            </div>
            <Link href="/reseller/marketplace">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-700 font-bold">
                Bid Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Lot of 5x OEM MacBook Pro Displays</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Current: ₹34,500 • 2m remaining</div>
              </div>
              <Link href="/reseller/marketplace">
                <Button variant="outline" size="sm" className="text-xs font-bold">
                  Outbid
                </Button>
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">3x ThinkPad X1 Motherboards (i7)</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Current: ₹28,000 • 12m remaining</div>
              </div>
              <Link href="/reseller/marketplace">
                <Button variant="outline" size="sm" className="text-xs font-bold">
                  Outbid
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
