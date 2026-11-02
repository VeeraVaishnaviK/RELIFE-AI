import React from "react";
import { LucideIcon, ArrowRight, MoreHorizontal } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: "green" | "blue" | "amber" | "slate";
  isFeatured?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  accentColor = "green",
  isFeatured = false,
}) => {
  // If it's featured or green accent, render the signature deep emerald card from the design screenshot
  const isEmeraldTheme = isFeatured || accentColor === "green";

  if (isEmeraldTheme) {
    return (
      <div className="bg-gradient-to-br from-[#0C5036] via-[#0D5F3F] to-[#137852] text-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none blur-xl"></div>

        <div>
          {/* Top row: Icon + Title + Three Dots */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/15 text-white backdrop-blur-xs shadow-2xs">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight text-white block">
                  {title}
                </span>
                {subtitle && (
                  <span className="text-[11px] text-white/70 block mt-0.5">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>
            <button
              title="More"
              className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Value + Trend */}
          <div className="mt-5 flex items-baseline gap-2.5 flex-wrap">
            <div className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              {value}
            </div>
            {trend && (
              <span className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 backdrop-blur-xs">
                {trend.value}
                <span>{trend.isPositive ? "↑" : "↓"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Link: "See details →" */}
        <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/80 group-hover:text-white transition-colors">
          <span className="font-medium">See details</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  }

  // Clean White Card with pastel icon container
  const iconColorStyles = {
    blue: "bg-sky-50 text-sky-700 border border-sky-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    slate: "bg-slate-100 text-slate-700 border border-slate-200/60",
    green: "bg-emerald-50 text-[#0C5A3E] border border-emerald-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top row: Icon + Title + Three Dots */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${iconColorStyles[accentColor]} shadow-2xs`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-slate-900 block">
                {title}
              </span>
              {subtitle && (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          <button
            title="More"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Value + Trend */}
        <div className="mt-5 flex items-baseline gap-2.5 flex-wrap">
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
          {trend && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                trend.isPositive
                  ? "bg-emerald-50 text-[#0C5A3E] border border-emerald-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              {trend.value}
              <span>{trend.isPositive ? "↑" : "↓"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom Link: "View summary →" */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-900 transition-colors">
        <span className="font-medium">View summary</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
