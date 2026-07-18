"use client";

import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Remove padding from the card body */
  noPadding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ noPadding = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "rounded-2xl border-2 border-border bg-card shadow-sm",
          "transition-all duration-200 ease-in-out",
          "hover:shadow-md",
          noPadding ? "" : "p-5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

/** Convenience sub-components for Card content layout */
function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[`mb-3 flex items-center justify-between`, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={[
        "text-lg font-semibold font-display text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[`text-sm text-gray-600`, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

function CardFooter({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "mt-4 flex items-center gap-3 border-t border-border pt-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
export type { CardProps };
