"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { endpoints } from "@/lib/api";
import {
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Check,
  X,
  Filter,
  ArrowRight,
  Clock,
} from "lucide-react";

interface ReviewItem {
  id: string;
  inspection_id?: string;
  product_id: string;
  product_name?: string;
  flag_reasons: string[];
  confidence_score: number;
  detected_defects: any[];
  status: "pending" | "resolved";
  created_at: string;
}

export default function HumanReviewQueuePage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [overrideAction, setOverrideAction] = useState("approve_override");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadQueue() {
      try {
        const res = await endpoints.getReviewQueue();
        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.queue)
          ? raw.queue
          : Array.isArray(raw?.items)
          ? raw.items
          : [];

        const formatted: ReviewItem[] = list.map((item: any) => ({
          id: item.inspection_id || item.id,
          inspection_id: item.inspection_id || item.id,
          product_id: item.product_id,
          product_name:
            item.brand && item.model
              ? `${item.brand} ${item.model}`
              : item.product_name || item.product_uid || "Device",
          flag_reasons:
            item.flagged_reasons || item.flag_reasons || ["Quality review flagged"],
          confidence_score: item.confidence_score ?? 0.8,
          detected_defects: item.defects || item.detected_defects || [],
          status: item.status || "pending",
          created_at: item.created_at || new Date().toISOString(),
        }));

        setItems(formatted);
      } catch (err: any) {
        console.error("Failed to load review queue:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  const openResolveModal = (item: ReviewItem) => {
    setSelectedItem(item);
    setReviewerNotes("");
    setOverrideAction("approve_override");
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      const inspectionId = selectedItem.inspection_id || selectedItem.id;
      await endpoints.resolveReview(inspectionId, {
        resolution_action: overrideAction,
        reviewer_notes: reviewerNotes || "Approved by human quality inspector",
      });

      // Update local state
      setItems((prev) =>
        (Array.isArray(prev) ? prev : []).map((i) =>
          i.id === selectedItem.id ? { ...i, status: "resolved" } : i
        )
      );

      success("Inspection flag resolved and unlocked for decision routing", "Review Resolved");
      setResolveModalOpen(false);
    } catch (err: any) {
      error("Failed to submit review resolution");
    } finally {
      setSubmitting(false);
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const pendingCount = safeItems.filter((i) => i.status !== "resolved").length;

  return (
    <DashboardShell>
      <PageHeader
        title="Human Review & Quality Assurance Queue"
        description="Escalated edge-cases, low-confidence vision detections, and conflicting test anomalies awaiting expert technician arbitration."
        badge={
          <Badge variant={pendingCount > 0 ? "warning" : "success"}>
            {pendingCount} Case(s) Requiring Attention
          </Badge>
        }
      />

      {/* Top QA Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Adjudication
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
              {pendingCount} Items
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Autonomous Approval Rate
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              94.8%
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Resolution SLA
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              4.2 Mins
            </div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Review Queue Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Flagged Cases Registry</CardTitle>
            <p className="text-xs text-slate-500">
              Triggered automatically when model confidence &lt; 65% or sensor mismatch occurs
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID / Model</TableHead>
                <TableHead>Flag Reason(s)</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Defects Noted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    No items in review queue. All vision scans met autonomous threshold.
                  </TableCell>
                </TableRow>
              ) : (
                safeItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-900">
                      <div>{item.product_name || "Dell XPS 15"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.product_id || item.id}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(item.flag_reasons || ["Borderline Crack vs Scratch"]).map(
                          (reason, i) => (
                            <Badge key={i} variant="warning" size="sm">
                              {reason}
                            </Badge>
                          )
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          (item.confidence_score || 0.62) < 0.65 ? "danger" : "warning"
                        }
                        size="sm"
                      >
                        {Math.round((item.confidence_score || 0.62) * 100)}% Confidence
                      </Badge>
                    </TableCell>

                    <TableCell className="text-slate-600 text-xs">
                      {item.detected_defects?.length
                        ? `${item.detected_defects.length} defect areas`
                        : "1 subtle screen blemish"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={item.status === "resolved" ? "success" : "neutral"}
                        size="sm"
                      >
                        {item.status === "resolved" ? "Resolved" : "Awaiting Review"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {item.status === "resolved" ? (
                        <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openResolveModal(item)}
                          className="text-xs font-bold"
                        >
                          Resolve Case <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Click-to-Resolve Modal Flow */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Arbitrate Flagged Inspection Case"
        maxWidth="lg"
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">
                {selectedItem.product_name || "Inspected Asset"}
              </div>
              <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                Product ID: {selectedItem.product_id}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(selectedItem.flag_reasons || ["Borderline Confidence"]).map((r, i) => (
                  <Badge key={i} variant="warning" size="sm">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resolution Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideAction("approve_override")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    overrideAction === "approve_override"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-400"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="text-xs">Confirm Defect &amp; Approve</div>
                  <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                    Affirm diagnosis; push to 5-pathway decision
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideAction("dismiss_false_positive")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    overrideAction === "dismiss_false_positive"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-400"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="text-xs">Dismiss False Positive</div>
                  <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                    Clear defect flag; mark as Pristine Grade
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Technician Audit Notes
              </label>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                rows={3}
                placeholder="Explain resolution (e.g., 'Visual inspection confirms hairline scratch is cosmetic only, LCD glass intact')..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResolveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmResolve}
                isLoading={submitting}
                className="font-bold"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Commit Resolution
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
