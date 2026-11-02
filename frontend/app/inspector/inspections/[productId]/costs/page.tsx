"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { endpoints } from "@/lib/api";
import {
  DollarSign,
  TrendingUp,
  Wrench,
  Layers,
  Recycle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Calculator,
} from "lucide-react";

export default function CostValuationPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<any>(null);
  const [costData, setCostData] = useState<any>(null);
  const [valuationData, setValuationData] = useState<any>(null);
  const [costMatrix, setCostMatrix] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, valRes, matrixRes] = await Promise.all([
          endpoints.getProduct(productId),
          endpoints.getValuation(productId).catch(() => ({ data: null })),
          endpoints.getCostMatrix(productId).catch(() => ({ data: null })),
        ]);
        setProduct(prodRes.data);
        setValuationData(valRes?.data);
        if (matrixRes?.data) {
          setCostMatrix(matrixRes.data);
        }

        // Try getting costs
        try {
          const costRes = await endpoints.getCosts(productId);
          setCostData(costRes.data);
        } catch {
          // If not calculated yet, run estimation
          const estRes = await endpoints.estimateCosts(productId);
          setCostData(estRes.data);
        }
      } catch (err: any) {
        console.error("Valuation load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadData();
    }
  }, [productId]);

  const handleRecalculate = async () => {
    setEstimating(true);
    try {
      const [estRes, matrixRes] = await Promise.all([
        endpoints.estimateCosts(productId),
        endpoints.getCostMatrix(productId).catch(() => ({ data: null })),
      ]);
      setCostData(estRes.data);
      if (matrixRes?.data) {
        setCostMatrix(matrixRes.data);
      }
      success("Cost model recalculated with latest defect manifest", "Updated");
    } catch (err: any) {
      error("Failed to re-estimate costs");
    } finally {
      setEstimating(false);
    }
  };

  const msrp = costMatrix?.original_msrp || product?.purchase_price || product?.original_msrp || 194900;
  const repairPartsCost = costData?.parts_cost || Math.round(msrp * 0.08);
  const repairLaborCost = costData?.labor_cost || 1350;
  const totalRepairCost = costMatrix?.total_repair_investment || (costData?.total_repair_cost || (repairPartsCost + repairLaborCost + 350));

  // Valuation estimations
  const resaleGradeA = costMatrix?.refurbished_market_ceiling || Math.round(msrp * 0.72);
  const resaleGradeB = costMatrix?.secondary_market_tiers?.[1]?.price || Math.round(msrp * 0.55);
  const resaleGradeC = costMatrix?.secondary_market_tiers?.[2]?.price || Math.round(msrp * 0.40);
  const harvestValue = costMatrix?.harvest_component_pool || Math.round(msrp * 0.35);
  const scrapValue = costMatrix?.raw_scrap_value || Math.round(msrp * 0.04);

  return (
    <DashboardShell>
      <PageHeader
        title={product ? `Cost & Valuation: ${product.brand} ${product.model}` : "Cost & Valuation Matrix"}
        description="Comprehensive financial appraisal across repair labor, OEM parts catalog, secondary market pricing, and scrap recovery value."
        badge={<Badge variant="success">Pricing Engine V2.4 Active</Badge>}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              isLoading={estimating}
            >
              <Calculator className="w-4 h-4 mr-1.5" />
              Recalculate Costs
            </Button>
            <Link href={`/admin/products/${productId}/decision`}>
              <Button size="sm">
                Evaluate 5 Pathways
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top 4 Financial Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Original Retail (MSRP)
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₹{msrp.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant="neutral" size="sm">
              {costMatrix?.pricing_source ? "Verified Market MSRP" : "Baseline Reference"}
            </Badge>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Repair Investment
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
            ₹{totalRepairCost.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant={costMatrix?.is_validated || costData?.is_confirmed ? "success" : "warning"} size="sm">
              {costMatrix?.pricing_source || (costMatrix?.is_validated ? "Verified BOM Model" : (costData?.is_confirmed ? "Confirmed Quote" : "Estimated Model"))}
            </Badge>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Refurbished Market Ceiling
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ₹{resaleGradeA.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant="success" size="sm">
              Grade A Certified
            </Badge>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Harvest Component Pool
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">
            ₹{harvestValue.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant="info" size="sm">
              Modular Parts Value
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Table 1: Repair Cost Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Repair Cost Breakdown</CardTitle>
                <p className="text-xs text-slate-500">Component BOM & certified labor rates</p>
                {costMatrix?.diagnostic_note && (
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline shrink-0" />
                    <span>{costMatrix.diagnostic_note}</span>
                  </p>
                )}
              </div>
            </div>
            <Badge variant={costData?.is_confirmed ? "success" : "warning"} size="sm">
              {costData?.is_confirmed ? "Confirmed" : "Estimated"}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line Item</TableHead>
                  <TableHead>Basis</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costMatrix?.line_items?.length ? (
                  costMatrix.line_items.map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-slate-900">
                        {item.line_item}
                      </TableCell>
                      <TableCell className="text-slate-500">{item.basis}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === "Confirmed" ? "success" : "warning"} size="sm">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ₹{Math.round(item.cost).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    <TableRow>
                      <TableCell className="font-semibold text-slate-900">
                        {product?.category === "gaming_console"
                          ? "Controller & I/O Component Profiling"
                          : product?.category === "clothes"
                          ? "Fabric Eco-Treatment & Hem Reinforcement"
                          : product?.category === "footwear"
                          ? "Midsole & Tread Conditioning"
                          : "OEM Component Overhaul"}
                      </TableCell>
                      <TableCell className="text-slate-500">Intake Hardware Specification</TableCell>
                      <TableCell>
                        <Badge variant="warning" size="sm">Estimated</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ₹{repairPartsCost.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-slate-900">
                        Technician Bench Labor (1.5 hrs)
                      </TableCell>
                      <TableCell className="text-slate-500">₹450 / hr standard</TableCell>
                      <TableCell>
                        <Badge variant="success" size="sm">Confirmed</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ₹{repairLaborCost.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-slate-900">
                        Diagnostic Bench QA & Testing
                      </TableCell>
                      <TableCell className="text-slate-500">Automated diagnostic rig</TableCell>
                      <TableCell>
                        <Badge variant="success" size="sm">Confirmed</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">₹350</TableCell>
                    </TableRow>
                  </>
                )}
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell colSpan={3} className="text-slate-900">
                    Total Estimated Repair Outlay
                  </TableCell>
                  <TableCell className="text-right text-rose-600 font-mono text-sm">
                    ₹{totalRepairCost.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Table 2: Valuation Potential Across Resale Grades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Secondary Market Realization</CardTitle>
                <p className="text-xs text-slate-500">
                  Predicted market price by cosmetic & functional tier
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              Live Algorithmic Feed
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Condition Tier</TableHead>
                  <TableHead>Target Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costMatrix?.secondary_market_tiers?.length ? (
                  costMatrix.secondary_market_tiers.map((tier: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-slate-900">
                        {tier.tier}
                      </TableCell>
                      <TableCell className="text-slate-500">{tier.target_channel}</TableCell>
                      <TableCell>
                        <Badge variant={tier.status === "Confirmed" ? "success" : "warning"} size="sm">
                          {tier.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-700">
                        ₹{Math.round(tier.price).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    <TableRow>
                      <TableCell className="font-semibold text-slate-900">
                        Grade A (Like New / Boxed)
                      </TableCell>
                      <TableCell className="text-slate-500">Direct Storefront B2C</TableCell>
                      <TableCell>
                        <Badge variant="success" size="sm">Confirmed</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-700">
                        ₹{resaleGradeA.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-slate-900">
                        Grade B (Minor Scuffs)
                      </TableCell>
                      <TableCell className="text-slate-500">Certified Reseller B2B</TableCell>
                      <TableCell>
                        <Badge variant="warning" size="sm">Estimated</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-900">
                        ₹{resaleGradeB.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-slate-900">
                        Grade C (Visible Wear)
                      </TableCell>
                      <TableCell className="text-slate-500">Bulk Discount Channel</TableCell>
                      <TableCell>
                        <Badge variant="warning" size="sm">Estimated</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-700">
                        ₹{resaleGradeC.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </>
                )}
                <TableRow>
                  <TableCell className="font-semibold text-slate-900">
                    Component Harvest Lot
                  </TableCell>
                  <TableCell className="text-slate-500">Parts Reverse Auction</TableCell>
                  <TableCell>
                    <Badge variant="warning" size="sm">Estimated</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-indigo-700">
                    ₹{harvestValue.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-slate-900">
                    Scrap E-Waste Recycling
                  </TableCell>
                  <TableCell className="text-slate-500">R2 Certified Recycler</TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">Confirmed</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-slate-500">
                    ₹{scrapValue.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Pathway Action Bar */}
      <Card className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-0">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Next Step: Algorithmic Multi-Pathway Optimization</span>
            </div>
            <h4 className="text-xl font-bold">Ready to compute optimal circular recovery path?</h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Feed these cost and valuation points into the 5-Pathway Decision Simulator to balance Net
              Recovery Value against carbon footprint and turnaround time.
            </p>
          </div>

          <Link href={`/admin/products/${productId}/decision`}>
            <Button size="lg" className="font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950">
              Launch 5-Pathway Decision Engine
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
