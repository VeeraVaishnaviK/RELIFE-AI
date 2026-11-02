"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Safely coerce any value to a displayable string (handles Pydantic validation error arrays, objects, etc.)
  const safeMsg = (v: any): string => {
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.map((e: any) => (typeof e === "object" ? e.msg || JSON.stringify(e) : String(e))).join("; ");
    if (v && typeof v === "object") return v.msg || v.message || v.detail || JSON.stringify(v);
    return String(v ?? "Something went wrong");
  };

  const toast = useCallback(
    ({ type, title, message }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const safeMessage = safeMsg(message);
      const safeTitle = title ? safeMsg(title) : undefined;
      setToasts((prev) => [...prev, { id, type, title: safeTitle, message: safeMessage }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((message: any, title?: any) => toast({ type: "success", title, message }), [toast]);
  const error = useCallback((message: any, title?: any) => toast({ type: "error", title, message }), [toast]);
  const warning = useCallback((message: any, title?: any) => toast({ type: "warning", title, message }), [toast]);
  const info = useCallback((message: any, title?: any) => toast({ type: "info", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
          };

          const borders = {
            success: "border-emerald-200 bg-emerald-50/90 text-emerald-950",
            error: "border-rose-200 bg-rose-50/90 text-rose-950",
            warning: "border-amber-200 bg-amber-50/90 text-amber-950",
            info: "border-sky-200 bg-sky-50/90 text-sky-950",
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-md flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 ${borders[t.type]}`}
            >
              {icons[t.type]}
              <div className="flex-1 text-xs">
                {t.title && <h5 className="font-bold mb-0.5">{t.title}</h5>}
                <p className="leading-relaxed font-medium">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return fallback no-op if outside provider
    return {
      toast: () => {},
      success: (msg: string) => console.log("[Toast Success]", msg),
      error: (msg: string) => console.error("[Toast Error]", msg),
      warning: (msg: string) => console.warn("[Toast Warning]", msg),
      info: (msg: string) => console.info("[Toast Info]", msg),
    };
  }
  return context;
};
