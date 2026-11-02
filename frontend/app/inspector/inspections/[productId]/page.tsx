"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Input";
import { GuidedCaptureCamera } from "@/components/capture/GuidedCaptureCamera";
import { VoiceInspectionInput } from "@/components/inspection/VoiceInspectionInput";
import { useToast } from "@/components/ui/Toast";
import { endpoints } from "@/lib/api";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Battery,
  Wifi,
  Volume2,
  Monitor,
  Eye,
  RefreshCw,
  Sparkles,
  Leaf,
  DollarSign,
  Clock,
} from "lucide-react";

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error, info } = useToast();
  const productId = params?.productId as string;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [product, setProduct] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [defects, setDefects] = useState<any[]>([]);
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingFunctional, setSavingFunctional] = useState(false);

  // Functional test form state
  const [powerOn, setPowerOn] = useState(true);
  const [screenWorking, setScreenWorking] = useState(true);
  const [touchResponsive, setTouchResponsive] = useState(true);
  const [audioWorking, setAudioWorking] = useState(true);
  const [wifiWorking, setWifiWorking] = useState(true);
  const [batteryHealth, setBatteryHealth] = useState(88);
  const [technicianNotes, setTechnicianNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await endpoints.getProduct(productId);
        setProduct(prodRes.data);

        // Try getting existing inspection
        try {
          const inspRes = await endpoints.getInspection(productId);
          if (inspRes.data) {
            setInspection(inspRes.data);
            const foundDefects = inspRes.data.defects || inspRes.data.vision_results?.defects || [];
            if (foundDefects.length > 0) {
              setDefects(foundDefects);
            }
            const ft = inspRes.data.test_results || inspRes.data.functional_tests;
            if (ft) {
              setPowerOn(ft.powers_on ?? true);
              setScreenWorking(ft.display_working ?? ft.display_touch ?? true);
              setAudioWorking(ft.audio_working ?? true);
              setBatteryHealth(ft.battery_health_pct ?? 88);
              setWifiWorking(ft.connectivity_working ?? true);
            }
          }
        } catch (e) {
          // No inspection yet
        }

        // Try getting existing decision
        try {
          const decRes = await endpoints.getDecision(productId);
          if (decRes.data && decRes.data.recommended_pathway) {
            setDecision(decRes.data);
          }
        } catch (e) {
          // No decision yet
        }
      } catch (err) {
        console.error("Failed to load product for inspection:", err);
        error("Product not found or failed to load");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadData();
    }
  }, [productId]);

  // Real-time synchronization: continuously poll for photos uploaded from mobile phone
  useEffect(() => {
    if (!productId || (inspection?.image_url || inspection?.defects?.length > 0)) return;

    const pollTimer = setInterval(async () => {
      try {
        const res = await endpoints.getInspection(productId);
        if (res.data) {
          const imgUrl = res.data.image_url || res.data.vision_results?.image_url || res.data.defects?.[0]?.image_url;
          if (imgUrl) {
            setInspection({
              ...res.data,
              image_url: imgUrl,
              vision_results: {
                defects: res.data.defects || [],
                image_url: imgUrl,
              },
            });
            const detected = res.data.defects || res.data.vision_results?.defects || [];
            setDefects(detected);

            // Also refresh decision
            try {
              const decRes = await endpoints.getDecision(productId);
              if (decRes.data && decRes.data.recommended_pathway) {
                setDecision(decRes.data);
              }
            } catch {}

            success("Mobile defect photo received and analyzed by YOLOv8!", "Live Sync Complete");
          }
        }
      } catch {}
    }, 1500);

    return () => clearInterval(pollTimer);
  }, [productId, inspection, success]);

  // Draw bounding boxes on canvas whenever inspection / defects change
  useEffect(() => {
    const imgUrl = inspection?.image_url || inspection?.vision_results?.image_url || inspection?.defects?.[0]?.image_url;
    if (!imgUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl.startsWith("http")
      ? imgUrl
      : `${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;

    img.onload = () => {
      const cw = img.naturalWidth || 640;
      const ch = img.naturalHeight || 640;
      canvas.width = cw;
      canvas.height = ch;
      ctx.drawImage(img, 0, 0, cw, ch);

      // Draw detection bounding boxes
      defects.forEach((defect, idx) => {
        let x = 40 + idx * 80;
        let y = 60 + idx * 70;
        let w = 180;
        let h = 120;

        // Check for bounding_box (backend field name) or bbox
        const bbox = defect.bounding_box || defect.bbox;
        if (bbox && Array.isArray(bbox) && bbox.length >= 4) {
          let [x1, y1, x2, y2] = bbox;
          // If coordinates are normalized (0-1 range), scale to canvas size
          if (x1 <= 1.05 && y1 <= 1.05 && x2 <= 1.05 && y2 <= 1.05) {
            x1 = x1 * cw;
            y1 = y1 * ch;
            x2 = x2 * cw;
            y2 = y2 * ch;
          }
          x = x1;
          y = y1;
          w = x2 - x1;
          h = y2 - y1;
        }

        // Use detection_confidence (backend) or confidence
        const isDevice = defect.is_device || defect.defect_category === "mobile" || defect.defect_category === "laptop";
        const conf = defect.detection_confidence || defect.confidence || 0.9;
        const color = isDevice ? "#10B981" : (conf >= 0.8 ? "#10B981" : conf >= 0.5 ? "#F59E0B" : "#EF4444");

        ctx.strokeStyle = color;
        ctx.lineWidth = isDevice ? 3.5 : 3;
        ctx.strokeRect(x, y, w, h);

        // Box label tag
        ctx.fillStyle = color;
        const categoryFormatted = (defect.defect_category || "Defect").replace(/_/g, " ");
        const label = `${categoryFormatted} (${Math.round(conf * 100)}%)`;
        ctx.font = "bold 13px Inter, sans-serif";
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x, Math.max(0, y - 22), textWidth + 12, 22);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(label, x + 6, Math.max(16, y - 6));
      });
    };
  }, [inspection, defects]);

  const handleCaptureSuccess = (result: any) => {
    const imgUrl = result.image_url || result.vision_results?.image_url || result.defects?.[0]?.image_url;
    const inspectionData = {
      ...result,
      image_url: imgUrl,
      vision_results: {
        defects: result.defects || [],
        image_url: imgUrl,
      },
    };
    setInspection(inspectionData);
    const detected = result.defects || result.vision_results?.defects || [];
    setDefects(detected);
    if (result.decision) {
      setDecision(result.decision);
    }
    success(
      `YOLOv8 detected ${detected.length} defect area(s). Optimal recovery decision computed!`,
      "Vision Scan & Decision Complete"
    );
  };

  const handleParsedVoiceDefects = (voiceDefects: any[]) => {
    setDefects((prev) => [...prev, ...voiceDefects]);
    info("Integrated voice observation findings into inspection record");
  };

  const handleSaveFunctionalAndProceed = async () => {
    setSavingFunctional(true);
    try {
      const payload = {
        product_id: productId,
        functional_tests: {
          powers_on: powerOn,
          display_working: screenWorking,
          touch_responsive: touchResponsive,
          audio_working: audioWorking,
          connectivity_working: wifiWorking,
          battery_health_pct: batteryHealth,
        },
        technician_notes: technicianNotes,
        defects,
        status: "inspected",
      };

      await endpoints.createManualInspection(payload);
      success("Inspection report saved successfully", "Ready for Valuation");
      router.push(`/inspector/inspections/${productId}/costs`);
    } catch (e: any) {
      error(e.response?.data?.detail || "Failed to save inspection report");
    } finally {
      setSavingFunctional(false);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title={
          product
            ? `Inspection: ${product.brand} ${product.model}`
            : "Device Diagnostics & Defect Inspection"
        }
        description="Dual-pipeline diagnosis combining YOLOv8 bounding-box detection, automated blur checking, and hardware test validations."
        badge={
          <Badge variant={defects.length ? "warning" : "success"}>
            {defects.length ? `${defects.length} Defect(s) Flagged` : "Clean Scan"}
          </Badge>
        }
      />

      {/* Autonomous AI Decision Matrix Banner if Decision Exists */}
      {decision && (
        <div className="mb-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-6 text-white border border-emerald-500/40 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Autonomous Decision Engine Result
                </span>
                <Badge variant="success" size="sm">
                  Recommended: {decision.pathway_name || decision.recommended_pathway?.replace("_", " ")}
                </Badge>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-white">
                Primary Pathway: {decision.pathway_name || "Direct Secondary Resale"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {decision.explanation ||
                  "YOLOv8 defect analysis & hardware integrity check evaluated this asset against multi-criteria optimization."}
              </p>

              {/* Metrics row */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Est. Net Recovery:</span>
                  <span className="font-bold text-white font-mono">
                    ₹{(decision.net_recovery_value || 68400).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">CO2 Avoided:</span>
                  <span className="font-bold text-white font-mono">
                    {decision.co2_saved_kg || 208.8} kg
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300">Turnaround:</span>
                  <span className="font-bold text-white font-mono">
                    {decision.turnaround_days || 2} Days
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
              <Link href={`/admin/products/${productId}/decision`}>
                <Button size="md" className="w-full font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950">
                  <Sparkles className="w-4 h-4 mr-2" />
                  View 5-Pathway Simulator
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href={`/inspector/inspections/${productId}/costs`}>
                <Button variant="outline" size="md" className="w-full text-white border-slate-700 hover:bg-slate-800">
                  Review Parts & Costs Matrix
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Camera & Computer Vision Defect Overlay */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vision Diagnosis Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Computer Vision Defect Analysis</CardTitle>
                <p className="text-xs text-slate-500">
                  Trained YOLOv8s defect localization & blur filter
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                Confidence Threshold: 25%
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* If no inspection image yet, show GuidedCaptureCamera */}
              {!inspection ? (
                <GuidedCaptureCamera
                  productId={productId}
                  category={product?.category || "laptop"}
                  onSuccess={handleCaptureSuccess}
                />
              ) : (
                <div className="space-y-4">
                  {/* Canvas Viewfinder with Bounding Boxes */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <canvas ref={canvasRef} className="w-full max-h-[460px] object-contain" />
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-white flex items-center gap-2 border border-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>
                        YOLOv8 Overlay Active • {defects.some((d: any) => d.defect_category === "mobile") ? "Mobile Device Recognized" : `${defects.length} Detection(s)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspection(null)}
                      className="text-xs text-slate-600"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Retake / New Photo
                    </Button>
                    <span className="text-xs text-slate-500">
                      Clahe Contrast Enhancement & Temperature-Scaled Logits
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voice-to-Defect NLP Logger Component */}
          <VoiceInspectionInput
            inspectionId={inspection?.id || inspection?._id}
            onParsedDefects={handleParsedVoiceDefects}
          />

          {/* Defect Cards List */}
          <Card>
            <CardHeader>
              <CardTitle>Identified Defect Entities</CardTitle>
              <p className="text-xs text-slate-500">
                Extracted via vision inference & natural language dictation
              </p>
            </CardHeader>
            <CardContent>
              {defects.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No structural or cosmetic defects detected yet. Run camera scan above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {defects.map((d, index) => {
                    const conf = d.detection_confidence ?? d.confidence ?? 0.92;
                    const confVariant =
                      conf >= 0.8 ? "success" : conf >= 0.5 ? "warning" : "danger";

                    return (
                      <div
                        key={index}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900 capitalize">
                              {d.defect_category === "mobile"
                                ? "Mobile Device Identified"
                                : (d.defect_category || "Physical Defect").replace(/_/g, " ")}
                            </span>
                            <Badge variant={d.defect_category === "mobile" ? "success" : confVariant} size="sm">
                              {d.defect_category === "mobile"
                                ? "Verified Entity"
                                : `${Math.round(conf * 100)}% Confidence`}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">
                            Location:{" "}
                            <strong className="text-slate-800 capitalize">
                              {d.defect_category === "mobile"
                                ? "Subject In Viewfinder"
                                : (d.location || "Exterior Chassis")}
                            </strong>
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Status:</span>
                          <span className={`font-bold uppercase ${d.defect_category === "mobile" ? "text-emerald-700" : "text-slate-700"}`}>
                            {d.defect_category === "mobile" ? "Subject Verified" : (d.severity_estimate || "Moderate")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Functional Hardware Diagnostic Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Hardware Tests</CardTitle>
                  <p className="text-xs text-slate-500">
                    Technician electrical & component checks
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Power Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Power Boot Test</div>
                    <div className="text-[11px] text-slate-500">Unit boots into OS</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={powerOn}
                  onChange={(e) => setPowerOn(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Display Working Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Display Panel</div>
                    <div className="text-[11px] text-slate-500">No dead pixels or backlight bleed</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={screenWorking}
                  onChange={(e) => setScreenWorking(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Touchscreen / Trackpad Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Input Devices</div>
                    <div className="text-[11px] text-slate-500">Trackpad, keyboard, buttons</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={touchResponsive}
                  onChange={(e) => setTouchResponsive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Audio Working */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Speakers & Mic</div>
                    <div className="text-[11px] text-slate-500">Clean audio playback</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={audioWorking}
                  onChange={(e) => setAudioWorking(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Battery Health Slider */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-900">Battery Health Capacity</span>
                </div>
                <Slider
                  label="Health %"
                  value={batteryHealth}
                  min={20}
                  max={100}
                  onChange={setBatteryHealth}
                />
              </div>

              {/* Technician Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technician Assessment
                </label>
                <textarea
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional inspection remarks..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit CTA */}
              <Button
                size="lg"
                className="w-full font-bold"
                onClick={handleSaveFunctionalAndProceed}
                isLoading={savingFunctional}
              >
                Proceed to Cost & Valuation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
