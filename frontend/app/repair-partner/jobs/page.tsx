"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { Wrench, CheckCircle2, Clock, Check, Layers, AlertCircle } from "lucide-react";

interface RepairJob {
  id: string;
  device: string;
  serial: string;
  defectsNoted: string[];
  partsRequired: string[];
  status: "dispatched" | "in_progress" | "qa_pending" | "completed";
  estimatedHours: number;
}

const DEMO_JOBS: RepairJob[] = [
  {
    id: "job-801",
    device: "Dell XPS 13 9310",
    serial: "SN-938210",
    defectsNoted: ["Screen crack along right bezel edge"],
    partsRequired: ["13.4\" InfinityEdge FHD+ Panel (OEM)"],
    status: "in_progress",
    estimatedHours: 2.5,
  },
  {
    id: "job-802",
    device: "MacBook Pro 14 (M1 Pro)",
    serial: "SN-482019",
    defectsNoted: ["Missing spacebar keycap", "Trackpad haptic degraded"],
    partsRequired: ["Keycap set", "Force Touch trackpad module"],
    status: "dispatched",
    estimatedHours: 1.5,
  },
  {
    id: "job-803",
    device: "Samsung Galaxy S22 Ultra",
    serial: "IMEI-84920194820",
    defectsNoted: ["Shattered rear camera lens ring", "Back glass scuffed"],
    partsRequired: ["Rear glass backplate", "Camera lens module"],
    status: "qa_pending",
    estimatedHours: 1.0,
  },
];

export default function RepairJobsPage() {
  const { success } = useToast();
  const [jobs, setJobs] = useState<RepairJob[]>(DEMO_JOBS);

  const handleUpdateStatus = (id: string, newStatus: RepairJob["status"]) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
    );
    success(`Job ${id} updated to ${newStatus.replace("_", " ")}!`, "Status Updated");
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Assigned Diagnostic Repair Bench"
        description="Hardware service tickets dispatched by the 5-pathway decision engine with exact parts manifests."
        badge={<Badge variant="success">Station Bench #02 Active</Badge>}
      />

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border-slate-200 shadow-xs">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{job.id}</span>
                    <Badge
                      variant={
                        job.status === "completed"
                          ? "success"
                          : job.status === "in_progress"
                          ? "info"
                          : job.status === "qa_pending"
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {job.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{job.device}</h3>
                  <div className="text-xs text-slate-500 font-mono">Serial: {job.serial}</div>

                  <div className="pt-2 text-xs space-y-1">
                    <div className="text-slate-700">
                      <strong>Defects Manifest:</strong> {job.defectsNoted.join(", ")}
                    </div>
                    <div className="text-emerald-800">
                      <strong>Parts Assigned:</strong> {job.partsRequired.join(", ")}
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {job.status === "dispatched" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(job.id, "in_progress")}
                      className="font-bold text-xs"
                    >
                      Start Bench Work
                    </Button>
                  )}

                  {job.status === "in_progress" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(job.id, "qa_pending")}
                      className="font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Submit for QA Vision Scan
                    </Button>
                  )}

                  {job.status === "qa_pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(job.id, "completed")}
                      className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve &amp; Close Ticket
                    </Button>
                  )}

                  {job.status === "completed" && (
                    <Badge variant="success" size="lg">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Ready for Grade A Listing
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
