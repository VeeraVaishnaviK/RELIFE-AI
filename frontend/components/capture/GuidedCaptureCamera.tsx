"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Video,
  VideoOff,
  Upload,
  Cpu,
  Sparkles,
  Smartphone,
  SwitchCamera,
  QrCode,
  Copy,
  Check,
  X,
  ExternalLink
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";
import { endpoints } from "@/lib/api";

interface GuidedCaptureProps {
  productId: string;
  category: string;
  onSuccess: (inspectionResult: any) => void;
}

export const GuidedCaptureCamera: React.FC<GuidedCaptureProps> = ({
  productId,
  category = "laptop",
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpenCvScanning, setIsOpenCvScanning] = useState(false);
  const [blurWarning, setBlurWarning] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Real webcam stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mode, setMode] = useState<"camera" | "upload">("camera");

  const steps =
    category === "smartphone" || category === "mobile"
      ? [
          {
            name: "Display Screen (Front)",
            desc: "Align phone screen centered to detect display cracks, scratches, and OLED pixel defects",
            guide: "front",
          },
          {
            name: "Rear Cover & Camera Module",
            desc: "Inspect back glass, camera lens rings, and chassis dents",
            guide: "back",
          },
          {
            name: "Side Edges & Ports",
            desc: "Inspect antenna bands, USB/Lightning port, and buttons",
            guide: "side",
          },
        ]
      : [
          {
            name: "Top Cover / Lid",
            desc: "Align laptop closed with manufacturer logo centered",
            guide: "top",
          },
          {
            name: "Display & Keyboard Deck",
            desc: "Open to 90° angle showing full screen and keycaps",
            guide: "open",
          },
          {
            name: "Bottom Chassis",
            desc: "Inspect ventilation grills, feet, and serial plate",
            guide: "underside",
          },
        ];

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera stream with support for front/rear mobile cameras
  const startCamera = useCallback(async (targetFacingMode?: "environment" | "user") => {
    setCameraError(null);
    let stream: MediaStream | null = null;
    const modeToUse = targetFacingMode || facingMode;

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("getUserMedia not available, launching native mobile camera");
      mobileCameraInputRef.current?.click();
      return;
    }

    try {
      // Attempt 1: Target rear camera for inspecting physical hardware
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: modeToUse },
          },
          audio: false,
        });
      } catch {
        // Attempt 2: Flexible constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: modeToUse },
            audio: false,
          });
        } catch {
          // Attempt 3: Any video stream
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
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
          setCameraActive(true);
        }
      }
    } catch (err: any) {
      console.warn("Browser camera access error:", err);
      // Fallback: If live stream is blocked by browser policy, trigger native smartphone camera shutter directly
      mobileCameraInputRef.current?.click();
      setCameraError("Camera stream requires permission. Opening phone camera app directly.");
    }
  }, [facingMode]);

  // Toggle front/rear camera on mobile
  const toggleFacingMode = () => {
    stopCamera();
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Auto-start camera when in camera mode
  useEffect(() => {
    if (mode === "camera" && !capturedImage && !cameraActive) {
      startCamera();
    }
  }, [mode, capturedImage, cameraActive, startCamera]);

  // Capture frame from video
  const captureFromVideo = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setSelectedFile(file);
          const url = URL.createObjectURL(blob);
          setCapturedImage(url);
          setBlurWarning(null);
          stopCamera();
        }
      },
      "image/jpeg",
      0.95
    );
  }, [stopCamera]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
      setBlurWarning(null);
      stopCamera();
    }
  };

  // Upload and analyze with YOLO
  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      let fileToUpload = selectedFile;

      // Convert non-JPEG files to JPEG for best YOLO accuracy
      if (selectedFile.type !== "image/jpeg") {
        try {
          const bitmap = await createImageBitmap(selectedFile);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0);
            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, "image/jpeg", 0.95)
            );
            if (blob) {
              fileToUpload = new File(
                [blob],
                selectedFile.name.replace(/\.\w+$/, ".jpg"),
                { type: "image/jpeg" }
              );
            }
          }
        } catch (convErr) {
          console.warn("Image conversion failed, using original:", convErr);
        }
      }

      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("image", fileToUpload);

      const res = await endpoints.uploadInspectionImage(formData);
      onSuccess(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to analyze image with CV model");
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger OpenCV Hardware Capture or Sample Dataset Scan
  const handleOpenCvScan = async (useSample: boolean = false) => {
    setIsOpenCvScanning(true);
    stopCamera();
    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("use_sample", useSample ? "true" : "false");

      const res = await endpoints.opencvCapture(formData);
      onSuccess(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || "OpenCV capture failed. Ensure backend is running.");
    } finally {
      setIsOpenCvScanning(false);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setBlurWarning(null);
    if (mode === "camera") {
      startCamera();
    }
  };

  const nextAngle = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      handleRetake();
    }
  };

  // Continuously poll for mobile phone upload so laptop updates in real-time
  useEffect(() => {
    if (!productId || capturedImage) return;
    let isCancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await endpoints.getInspection(productId);
        if (isCancelled) return;
        if (res.data) {
          const hasImage = res.data.image_url || res.data.vision_results?.image_url || res.data.defects?.[0]?.image_url;
          if (hasImage) {
            setShowQrModal(false);
            onSuccess(res.data);
          }
        }
      } catch {}
    }, 1500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [productId, capturedImage, onSuccess]);

  const activeStep = steps[currentStep];

  // Compute mobile companion URLs
  const [dynamicTunnelUrl, setDynamicTunnelUrl] = useState<string>("https://nations-missile-toxic-deborah.trycloudflare.com");
  const [dynamicWifiIp, setDynamicWifiIp] = useState<string>("172.16.235.63");

  // Fetch live network info on mount or when modal opens
  useEffect(() => {
    fetch("/api/network-info")
      .then((res) => res.json())
      .then((data) => {
        if (data.tunnel_url) {
          setDynamicTunnelUrl(data.tunnel_url);
        }
        if (data.local_ip) {
          setDynamicWifiIp(data.local_ip);
        }
      })
      .catch(() => {});
  }, [showQrModal]);

  const tunnelUrl = `${dynamicTunnelUrl}/mobile-camera/${productId}`;
  const localWifiUrl = `http://${dynamicWifiIp}:3000/mobile-camera/${productId}`;
  const [connectionType, setConnectionType] = useState<"tunnel" | "wifi">("tunnel");

  const mobileUrl = connectionType === "tunnel" ? tunnelUrl : localWifiUrl;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(mobileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl text-white">
      {/* Hidden file inputs for desktop upload & direct mobile shutter */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Camera Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {mode === "camera" ? "Live Camera" : "File Upload"} • Step {currentStep + 1} of{" "}
              {steps.length}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">{activeStep.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Flip Camera Button (Front / Rear) */}
          {mode === "camera" && cameraActive && (
            <button
              onClick={toggleFacingMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              title="Flip between front and rear camera on mobile"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Flip Camera</span>
            </button>
          )}

          {/* Connect Mobile Phone QR Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C5A3E] hover:bg-[#094731] text-xs font-semibold text-white shadow-2xs transition-colors"
            title="Open camera on your mobile phone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Connect Mobile</span>
          </button>

          {/* Mode Toggle */}
          <button
            onClick={() => {
              if (mode === "camera") {
                stopCamera();
                setMode("upload");
              } else {
                setMode("camera");
              }
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            title={mode === "camera" ? "Switch to file upload" : "Switch to live camera"}
          >
            {mode === "camera" ? <Upload className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Viewfinder / Preview Area */}
      <div className="relative aspect-4/3 sm:aspect-16/9 bg-slate-950 flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured device" className="w-full h-full object-contain" />
        ) : mode === "camera" ? (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain bg-black"
            />
            {/* Guide Frame Overlay on live video */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4/5 h-4/5 border-2 border-dashed border-emerald-400/60 rounded-2xl relative">
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded">
                    FRAME GUIDE: {activeStep.guide.toUpperCase()}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded">
                    CAMERA: {facingMode.toUpperCase()}
                  </div>
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                </div>
              </div>
            )}
            {/* Tap to start camera overlay for mobile browsers */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 p-6 text-center z-10 backdrop-blur-xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Activate Mobile Camera</h4>
                <p className="text-xs text-slate-400 max-w-xs mb-5">
                  Tap below to launch live viewfinder or open your phone's camera app.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                  <Button
                    type="button"
                    onClick={() => startCamera()}
                    size="md"
                    className="w-full bg-[#0C5A3E] hover:bg-[#094731] text-white font-bold shadow-md"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Start Live Viewfinder
                  </Button>
                  <Button
                    type="button"
                    onClick={() => mobileCameraInputRef.current?.click()}
                    size="md"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Open Phone Camera
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
            <div className="w-4/5 h-4/5 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center relative bg-emerald-500/5">
              <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded">
                FRAME GUIDE: {activeStep.guide.toUpperCase()}
              </div>
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded">
                640 × 640 RES
              </div>
              <Camera className="w-12 h-12 text-emerald-400/50" />
            </div>
            <p className="absolute bottom-6 text-xs text-slate-400 max-w-sm text-center">
              {activeStep.desc}
            </p>
          </div>
        )}

        {/* Camera Error Alert with Quick Mobile Fix */}
        {cameraError && (
          <div className="absolute top-4 left-4 right-4 bg-amber-500/95 text-slate-950 p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <VideoOff className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
            <button
              onClick={() => mobileCameraInputRef.current?.click()}
              className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 ml-2 hover:bg-slate-800"
            >
              Use Phone Camera
            </button>
          </div>
        )}

        {/* Blur Alert */}
        {blurWarning && (
          <div className="absolute top-4 left-4 right-4 bg-amber-500/90 text-slate-950 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{blurWarning}</span>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Controls & Quick Scan Actions */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {!capturedImage ? (
            <div className="flex flex-wrap items-center gap-2 w-full">
              {/* Primary Live Shutter */}
              {mode === "camera" && cameraActive && (
                <Button
                  type="button"
                  onClick={captureFromVideo}
                  size="md"
                  className="font-bold bg-[#0C5A3E] hover:bg-[#094731] text-white shadow-2xs"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
              )}

              {/* Direct Native Mobile Camera Shutter (Launches phone camera app directly) */}
              <Button
                type="button"
                onClick={() => mobileCameraInputRef.current?.click()}
                size="md"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs"
                title="Directly opens smartphone camera app for high-res photo"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Open Phone Camera
              </Button>

              {/* Upload image from gallery/files */}
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                size="md"
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 font-bold"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>

              {/* OpenCV Hardware Camera Scan */}
              <Button
                type="button"
                onClick={() => handleOpenCvScan(false)}
                isLoading={isOpenCvScanning}
                size="md"
                variant="outline"
                className="border-emerald-600/60 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 font-bold"
                title="Trigger local camera directly through Python OpenCV backend"
              >
                <Cpu className="w-4 h-4 mr-2 text-emerald-400" />
                OpenCV Camera
              </Button>

              {/* 1-Click Trained YOLO Test Asset */}
              <Button
                type="button"
                onClick={() => handleOpenCvScan(true)}
                isLoading={isOpenCvScanning}
                size="md"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md ml-auto"
                title="Run inference with trained YOLOv8 model on realistic defect test asset"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Scan Demo Asset
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="border-slate-700 text-white hover:bg-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retake Photo
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleUpload}
                isLoading={isUploading}
                className="font-bold bg-[#0C5A3E] hover:bg-[#094731] text-white ml-auto"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Analyze with YOLOv8 & Make Decision
              </Button>
            </div>
          )}
        </div>

        {currentStep < steps.length - 1 && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={nextAngle}
              className="text-slate-400 hover:text-white text-xs"
            >
              Skip to next angle ({steps[currentStep + 1].name}){" "}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile QR Code Pairing Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0C5A3E] flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Connect Mobile Camera</h3>
                  <p className="text-xs text-slate-500">Scan QR to inspect directly from your phone</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Mode Toggle */}
            <div className="mt-4 flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setConnectionType("tunnel")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  connectionType === "tunnel"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Cloudflare HTTPS (Works Anywhere)
              </button>
              <button
                type="button"
                onClick={() => setConnectionType("wifi")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  connectionType === "wifi"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Local Wi-Fi IP
              </button>
            </div>

            {/* QR Code Container */}
            <div className="my-5 flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                <QRCodeSVG
                  value={mobileUrl}
                  size={190}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs font-semibold text-slate-800">
                  Open your phone's camera app & scan the code
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {connectionType === "tunnel"
                    ? "Cloudflare secure tunnel works on any 4G/5G or campus Wi-Fi network"
                    : "Requires phone & laptop on the exact same Wi-Fi network without AP isolation"}
                </p>
              </div>
            </div>

            {/* Direct Link & Copy Actions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 truncate">
                <span className="truncate pr-2">{mobileUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 shrink-0 px-2.5 py-1 bg-white hover:bg-slate-50 rounded-lg text-slate-800 font-sans font-semibold border border-slate-200 shadow-2xs transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowQrModal(false)}
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                  Close
                </Button>
                <a
                  href={mobileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#0C5A3E] hover:bg-[#094731] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors py-2.5"
                >
                  <span>Open In New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
