"use client";

import React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Wrench, Layers, CheckCircle2, Clock, ArrowRight, ShieldCheck } from "lucide-react";

export default function RepairPartnerDashboardPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Repair Partner Service Workstation"
        description="Assigned hardware dispatch tickets, OEM parts fulfillment, and post-repair diagnostic verification."
        badge={<Badge variant="success">Level 3 Authorized Center</Badge>}
        action={
          <Link href="/repair-partner/jobs">
            <Button size="sm">
              <Wrench className="w-4 h-4 mr-1.5" />
              View Assigned Jobs
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Active Repair Tickets"
          value="4 Devices"
          icon={Wrench}
          subtitle="Awaiting bench repair"
          trend={{ value: "2 urgent display swaps", isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Turnaround SLA Rate"
          value="98.2%"
          icon={Clock}
          subtitle="Completed in < 48 hours"
          trend={{ value: "+2.4% vs benchmark", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="QA Pass on First Attempt"
          value="96.5%"
          icon={CheckCircle2}
          subtitle="Passed secondary vision QA"
          trend={{ value: "Zero customer RMAs", isPositive: true }}
          accentColor="green"
        />
        <StatCard
          title="Realized Labor Payout"
          value="₹38,400"
          icon={ShieldCheck}
          subtitle="This billing cycle"
          trend={{ value: "₹450/hr flat standard", isPositive: true }}
          accentColor="slate"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assigned Diagnostic Repair Bench</CardTitle>
            <p className="text-xs text-slate-500">Units dispatched based on YOLOv8 defect manifest</p>
          </div>
          <Link href="/repair-partner/jobs">
            <Button variant="ghost" size="sm" className="text-xs text-emerald-700 font-bold">
              Open Work Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-xs">Dell XPS 13 9310 • Display Replacement</div>
              <div className="text-[11px] text-slate-500 mt-0.5">OEM Screen Panel in inventory • Assigned 2h ago</div>
            </div>
            <Link href="/repair-partner/jobs">
              <Button size="sm" className="text-xs">
                Log Bench Work
              </Button>
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-xs">ThinkPad X1 Carbon • Fan & Thermal Paste</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Ultrasonic cleaning & fresh thermal compound required</div>
            </div>
            <Link href="/repair-partner/jobs">
              <Button size="sm" className="text-xs">
                Log Bench Work
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
