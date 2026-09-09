import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Each size steps down one notch on small viewports — the mark stays legible
 * while the wordmark gives the rest of the header bar its room back.
 */
const sizes = {
  sm: { box: "h-8 w-8", text: "text-sm sm:text-base", sub: "text-[9px]" },
  md: {
    box: "h-9 w-9 sm:h-10 sm:w-10",
    text: "text-base sm:text-lg",
    sub: "text-[9px] sm:text-[10px]",
  },
  lg: {
    box: "h-10 w-10 sm:h-12 sm:w-12",
    text: "text-lg sm:text-xl",
    sub: "text-[10px] sm:text-[11px]",
  },
};

const Logo: React.FC<LogoProps> = ({
  className = "",
  showText = true,
  size = "md",
}) => {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2 select-none sm:gap-3", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-xl",
          "bg-gradient-to-br from-[oklch(0.82_0.16_72)] via-[oklch(0.74_0.17_60)] to-[oklch(0.58_0.18_50)]",
          "shadow-[0_8px_28px_-8px_oklch(0.78_0.165_70/0.7),inset_0_1px_0_0_oklch(1_0_0_/_0.35)]",
          "ring-1 ring-[oklch(1_0_0_/_0.18)]",
          s.box
        )}
        aria-hidden
      >
        {/* Decorative spark in top-right */}
        <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-white/70" />
        <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/10 blur-md" />

        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="relative h-1/2 w-1/2 text-accent-foreground"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stylized 'S' / signal arc */}
          <path d="M5 17 C 10 17, 11 12, 7 12 C 3 12, 4 7, 9 7 L 15 7" />
          <path d="M19 14 L 15 19" />
          <circle cx="19" cy="14" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-semibold tracking-tight text-foreground",
              s.text
            )}
          >
            Sanat<span className="text-accent">Dynamo</span>
          </span>
          <span
            className={cn(
              "mt-1 hidden font-mono uppercase tracking-[0.22em] text-muted-foreground min-[380px]:block",
              s.sub
            )}
          >
            Revenue Systems
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
