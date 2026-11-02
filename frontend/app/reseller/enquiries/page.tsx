"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { endpoints } from "@/lib/api";
import { ShoppingBag, Plus, Sparkles, CheckCircle2 } from "lucide-react";

export default function ResellerEnquiriesPage() {
  const { success, error } = useToast();
  const [category, setCategory] = useState("laptop");
  const [modelPattern, setModelPattern] = useState("Apple MacBook Pro");
  const [targetQuantity, setTargetQuantity] = useState("10");
  const [maxUnitPrice, setMaxUnitPrice] = useState("65000");
  const [minCondition, setMinCondition] = useState("grade_b");
  const [loading, setLoading] = useState(false);

  const [enquiries, setEnquiries] = useState<any[]>([
    {
      id: "enq-101",
      category: "Laptop",
      model: "MacBook Pro (M1/M2)",
      quantity: 15,
      maxPrice: 70000,
      condition: "Grade B or Higher",
      status: "Active (2 Allocated)",
    },
    {
      id: "enq-102",
      category: "Smartphone",
      model: "iPhone 13 / 14 Series",
      quantity: 25,
      maxPrice: 42000,
      condition: "Grade A Certified",
      status: "Active (5 Allocated)",
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await endpoints.createEnquiry({
        category,
        model_pattern: modelPattern,
        target_quantity: parseInt(targetQuantity) || 10,
        max_unit_price: parseFloat(maxUnitPrice) || 50000,
        min_condition_grade: minCondition,
      });

      setEnquiries((prev) => [
        {
          id: `enq-${Math.floor(100 + Math.random() * 900)}`,
          category: category.charAt(0).toUpperCase() + category.slice(1).replace("_", " "),
          model: modelPattern,
          quantity: parseInt(targetQuantity),
          maxPrice: parseFloat(maxUnitPrice),
          condition: minCondition.replace("_", " ").toUpperCase(),
          status: "Active (Matching Ingests)",
        },
        ...prev,
      ]);

      success("Pre-demand standing enquiry active! Returning inventory will be reserved.", "Enquiry Created");
    } catch (err: any) {
      error("Failed to register standing enquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Pre-Demand Procurement Standing Orders"
        description="Register forward demand criteria so returned devices matching your specs bypass liquidation and get auto-allocated to you."
        badge={<Badge variant="success">Auto-Allocation Algorithm Active</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Standing Buy Request</CardTitle>
            <p className="text-xs text-slate-500">Matching returns will trigger 24h reservations</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Select
                label="Product Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: "clothes", label: "Clothes & Apparel / Fashion" },
                  { value: "footwear", label: "Footwear & Shoes / Sneakers" },
                  { value: "laptop", label: "Laptops & Ultrabooks" },
                  { value: "smartphone", label: "Smartphones & Mobiles" },
                  { value: "tablet", label: "Tablets & iPads" },
                  { value: "smartwatch", label: "Smartwatches & Wearables" },
                  { value: "audio", label: "Audio & Headphones" },
                  { value: "home_appliances", label: "Home Appliances" },
                ]}
              />

              <Input
                label="Target Model Specification"
                value={modelPattern}
                onChange={(e) => setModelPattern(e.target.value)}
                required
                placeholder="e.g. Dell XPS 15 or iPhone 13"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Units Desired"
                  type="number"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(e.target.value)}
                  required
                />
                <Input
                  label="Max Unit Price (₹)"
                  type="number"
                  value={maxUnitPrice}
                  onChange={(e) => setMaxUnitPrice(e.target.value)}
                  required
                />
              </div>

              <Select
                label="Minimum Acceptable Grade"
                value={minCondition}
                onChange={(e) => setMinCondition(e.target.value)}
                options={[
                  { value: "grade_a", label: "Grade A Certified Only" },
                  { value: "grade_b", label: "Grade B (Minor Scuffs OK)" },
                  { value: "harvest_pool", label: "Parts / Harvest Pool" },
                ]}
              />

              <div className="pt-2">
                <Button type="submit" size="md" className="w-full font-bold" isLoading={loading}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Activate Auto-Allocation Matcher
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Procurement Standing Orders</CardTitle>
              <p className="text-xs text-slate-500">Monitored continuously against newly inspected returns</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {enq.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{enq.id}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{enq.model}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Target: <strong>{enq.quantity} units</strong> • Ceiling: <strong>₹{enq.maxPrice.toLocaleString()}</strong> • {enq.condition}
                    </div>
                  </div>

                  <Badge variant="success" size="md">
                    {enq.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
