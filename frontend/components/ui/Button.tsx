import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-xs md:text-sm gap-2",
    lg: "px-6 py-3 text-sm md:text-base gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-[#0C5A3E] hover:bg-[#094731] active:bg-[#073827] text-white shadow-2xs hover:shadow-xs focus:ring-[#0C5A3E]",
    secondary:
      "bg-[#F4F5F7] hover:bg-[#EAECEF] text-slate-800 focus:ring-slate-300",
    outline:
      "border border-slate-200/90 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-[#0C5A3E] shadow-2xs",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs hover:shadow-xs focus:ring-rose-500",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};
