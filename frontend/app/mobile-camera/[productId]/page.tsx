"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Camera,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  SwitchCamera,
  Image as ImageIcon
} from "lucide-react";
import { endpoints } from "@/lib/api";

export default function MobileCameraPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch product info
  useEffect(() => {
    if (productId) {
      endpoints.getProduct(productId)
        .then((res) => setProduct(res.data))
        .catch(() => {});
    }
  }, [productId]);

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

  // Start live stream
  const startCamera = useCallback(async (targetMode?: "environment" | "user") => {
    setCameraError(null);
    const mode = targetMode || facingMode;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Live stream not supported in this browser. Please use 'Snap Photo with Camera' below.");
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: mode },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false,
        });
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {}
          setCameraActive(true);
        }
      }
    } catch (err: any) {
      console.warn("Mobile camera error:", err);
      setCameraError("Camera stream blocked. Tap 'Snap Photo with Camera' button below to use your native phone camera.");
    }
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Direct upload and sync function
  const uploadFileDirectly = async (fileToUpload: File) => {
    if (!productId) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("image", fileToUpload);

      const res = await endpoints.uploadInspectionImage(formData);
      setInspectionResult(res.data);
    } catch (err: any) {
      console.error("Upload error:", err);
      setCameraError("Upload failed. Please check network connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Capture frame from live video stream
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `defect_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        setSelectedFile(file);
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
        uploadFileDirectly(file);
      }
    }, "image/jpeg", 0.95);
  };

  // Direct file input change (Native camera or gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCapturedImage(URL.createObjectURL(file));
      setCameraError(null);
      stopCamera();
      uploadFileDirectly(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setInspectionResult(null);
  };

  const toggleCamera = () => {
    stopCamera();
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  // Manual retry handler
  const handleUploadAndAnalyze = async () => {
    if (selectedFile) {
      await uploadFileDirectly(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between select-none">
      {/* 
        Native Mobile Camera Inputs using HTML5 label binding.
        This bypasses ALL programmatic click restrictions in iOS Safari and Android Chrome.
      */}
      <input
        id="native-camera-shutter"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{
          position: "fixed",
          top: "-1000px",
          left: "-1000px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <input
        id="native-gallery-picker"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{
          position: "fixed",
          top: "-1000px",
          left: "-1000px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {product ? `${product.brand} ${product.model}` : "Mobile Defect Camera"}
            </h1>
            <p className="text-[11px] text-emerald-400 font-mono">
              {product?.product_uid || productId.slice(0, 8)} • Ready to Inspect
            </p>
          </div>
        </div>

        {cameraActive && (
          <button
            onClick={toggleCamera}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            title="Flip camera"
          >
            <SwitchCamera className="w-4 h-4 text-emerald-400" />
          </button>
        )}
      </header>

      {/* Main Viewfinder / Photo Display */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {capturedImage ? (
          <div className="w-full max-w-md bg-black rounded-3xl overflow-hidden border border-slate-800 relative shadow-2xl">
            <img
              src={capturedImage}
              alt="Captured Defect"
              className="w-full h-auto max-h-[55vh] object-contain"
            />

            {/* Live Syncing Indicator */}
            {isUploading && (
              <div className="p-4 bg-slate-900/95 border-t border-emerald-500/30 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-400">Syncing Photo to Laptop...</div>
                  <div className="text-[11px] text-slate-400">Uploading & running YOLOv8 defect detection</div>
                </div>
              </div>
            )}

            {/* Analysis Completed Notification */}
            {inspectionResult?.defects && (
              <div className="p-4 bg-slate-900/95 border-t border-emerald-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Synced to Laptop & Defect Analyzed!</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {inspectionResult.defects.length > 0 ? (
                    inspectionResult.defects.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-800/80 px-3 py-1.5 rounded-xl font-mono">
                        <span className="capitalize text-rose-300 font-bold">
                          {d.defect_category.replace(/_/g, " ")}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {(d.detection_confidence * 100).toFixed(0)}% Conf
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs">No surface defects localized. Clean chassis.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md aspect-3/4 sm:aspect-4/3 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-black"
            />

            {/* Live Camera Guide Frame */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                <div className="w-full h-full border-2 border-dashed border-emerald-400/60 rounded-3xl relative flex items-center justify-center">
                  <div className="text-[11px] font-mono text-emerald-300 bg-slate-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                    ALIGN DEFECT HERE
                  </div>
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                </div>
              </div>
            )}

            {/* Default Camera Launcher Screen */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
                  <Camera className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1.5">Capture Defect Photo</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                  Tap below to open your phone's camera and take a clear photo of the screen, body, or defect.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  {/* Primary Native Camera Trigger via Label */}
                  <label
                    htmlFor="native-camera-shutter"
                    className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer text-center select-none"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Open Phone Camera</span>
                  </label>

                  {/* Pick from Photos / Gallery */}
                  <label
                    htmlFor="native-gallery-picker"
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer text-center select-none"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Choose from Photo Gallery</span>
                  </label>

                  {/* Optional Live Stream */}
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="text-[11px] text-slate-500 hover:text-slate-300 underline mt-1"
                  >
                    Or try live browser stream
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {cameraError && (
              <div className="absolute top-4 left-4 right-4 bg-amber-500/95 text-slate-950 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Control Bar */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800 max-w-md w-full mx-auto">
        {!capturedImage ? (
          <div className="w-full">
            {cameraActive ? (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={captureFrame}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-emerald-500 active:scale-90 transition-transform shadow-2xl"
                  title="Capture photo"
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <Camera className="w-7 h-7 text-slate-950" />
                  </div>
                </button>
              </div>
            ) : (
              <label
                htmlFor="native-camera-shutter"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer text-center select-none"
              >
                <Camera className="w-6 h-6" />
                <span>Snap Photo with Camera</span>
              </label>
            )}
          </div>
        ) : inspectionResult ? (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => router.push(`/inspector/inspections/${productId}/costs`)}
              className="w-full py-4 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-transform"
            >
              <span>View Cost & Valuation Matrix</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRetake}
              className="w-full py-3 px-4 bg-slate-800 text-slate-300 rounded-2xl text-xs font-semibold hover:bg-slate-700"
            >
              Take Another Defect Photo
            </button>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3.5 px-3 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>
            <button
              type="button"
              onClick={handleUploadAndAnalyze}
              disabled={isUploading}
              className="flex-2 py-3.5 px-4 rounded-2xl bg-[#0C5A3E] hover:bg-[#094731] active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-transform disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Analyze Defect</span>
                </>
              )}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
