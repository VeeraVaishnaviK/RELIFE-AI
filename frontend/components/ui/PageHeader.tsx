import React from "react";
import { ChevronDown, RefreshCw } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  showPeriodFilter?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  action,
  showPeriodFilter = true,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-7 gap-4">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-xs md:text-sm text-slate-500 max-w-2xl font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {showPeriodFilter && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="hidden sm:flex items-center gap-2 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <span>This Month</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => window.location.reload()}
              title="Refresh Data"
              className="p-2 bg-white border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {action}
      </div>
    </div>
  );
};
