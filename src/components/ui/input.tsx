"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 font-display"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-xl border-2 border-border bg-card px-4 py-2.5",
            "text-foreground placeholder:text-gray-400",
            "transition-all duration-200 ease-in-out",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
