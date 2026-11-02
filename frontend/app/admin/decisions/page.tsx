"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { endpoints } from "@/lib/api";
import { Layers, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function DecisionsOverviewPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await endpoints.getProducts({ limit: 25 });
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
        title="5-Pathway Decision Engine Hub"
        description="Review algorithmic pathway recommendations, adjust business criteria weights, and commit execution routing."
        badge={<Badge variant="success">Engine v2.4 Active</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Decision Pipeline</CardTitle>
          <p className="text-xs text-slate-500">Select any device to launch the interactive What-If simulator</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Intake Status</TableHead>
                <TableHead>Recommended Pathway</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id || p.id}>
                  <TableCell className="font-semibold text-slate-900">
                    <div>{p.brand} {p.model}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.product_uid}</div>
                  </TableCell>
                  <TableCell className="capitalize">{p.category}</TableCell>
                  <TableCell>
                    <Badge variant="info" size="sm">
                      {p.status || "inspected"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">
                      Direct Resale (Recommended)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/products/${p._id || p.id}/decision`}>
                      <Button size="sm" className="text-xs font-bold">
                        Open Simulator <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
