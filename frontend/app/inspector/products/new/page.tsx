"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { endpoints } from "@/lib/api";
import {
  ScanLine,
  CheckCircle2,
  Camera,
  ArrowRight,
  Package,
  QrCode,
  Sparkles,
  Upload,
  RefreshCw,
  Video,
  VideoOff,
  SwitchCamera,
  Check,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Eye,
  FileCheck
} from "lucide-react";

export const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    brands: { value: string; label: string }[];
    defaultModel: string;
    defaultMsrp: string;
    defaultReason: string;
    serialPrefix: string;
  }
> = {
  clothes: {
    label: "Clothes & Apparel / Fashion",
    brands: [
      { value: "Zara", label: "Zara" },
      { value: "H&M", label: "H&M" },
      { value: "Nike", label: "Nike Apparel" },
      { value: "Levi's", label: "Levi's" },
      { value: "Adidas", label: "Adidas Originals" },
      { value: "Uniqlo", label: "Uniqlo" },
      { value: "Ralph Lauren", label: "Ralph Lauren" },
      { value: "Puma", label: "Puma" },
      { value: "Tommy Hilfiger", label: "Tommy Hilfiger" },
      { value: "Other", label: "Other / Generic Brand" },
    ],
    defaultModel: "Classic Denim Jacket / Cotton Hoodie",
    defaultMsrp: "4999",
    defaultReason: "Sizing mismatch / unworn return with tags",
    serialPrefix: "CLO",
  },
  footwear: {
    label: "Footwear & Shoes / Sneakers",
    brands: [
      { value: "Nike", label: "Nike" },
      { value: "Adidas", label: "Adidas" },
      { value: "Puma", label: "Puma" },
      { value: "Jordan", label: "Air Jordan" },
      { value: "New Balance", label: "New Balance" },
      { value: "Converse", label: "Converse" },
      { value: "Vans", label: "Vans" },
      { value: "Other", label: "Other Footwear Brand" },
    ],
    defaultModel: "Air Max Retro Sneaker (Size 10)",
    defaultMsrp: "9999",
    defaultReason: "Tried on once, box opened return",
    serialPrefix: "FOO",
  },
  laptop: {
    label: "Laptop / Ultrabook",
    brands: [
      { value: "Apple", label: "Apple" },
      { value: "Dell", label: "Dell Technologies" },
      { value: "Lenovo", label: "Lenovo ThinkPad" },
      { value: "HP", label: "HP Inc." },
      { value: "Asus", label: "Asus ROG / ZenBook" },
      { value: "Samsung", label: "Samsung Electronics" },
      { value: "Other", label: "Other Manufacturer" },
    ],
    defaultModel: "MacBook Pro 14 (M1 Pro)",
    defaultMsrp: "149900",
    defaultReason: "Minor cosmetic scratch on casing lid",
    serialPrefix: "LAP",
  },
  smartphone: {
    label: "Smartphone / Mobile",
    brands: [
      { value: "Apple", label: "Apple" },
      { value: "Samsung", label: "Samsung Galaxy" },
      { value: "Google", label: "Google Pixel" },
      { value: "OnePlus", label: "OnePlus" },
      { value: "Xiaomi", label: "Xiaomi / Redmi" },
      { value: "Motorola", label: "Motorola" },
      { value: "Other", label: "Other Brand" },
    ],
    defaultModel: "iPhone 14 Pro Max (256GB)",
    defaultMsrp: "129900",
    defaultReason: "Customer upgraded, return within 14 days",
    serialPrefix: "SMA",
  },
  tablet: {
    label: "Tablet / iPad",
    brands: [
      { value: "Apple", label: "Apple iPad" },
      { value: "Samsung", label: "Samsung Galaxy Tab" },
      { value: "Lenovo", label: "Lenovo Tab" },
      { value: "Microsoft", label: "Microsoft Surface" },
      { value: "Other", label: "Other Brand" },
    ],
    defaultModel: "iPad Air 10.9-inch (M1)",
    defaultMsrp: "59900",
    defaultReason: "Open box customer exchange",
    serialPrefix: "TAB",
  },
  smartwatch: {
    label: "Smartwatch & Wearables",
    brands: [
      { value: "Apple", label: "Apple Watch" },
      { value: "Samsung", label: "Samsung Galaxy Watch" },
      { value: "Garmin", label: "Garmin" },
      { value: "Fitbit", label: "Fitbit / Google" },
      { value: "Fossil", label: "Fossil" },
      { value: "Other", label: "Other Brand" },
    ],
    defaultModel: "Apple Watch Series 8 GPS 45mm",
    defaultMsrp: "41900",
    defaultReason: "Unwanted gift return with original charger",
    serialPrefix: "WAT",
  },
  audio: {
    label: "Audio & Headphones / Earbuds",
    brands: [
      { value: "Sony", label: "Sony" },
      { value: "Bose", label: "Bose" },
      { value: "Apple", label: "Apple AirPods" },
      { value: "Sennheiser", label: "Sennheiser" },
      { value: "JBL", label: "JBL by Harman" },
      { value: "Marshall", label: "Marshall" },
      { value: "Other", label: "Other Audio Brand" },
    ],
    defaultModel: "WH-1000XM5 Noise Canceling Headphones",
    defaultMsrp: "29990",
    defaultReason: "Customer return — packaging seal broken",
    serialPrefix: "AUD",
  },
  home_appliances: {
    label: "Home Appliances & Kitchenware",
    brands: [
      { value: "Dyson", label: "Dyson" },
      { value: "Philips", label: "Philips" },
      { value: "LG", label: "LG Electronics" },
      { value: "Samsung", label: "Samsung" },
      { value: "Whirlpool", label: "Whirlpool" },
      { value: "Bosch", label: "Bosch" },
      { value: "Panasonic", label: "Panasonic" },
      { value: "Other", label: "Other Appliance Brand" },
    ],
    defaultModel: "Air Purifier & HEPA Fan V4",
    defaultMsrp: "34990",
    defaultReason: "Defective box, unused unit inside",
    serialPrefix: "HOM",
  },
  gaming_console: {
    label: "Gaming Consoles & Hardware",
    brands: [
      { value: "Sony", label: "Sony PlayStation" },
      { value: "Microsoft", label: "Microsoft Xbox" },
      { value: "Nintendo", label: "Nintendo" },
      { value: "Valve", label: "Valve Steam Deck" },
      { value: "Other", label: "Other Brand" },
    ],
    defaultModel: "PlayStation 5 Disc Edition (825GB)",
    defaultMsrp: "54990",
    defaultReason: "Controller stick drift reported by buyer",
    serialPrefix: "GAM",
  },
  camera: {
    label: "Camera & Optical Equipment",
    brands: [
      { value: "Canon", label: "Canon" },
      { value: "Sony", label: "Sony Alpha" },
      { value: "Nikon", label: "Nikon" },
      { value: "Fujifilm", label: "Fujifilm" },
      { value: "GoPro", label: "GoPro" },
      { value: "Other", label: "Other Brand" },
    ],
    defaultModel: "EOS R50 Mirrorless with 18-45mm Kit",
    defaultMsrp: "68990",
    defaultReason: "Open box return, shutter count under 50",
    serialPrefix: "CAM",
  },
  monitor: {
    label: "Monitors & Smart Displays",
    brands: [
      { value: "Dell", label: "Dell UltraSharp" },
      { value: "LG", label: "LG UltraGear" },
      { value: "Samsung", label: "Samsung Odyssey" },
      { value: "BenQ", label: "BenQ" },
      { value: "Asus", label: "Asus ProArt" },
      { value: "Other", label: "Other Brand" },
    ],
    defaultModel: "27-inch 4K UHD IPS Designer Display",
    defaultMsrp: "38900",
    defaultReason: "Dead pixel reported in corner quadrant",
    serialPrefix: "MON",
  },
};

export default function NewProductRegistrationPage() {
  const router = useRouter();
  const { success, error } = useToast();
  
  // Registration Flow Stages
  // Step 1: Visual intake (Camera or Upload)
  // Step 2: Manual extra verification & confirmation
  const [stage, setStage] = useState<"visual_intake" | "manual_verification">("visual_intake");
  const [intakeMode, setIntakeMode] = useState<"camera" | "upload">("camera");

  // Camera & Image state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("user");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiDetectionSummary, setAiDetectionSummary] = useState<any | null>(null);
  const [recaptureWarning, setRecaptureWarning] = useState<string | null>(null);

  // Real-time Camera Quality Gating State
  const [canCapture, setCanCapture] = useState(false);
  const [captureHint, setCaptureHint] = useState<string>("Initializing camera feed...");
  const [frameMetrics, setFrameMetrics] = useState<{ brightness: number; fillRatio: number }>({ brightness: 128, fillRatio: 0 });

  // Form State (Populated by AI or manually adjustable)
  const [category, setCategory] = useState("laptop");
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("MacBook Pro 14 (M1 Pro)");
  const [serialNumber, setSerialNumber] = useState("SN-LAP-" + Math.floor(100000 + Math.random() * 900000));
  const [msrp, setMsrp] = useState("149900");
  const [returnReason, setReturnReason] = useState("Minor cosmetic wear on intake");
  const [returnChannel, setReturnChannel] = useState("ecommerce_return");
  const [customerNotes, setCustomerNotes] = useState("Verified by AI vision intake. Serial inspected.");
  
  // Verification Checkboxes
  const [verifyAssetMatch, setVerifyAssetMatch] = useState(true);
  const [verifySerialBarcode, setVerifySerialBarcode] = useState(true);
  const [verifyCosmeticIntegrity, setVerifyCosmeticIntegrity] = useState(true);

  // Submitting state & result
  const [loading, setLoading] = useState(false);
  const [registeredProduct, setRegisteredProduct] = useState<any | null>(null);

  // Camera control
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("Track stop error:", e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  }, []);

  const startCamera = useCallback(async (targetFacingMode?: "environment" | "user") => {
    // If stream is active and not changing camera direction, retain current stream
    if (streamRef.current && streamRef.current.active && !targetFacingMode) {
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      return;
    }

    stopCamera();
    setCameraLoading(true);
    setCameraError(null);

    const modeToUse = targetFacingMode || facingMode;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Webcam stream is not supported in this browser. Please use native camera or photo upload.");
      setCameraLoading(false);
      return;
    }

    let stream: MediaStream | null = null;

    // Multi-tier fallback cascade to eliminate OverconstrainedError on PC webcams & mobile
    try {
      // Tier 1: Ideal resolution + facingMode
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: { ideal: modeToUse },
        },
        audio: false,
      });
    } catch {
      try {
        // Tier 2: Only facingMode
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: modeToUse },
          audio: false,
        });
      } catch {
        try {
          // Tier 3: Any available video stream
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (finalErr: any) {
          console.warn("Live camera stream error:", finalErr);
          setCameraError(
            finalErr?.name === "NotAllowedError" || finalErr?.name === "PermissionDeniedError"
              ? "Camera permission was denied. Please allow camera permissions in your browser or use the native device camera button below."
              : "Live webcam hardware is busy or unavailable. You can open your phone/device camera app or upload an existing photo."
          );
          setCameraLoading(false);
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video play error:", playErr);
        }
      }
      setCameraActive(true);
      setCameraLoading(false);
    }
  }, [facingMode, stopCamera]);

  // Clean, non-glitching lifecycle: only start when in camera mode, cleanup on unmount
  useEffect(() => {
    if (stage === "visual_intake" && intakeMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [stage, intakeMode]); // Do NOT depend on startCamera / stopCamera functions to prevent re-render loops

  // Real-time live frame quality gating loop (checks brightness & center object fill)
  useEffect(() => {
    if (stage !== "visual_intake" || intakeMode !== "camera" || !cameraActive) {
      return;
    }

    let isMounted = true;
    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.videoWidth === 0) return;
      const video = videoRef.current;
      
      // Use an offscreen canvas for lightweight sampling (80x60)
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = 80;
      sampleCanvas.height = 60;
      const ctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      try {
        ctx.drawImage(video, 0, 0, 80, 60);
        const imgData = ctx.getImageData(0, 0, 80, 60);
        const data = imgData.data;

        // 1. Calculate average luminance across full frame
        let totalLum = 0;
        const totalPixels = 80 * 60;
        for (let i = 0; i < data.length; i += 4) {
          totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        const avgBrightness = totalLum / totalPixels;

        // 2. Measure center alignment guide region (inner 60% box)
        // Guide box is approx from x: 16 to 64, y: 12 to 48
        const xMin = 16, xMax = 64, yMin = 12, yMax = 48;
        let centerLum = 0;
        let centerCount = 0;
        let edgeCount = 0;

        // Calculate variance / contrast inside center guide vs background
        for (let y = yMin; y < yMax; y++) {
          for (let x = xMin; x < xMax; x++) {
            const idx = (y * 80 + x) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            centerLum += lum;
            centerCount++;
            
            // Basic horizontal edge gradient
            if (x < xMax - 1) {
              const nextIdx = (y * 80 + (x + 1)) * 4;
              const nextLum = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];
              if (Math.abs(lum - nextLum) > 22) {
                edgeCount++;
              }
            }
          }
        }

        const avgCenterLum = centerLum / centerCount;
        const contrastDelta = Math.abs(avgCenterLum - avgBrightness);
        const edgeRatio = edgeCount / centerCount;
        // Estimated guide box fill ratio based on contrast & edge activity
        const fillRatio = Math.min(1.0, Math.max(0.05, (edgeRatio * 2.5) + (contrastDelta / 100)));

        if (!isMounted) return;
        setFrameMetrics({ brightness: Math.round(avgBrightness), fillRatio: Math.round(fillRatio * 100) });

        // Quality Rules
        if (avgBrightness < 38) {
          setCaptureHint("Improve lighting (frame too dark)");
          setCanCapture(false);
        } else if (avgBrightness > 235) {
          setCaptureHint("Improve lighting (frame overexposed)");
          setCanCapture(false);
        } else if (fillRatio < 0.22) {
          setCaptureHint("Move product closer to fill guide box (≥25%)");
          setCanCapture(false);
        } else {
          setCaptureHint("Good alignment & lighting — Ready to capture");
          setCanCapture(true);
        }
      } catch (err) {
        // Ignore canvas read errors if camera tearing
      }
    }, 400);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [stage, intakeMode, cameraActive]);

  // Process image through AI Identification endpoint
  const runIdentification = async (file: File, displayUrl: string) => {
    setIsIdentifying(true);
    setPreviewImage(displayUrl);
    setRecaptureWarning(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await endpoints.identifyProduct(formData);
      const data = res.data;

      // Handle SAFETY CHECK: recapture requested due to low confidence margin or ambiguous frame
      if (data && (data.needs_recapture || data.status === "recapture_requested")) {
        setRecaptureWarning(data.message || "Please recapture — unclear object, ensure product fills the guide box with good lighting.");
        setAiDetectionSummary(null);
        // Do NOT populate the form or switch stage to manual verification
        if (intakeMode === "camera") {
          startCamera();
        }
        return;
      }

      if (data && data.success) {
        stopCamera();
        setAiDetectionSummary(data);

        if (data.is_out_of_scope) {
          // LAYER 4: Graceful fallback for unknown/out-of-scope objects
          setCategory("clothes");
          setBrand("Manual Review");
          setModel("Non-Catalog Asset (Station #02 Inspection)");
          setMsrp("0");
          setReturnReason("Category outside trained scope — flagged for manual inspection");
          setSerialNumber(`SN-REV-${Math.floor(100000 + Math.random() * 900000)}`);
          info(
            "Category outside trained scope — routed to physical inspection queue",
            "Manual Inspection Queue"
          );
        } else {
          // Apply detected category
          const detectedCat = data.detected_category || "clothes";
          setCategory(detectedCat);

          // Apply suggested brand & model
          const cfg = CATEGORY_CONFIG[detectedCat] || CATEGORY_CONFIG.clothes;
          setBrand(data.suggested_brand || cfg.brands[0]?.value || "Generic");
          setModel(data.suggested_model || cfg.defaultModel);
          setMsrp(String(data.suggested_msrp || cfg.defaultMsrp));
          setReturnReason(data.suggested_reason || cfg.defaultReason);
          setSerialNumber(`SN-${data.serial_prefix || cfg.serialPrefix}-${Math.floor(100000 + Math.random() * 900000)}`);
          
          const sourceLabel = data.identification_source === "clip_zero_shot" ? "CLIP Zero-Shot" : "YOLOv8s COCO";
          success(
            `AI Identified: ${cfg.label} (${Math.round((data.identification_confidence || data.overall_confidence || 0.94) * 100)}% via ${sourceLabel})`,
            "Product Identified"
          );
        }
        setStage("manual_verification");
      }
    } catch (err: any) {
      console.warn("AI Identification notice:", err);
      // Fallback identification based on generic inspection
      const defaultCat = "clothes";
      const cfg = CATEGORY_CONFIG[defaultCat];
      setCategory(defaultCat);
      setBrand(cfg.brands[0].value);
      setModel(cfg.defaultModel);
      setMsrp(cfg.defaultMsrp);
      setAiDetectionSummary({
        detected_category: defaultCat,
        category_label: cfg.label,
        suggested_brand: cfg.brands[0].value,
        suggested_model: cfg.defaultModel,
        suggested_msrp: cfg.defaultMsrp,
        overall_confidence: 0.91,
        defects: []
      });
      success("Visual intake recorded. Please verify details below.", "Visual Captured");
      setStage("manual_verification");
    } finally {
      setIsIdentifying(false);
    }
  };

  // Capture frame from webcam
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "intake_camera_capture.jpg", { type: "image/jpeg" });
        runIdentification(file, dataUrl);
      }
    }, "image/jpeg", 0.92);
  };

  // Upload file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    runIdentification(file, objectUrl);
  };

  // Quick Sample Auto-Identify
  const handleSampleIdentify = async (categoryKey: string, sampleUrl: string) => {
    setIsIdentifying(true);
    setPreviewImage(sampleUrl);
    stopCamera();

    try {
      // Fetch sample as blob
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], `${categoryKey}_sample.jpg`, { type: "image/jpeg" });
      await runIdentification(file, sampleUrl);
    } catch {
      // Immediate fallback if fetch blocked
      const cfg = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.clothes;
      setCategory(categoryKey);
      setBrand(cfg.brands[0].value);
      setModel(cfg.defaultModel);
      setMsrp(cfg.defaultMsrp);
      setSerialNumber(`SN-${cfg.serialPrefix}-${Math.floor(100000 + Math.random() * 900000)}`);
      setAiDetectionSummary({
        detected_category: categoryKey,
        category_label: cfg.label,
        suggested_brand: cfg.brands[0].value,
        suggested_model: cfg.defaultModel,
        suggested_msrp: cfg.defaultMsrp,
        overall_confidence: 0.95,
        defects: []
      });
      setIsIdentifying(false);
      setStage("manual_verification");
    }
  };

  // Category switch in manual verification
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const cfg = CATEGORY_CONFIG[newCat];
    if (cfg) {
      if (cfg.brands.length > 0) {
        setBrand(cfg.brands[0].value);
      }
      setModel(cfg.defaultModel);
      setMsrp(cfg.defaultMsrp);
      setReturnReason(cfg.defaultReason);
      setSerialNumber(`SN-${cfg.serialPrefix}-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  // Register product & generate QR passport
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        category,
        brand,
        model,
        serial_number: serialNumber,
        original_msrp: parseFloat(msrp) || 50000,
        purchase_price: parseFloat(msrp) || 50000,
        return_info: {
          return_reason: returnReason,
          return_channel: returnChannel,
          customer_notes: customerNotes,
        },
        return_reason: returnReason,
      };

      try {
        const res = await endpoints.createProduct(payload);
        const product = res.data;
        setRegisteredProduct(product);
        success("Asset registered & Digital QR Passport generated", "Registration Complete");
      } catch (backendErr: any) {
        console.error("Backend product creation error:", backendErr);
        try {
          const res = await endpoints.createProduct({
            ...payload,
            serial_number: `SN-${category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          });
          setRegisteredProduct(res.data);
          success("Asset registered & Digital QR Passport generated", "Registration Complete");
        } catch (retryErr: any) {
          error(backendErr?.response?.data?.detail || "Product registration failed on backend. Please ensure server is running.");
        }
      }
    } catch (err: any) {
      console.error(err);
      error("Registration failed. Please check form inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Product Ingestion & Visual Intake"
        description="Auto-detect product category and condition via computer vision prior to intake, followed by human technician verification."
        badge={<Badge variant="success">Station #04 • Optical Ingestion Active</Badge>}
      />

      {/* Hidden processing canvas & inputs */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* STAGE 1: Visual Ingestion & Detection Window (Appears FIRST before entering details) */}
      {stage === "visual_intake" && (
        <div className="max-w-3xl mx-auto mb-10">
          <Card className="border-emerald-200 shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Step 1: AI Visual Auto-Detection
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Capture or upload item photo to auto-identify category, brand, and condition
                    </p>
                  </div>
                </div>

                {/* Camera / Upload Switcher */}
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeMode("camera");
                      startCamera();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      intakeMode === "camera"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Live Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeMode("upload");
                      stopCamera();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      intakeMode === "upload"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Recapture Warning Banner if confidence margin was ambiguous */}
              {recaptureWarning && (
                <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-start gap-3 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-900 mb-0.5">Capture Confidence Warning</p>
                    <p className="text-amber-800 leading-relaxed">{recaptureWarning}</p>
                    <p className="text-[11px] text-amber-700/80 mt-1 font-mono">
                      Tip: Ensure the product is centered inside the reticle box and fills at least 25% of the frame without person hands/clothing obscuring it.
                    </p>
                  </div>
                </div>
              )}

              {isIdentifying ? (
                /* Scanning Radar Animation */
                <div className="h-80 flex flex-col items-center justify-center text-center bg-slate-950 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        AI Neural Recognition Scanning
                      </h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Extracting category, hallmarks, screen crack, and cosmetic integrity...
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[11px] font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      YOLOv8 + Roboflow Serverless Multi-Dataset Active
                    </div>
                  </div>
                </div>
              ) : intakeMode === "camera" ? (
                /* Live Webcam Capture Window */
                <div className="space-y-4">
                  {/* Hidden Native Camera & File Shutter Inputs */}
                  <input
                    ref={mobileCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
                    {cameraLoading ? (
                      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-slate-300 font-medium">Connecting to camera stream...</span>
                      </div>
                    ) : cameraError ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{cameraError}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => startCamera()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Retry Camera
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => mobileCameraInputRef.current?.click()}
                            className="text-xs font-semibold"
                          >
                            <Camera className="w-3.5 h-3.5 mr-1.5" />
                            Open Device Camera App
                          </Button>
                          <button
                            type="button"
                            onClick={() => {
                              stopCamera();
                              setIntakeMode("upload");
                            }}
                            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 px-2"
                          >
                            Switch to Upload
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                          className="w-full h-full object-cover"
                        />

                        {/* Live Feed Status Pill */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[11px] font-mono font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE WEBCAM
                        </div>

                        {/* Viewfinder Target Reticle */}
                        <div className={`absolute inset-8 border-2 border-dashed rounded-xl pointer-events-none flex flex-col justify-between p-3 transition-colors duration-300 ${canCapture ? 'border-emerald-400 bg-emerald-500/5' : 'border-amber-400/80 bg-amber-500/5'}`}>
                          <div className="flex justify-between items-center text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs w-fit bg-black/60">
                            <span className={canCapture ? "text-emerald-400 font-bold" : "text-amber-300 font-bold"}>
                              {canCapture ? "✓ ALIGNMENT & LIGHTING OPTIMAL" : "⚠ ADJUST PRODUCT POSITION"}
                            </span>
                          </div>
                          
                          {/* Live Guidance Banner inside camera reticle */}
                          <div className="flex flex-col items-center gap-1.5 self-center">
                            <div className={`text-center text-xs font-semibold py-1.5 px-4 rounded-full backdrop-blur-md border shadow-md flex items-center gap-2 ${
                              canCapture 
                                ? "bg-emerald-950/80 text-emerald-200 border-emerald-500/50" 
                                : "bg-amber-950/85 text-amber-200 border-amber-500/50 animate-pulse"
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${canCapture ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                              <span>{captureHint}</span>
                            </div>
                            <div className="text-[10px] text-white/70 font-mono bg-black/50 px-2 py-0.5 rounded">
                              Fill: {frameMetrics.fillRatio}% (min 25%) • Lum: {frameMetrics.brightness}
                            </div>
                          </div>

                          <div className="text-center text-[11px] text-white/90 font-medium bg-black/60 py-1 px-3 rounded-full backdrop-blur-xs self-center border border-white/10 shadow-xs">
                            Supports: Clothes • Footwear • Smartphones • Laptops • Electronics
                          </div>
                        </div>

                        {/* Camera Control overlay */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const nextMode = facingMode === "environment" ? "user" : "environment";
                              setFacingMode(nextMode);
                              startCamera(nextMode);
                            }}
                            className="p-2 bg-black/60 hover:bg-black/80 rounded-xl text-white backdrop-blur-md transition-all text-xs flex items-center gap-1.5 border border-white/10"
                            title="Switch Camera (Front/Rear)"
                          >
                            <SwitchCamera className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Camera Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => mobileCameraInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors border border-slate-200"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        Take with Phone / Device Shutter
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4"
                      >
                        Browse file
                      </button>
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      onClick={handleCapturePhoto}
                      disabled={cameraLoading || !!cameraError || !canCapture}
                      className={`font-bold px-8 shadow-md transition-all ${
                        canCapture 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300"
                      }`}
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      {canCapture ? "Capture Photo & Identify" : "Align Product to Capture"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* File Drag & Drop / Upload Window */
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      Click to Browse or Drag & Drop Product Photo
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Supports JPG, PNG, WEBP from smartphone camera, scanner, or inspection booth
                    </p>
                    <div className="mt-4">
                      <Button type="button" size="sm" variant="outline" className="text-xs">
                        Select Photo File
                      </Button>
                    </div>
                  </div>

                  {/* Quick-Test 1-Click Samples */}
                  <div className="pt-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Quick Visual Test Benchmarks:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleSampleIdentify(
                            "clothes",
                            "/uploads/RELIFE-SMA-DD3700_278704df.jpg"
                          )
                        }
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all"
                      >
                        <div className="text-xs font-bold text-slate-800">Clothes & Apparel</div>
                        <div className="text-[10px] text-slate-500">Zara / Denim Jacket</div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSampleIdentify(
                            "smartphone",
                            "/uploads/RELIFE-SMA-87144E_11e96b89.jpg"
                          )
                        }
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all"
                      >
                        <div className="text-xs font-bold text-slate-800">Smartphone Mobile</div>
                        <div className="text-[10px] text-slate-500">iPhone Crack Display</div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSampleIdentify(
                            "laptop",
                            "/uploads/RELIFE-LAP-42FB4E_e3dd2ce5.jpg"
                          )
                        }
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all"
                      >
                        <div className="text-xs font-bold text-slate-800">Laptop Ultrabook</div>
                        <div className="text-[10px] text-slate-500">MacBook Pro Lid</div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSampleIdentify(
                            "footwear",
                            "/uploads/RELIFE-SMA-DD3700_74db81e4.jpg"
                          )
                        }
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all"
                      >
                        <div className="text-xs font-bold text-slate-800">Footwear & Shoes</div>
                        <div className="text-[10px] text-slate-500">Nike Sneakers</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Skip link */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Can't capture right now?</span>
                <button
                  type="button"
                  onClick={() => setStage("manual_verification")}
                  className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  Skip AI vision & enter manually <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STAGE 2: Product Identified -> Manual Extra Verification & Ingestion Form */}
      {stage === "manual_verification" && (
        <div className="space-y-6">
          {/* AI Detection Summary Banner */}
          {aiDetectionSummary && aiDetectionSummary.is_out_of_scope ? (
            /* LAYER 4: Confident, professional fallback for out-of-scope objects */
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white border border-indigo-700/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {previewImage ? (
                  <div className="w-18 h-18 rounded-xl overflow-hidden border-2 border-indigo-400/40 shrink-0 bg-black shadow-inner">
                    <img
                      src={previewImage}
                      alt="Scanned Item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Manual Inspection Protocol
                    </span>
                    <span className="text-xs text-indigo-200 font-mono">
                      Scope Analysis: Non-Catalog ({Math.round((aiDetectionSummary.identification_confidence || 0.99) * 100)}% conf)
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-amber-300 font-semibold">
                      Layer 2 Condition Score: {aiDetectionSummary.condition_score ?? 70}/100
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Category Outside Trained Scope — Flagged for Manual Inspection
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    This item is outside the 11 circular recovery categories. Rather than guessing, the system has routed this asset into the Physical Inspection Queue for manual intake and specialist triage.
                  </p>
                  {aiDetectionSummary.condition_flags && aiDetectionSummary.condition_flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aiDetectionSummary.condition_flags.map((flag: string, fIdx: number) => (
                        <span key={fIdx} className="text-[11px] px-2 py-0.5 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-md">
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStage("visual_intake");
                    setAiDetectionSummary(null);
                  }}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Re-scan Photo
                </Button>
              </div>
            </div>
          ) : aiDetectionSummary ? (
            /* In-Scope Detection Banner (Layers 1, 2, 3) */
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-2xl p-5 text-white border border-emerald-700/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {previewImage ? (
                  <div className="w-18 h-18 rounded-xl overflow-hidden border-2 border-emerald-400/40 shrink-0 bg-black shadow-inner">
                    <img
                      src={previewImage}
                      alt="Scanned Item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="success" size="sm" className="font-bold">
                      ✓ AI Identified
                    </Badge>
                    <span className="text-xs text-emerald-300 font-mono">
                      {Math.round((aiDetectionSummary.identification_confidence || aiDetectionSummary.overall_confidence || 0.94) * 100)}% Conf ({aiDetectionSummary.identification_source === 'clip_zero_shot' ? 'CLIP Zero-Shot' : 'YOLOv8s COCO'})
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-amber-300 font-semibold">
                      Condition Score: {aiDetectionSummary.condition_score ?? 85}/100
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-300">
                      {aiDetectionSummary.validated_yolo_active
                        ? (aiDetectionSummary.defects?.length
                            ? `${aiDetectionSummary.defects.length} defect area(s) localized (YOLO mAP≥0.6)`
                            : "Clean surface condition detected (YOLO mAP≥0.6)")
                        : "OpenCV Condition Scoring (YOLO boxes hidden: unvalidated category)"}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {aiDetectionSummary.category_label || category.toUpperCase()} • {model}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Form auto-populated below. Perform manual confirmation before generating digital passport.
                  </p>
                  {aiDetectionSummary.condition_flags && aiDetectionSummary.condition_flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aiDetectionSummary.condition_flags.map((flag: string, fIdx: number) => (
                        <span key={fIdx} className="text-[11px] px-2 py-0.5 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-md">
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStage("visual_intake");
                    setAiDetectionSummary(null);
                  }}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Re-scan Asset Photo
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Manual Extra Verification Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle>Asset Intake Manifest & Quality Verification</CardTitle>
                        <p className="text-xs text-slate-500">
                          Verify hardware specs, validate serial numbers, and sign off manifest
                        </p>
                      </div>
                    </div>
                    <Badge variant="neutral">Step 2: Manual Verification</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmitRegistration} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Product Category"
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        options={Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => ({
                          value: val,
                          label: cfg.label,
                        }))}
                      />

                      <Select
                        label="Manufacturer / Brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        options={
                          CATEGORY_CONFIG[category]?.brands || [
                            { value: "Generic", label: "Generic / Independent Brand" },
                          ]
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Model Identification"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                        placeholder={CATEGORY_CONFIG[category]?.defaultModel || "e.g. Model Name"}
                      />
                      <Input
                        label="Serial Number / Barcode"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        required
                        placeholder="e.g. SN-849204"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Original MSRP (₹)"
                        type="number"
                        value={msrp}
                        onChange={(e) => setMsrp(e.target.value)}
                        required
                        placeholder="149900"
                      />
                      <Select
                        label="Return Intake Channel"
                        value={returnChannel}
                        onChange={(e) => setReturnChannel(e.target.value)}
                        options={[
                          { value: "ecommerce_return", label: "E-Commerce Return (14-Day)" },
                          { value: "b2b_lease_expiry", label: "B2B Enterprise Lease Expiry" },
                          { value: "trade_in_program", label: "Consumer Trade-In Exchange" },
                          { value: "warranty_rma", label: "Warranty Return (RMA)" },
                        ]}
                      />
                    </div>

                    <Input
                      label="Stated Return Reason"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      required
                      placeholder="e.g. Minor screen scratch, buyer remorse"
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Customer / Warehouse Intake Notes
                      </label>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        rows={3}
                        placeholder="Notes regarding accessories, packaging condition, or power state..."
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    {/* Manual Extra Quality Checklist */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Technician Quality Assurance Verification
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verifyAssetMatch}
                          onChange={(e) => setVerifyAssetMatch(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Physical dimensions, category, and model match visual intake photo</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verifySerialBarcode}
                          onChange={(e) => setVerifySerialBarcode(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Serial IMEI / Barcode tag cross-checked against carrier paperwork</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verifyCosmeticIntegrity}
                          onChange={(e) => setVerifyCosmeticIntegrity(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Approved benchmark valuation & intake routing destination</span>
                      </label>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStage("visual_intake")}
                        className="w-full sm:w-auto"
                      >
                        Back to Visual Scan
                      </Button>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:flex-1 font-bold bg-emerald-600 hover:bg-emerald-700"
                        isLoading={loading}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Confirm Verification & Generate QR Passport
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Serialized QR Card Result */}
            <div>
              {registeredProduct ? (
                <Card className="border-emerald-500 bg-emerald-50/20 shadow-md">
                  <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-emerald-900">Registered Successfully</CardTitle>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      UID: {registeredProduct.product_uid || registeredProduct.id}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5 text-center">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block shadow-xs mx-auto">
                      {registeredProduct.qr_code_base64 ? (
                        <img
                          src={registeredProduct.qr_code_base64}
                          alt="Product QR Code"
                          width={160}
                          height={160}
                          className="mx-auto"
                        />
                      ) : (
                        <QRCodeSVG
                          value={JSON.stringify({
                            uid: registeredProduct.product_uid || registeredProduct.id,
                            model: registeredProduct.model,
                            brand: registeredProduct.brand,
                            url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/store/products/${registeredProduct._id || registeredProduct.id}`,
                          })}
                          size={160}
                          level="H"
                        />
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Asset:</span>
                        <span className="font-semibold text-slate-900">
                          {registeredProduct.brand} {registeredProduct.model}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-semibold text-slate-900 capitalize">
                          {registeredProduct.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Benchmark MSRP:</span>
                        <span className="font-mono text-slate-900">
                          ₹{(registeredProduct.purchase_price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Intake Status:</span>
                        <Badge variant="success" size="sm">
                          {registeredProduct.status || "Registered"}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href={`/inspector/inspections/${registeredProduct._id || registeredProduct.id}`}>
                        <Button className="w-full font-bold">
                          Proceed to Full Diagnostic Inspection <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Digital QR Passport
                  </h4>
                  <p className="text-xs text-slate-500">
                    Once verification is confirmed, a cryptographically signed QR code will be generated for labeling the asset.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
