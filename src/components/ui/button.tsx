"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark focus-visible:ring-primary/50",
  secondary:
    "bg-secondary text-gray-700 shadow-sm hover:bg-secondary-dark focus-visible:ring-secondary/50",
  accent:
    "bg-accent text-white shadow-sm hover:bg-accent-dark focus-visible:ring-accent/50",
  ghost:
    "bg-transparent text-gray-700 hover:bg-muted focus-visible:ring-gray-300",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white focus-visible:ring-primary/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-7 py-3.5 text-lg rounded-2xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center gap-2 font-display font-semibold",
          "transition-all duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
