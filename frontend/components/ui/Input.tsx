import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border ${
          error ? "border-rose-400 focus:ring-rose-400" : "border-slate-200/90 focus:border-[#0C5A3E] focus:ring-[#0C5A3E]"
        } px-4 py-2.5 text-xs md:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all shadow-2xs ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options = [],
  children,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border ${
          error ? "border-rose-400 focus:ring-rose-400" : "border-slate-200/90 focus:border-[#0C5A3E] focus:ring-[#0C5A3E]"
        } px-4 py-2.5 text-xs md:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all shadow-2xs ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  onChange,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-bold text-[#0C5A3E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0C5A3E] focus:outline-none"
      />
    </div>
  );
};

export interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="bg-[#F4F5F7] p-1.5 rounded-2xl inline-flex items-center gap-1 mb-6 border border-slate-200/60 shadow-2xs">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
              isActive
                ? "bg-[#0C5A3E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200/70 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="p-3.5 bg-[#F4F5F7] rounded-2xl text-slate-500 mb-4">{icon}</div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <div className={`animate-pulse bg-slate-200/70 rounded-2xl ${className}`} />;
};
