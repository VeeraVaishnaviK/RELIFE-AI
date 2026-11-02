import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  size?: "sm" | "md" | "lg";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px] font-semibold",
    md: "px-3 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-xs font-bold",
  };

  const variantStyles = {
    success: "bg-emerald-50 text-[#0C5A3E] border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border border-rose-200/80",
    info: "bg-sky-50 text-sky-700 border border-sky-200/80",
    neutral: "bg-[#F4F5F7] text-slate-700 border border-slate-200/80",
    primary: "bg-[#0C5A3E] text-white shadow-2xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
