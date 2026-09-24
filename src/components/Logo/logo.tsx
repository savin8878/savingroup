import React from "react";
import { cn } from "@/lib/utils";
import { SavinMark } from "./SavinMark";
import styles from "./Logo.module.css";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Savin Group logo: the "S" mark + the "savingroup" wordmark. Each size
 * steps down one notch on small viewports — the mark stays legible while
 * the wordmark gives the rest of the header bar its room back.
 */
const sizes = {
  sm: { mark: "h-8 w-8", text: "text-[19px]" },
  md: { mark: "h-9 w-9 sm:h-10 sm:w-10", text: "text-[20px] sm:text-[23px]" },
  lg: { mark: "h-10 w-10 sm:h-12 sm:w-12", text: "text-[23px] sm:text-[27px]" },
};

const Logo: React.FC<LogoProps> = ({
  className = "",
  showText = true,
  size = "md",
}) => {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2 select-none sm:gap-2.5", className)}>
      <SavinMark className={cn(styles.mark, s.mark)} />
      {showText ? (
        <>
          <span className={cn(styles.wordmark, s.text)} aria-hidden="true">
            <span className={styles.savin}>savin</span>
            <span className={styles.group}>group</span>
          </span>
          <span className="sr-only">Savin Group</span>
        </>
      ) : (
        <span className="sr-only">Savin Group</span>
      )}
    </div>
  );
};

export default Logo;
