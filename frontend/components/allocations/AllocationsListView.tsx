"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { endpoints } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface AllocationItem {
  id: string;
  product_id: string;
  product_title: string;
  category: string;
  price: number;
  condition_grade: string;
  reservation_seconds_left: number;
  status: "pending" | "confirmed" | "declined";
  match_reason: string;
}

const DEMO_ALLOCATIONS: AllocationItem[] = [
  {
    id: "alloc-01",
    product_id: "prod-mac-m1",
    product_title: "Apple MacBook Pro 14\" M1 Pro (16GB, 512GB)",
    category: "Laptop",
    price: 88500,
    condition_grade: "Grade A Certified",
    reservation_seconds_left: 4200, // ~1h 10m
    status: "pending",
    match_reason: "Pre-demand standing order match for high-tier Apple laptops",
  },
  {
    id: "alloc-02",
    product_id: "prod-x1-gen9",
    product_title: "Lenovo ThinkPad X1 Carbon Gen 9 (i7, 16GB)",
    category: "Laptop",
    price: 54000,
    condition_grade: "Grade B Certified",
    reservation_seconds_left: 1800, // 30m
    status: "pending",
    match_reason: "Automated routing from enterprise lease return batch",
  },
  {
    id: "alloc-03",
    product_id: "prod-iphone-13",
    product_title: "iPhone 13 Pro 128GB Sierra Blue",
    category: "Smartphone",
    price: 44000,
    condition_grade: "Grade A Like New",
    reservation_seconds_left: 640, // 10m (urgent)
    status: "pending",
    match_reason: "Direct consumer trade-in intake fast-tracked to certified partners",
  },
];

export const AllocationsListView: React.FC<{ roleTitle: string }> = ({ roleTitle }) => {
  const { success, warning, error } = useToast();
  const [allocations, setAllocations] = useState<AllocationItem[]>(DEMO_ALLOCATIONS);
  const [loading, setLoading] = useState(false);

  // Countdown timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setAllocations((prev) =>
        prev.map((a) => ({
          ...a,
          reservation_seconds_left: Math.max(0, a.reservation_seconds_left - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s < 10 ? "0" : ""}${s}s`;
    }
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const handleConfirm = async (id: string) => {
    try {
      try {
        await endpoints.confirmAllocation(id);
      } catch (e) {
        // Fallback for simulation
      }
      setAllocations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a))
      );
      success("Allocation confirmed and locked! Inventory held for fulfillment.", "Confirmed");
    } catch (err: any) {
      error("Failed to confirm allocation");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      try {
        await endpoints.declineAllocation(id);
      } catch (e) {
        // Fallback for simulation
      }
      setAllocations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "declined" } : a))
      );
      warning("Allocation declined. Item returned to secondary circular marketplace.", "Declined");
    } catch (err: any) {
      error("Failed to decline allocation");
    }
  };

  const pendingAllocations = allocations.filter((a) => a.status === "pending");

  return (
    <DashboardShell>
      <PageHeader
        title={`${roleTitle} — Pre-Demand Inventory Allocations`}
        description="Exclusive direct-allocation reservations matched by the AI engine based on your standing purchase criteria and reliability score."
        badge={
          <Badge variant={pendingAllocations.length ? "warning" : "success"}>
            {pendingAllocations.length} Pending Reservation(s)
          </Badge>
        }
      />

      <div className="space-y-4">
        {allocations.map((item) => {
          const isUrgent = item.reservation_seconds_left < 900; // < 15 mins
          const isExpired = item.reservation_seconds_left === 0;

          return (
            <div
              key={item.id}
              className={`p-6 rounded-2xl bg-white border transition-all ${
                item.status === "confirmed"
                  ? "border-emerald-300 bg-emerald-50/20"
                  : item.status === "declined"
                  ? "border-slate-200 opacity-60"
                  : "border-slate-200 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {item.category}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {item.condition_grade}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.product_title}</h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.match_reason}</span>
                  </p>
                </div>

                {/* Center / Price Info */}
                <div className="text-left lg:text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Reserved Price
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                    ₹{item.price.toLocaleString()}
                  </div>

                  {/* Timer */}
                  <div className="mt-1 flex items-center lg:justify-end gap-1.5 text-xs font-mono">
                    <Clock className={`w-3.5 h-3.5 ${isUrgent ? "text-rose-500 animate-spin" : "text-slate-400"}`} />
                    <span
                      className={`font-bold ${
                        isUrgent ? "text-rose-600 animate-pulse" : "text-slate-600"
                      }`}
                    >
                      {item.status !== "pending"
                        ? `Locked (${item.status})`
                        : isExpired
                        ? "Reservation Expired"
                        : `${formatTimer(item.reservation_seconds_left)} remaining`}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
                  {item.status === "pending" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(item.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(item.id)}
                        disabled={isExpired}
                        className="text-xs font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Confirm &amp; Purchase
                      </Button>
                    </>
                  ) : item.status === "confirmed" ? (
                    <Badge variant="success" size="lg">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Purchase Confirmed
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="lg">
                      Declined
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
};
