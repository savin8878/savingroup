"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyScrollLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}

export function StickyScrollLayout({
  leftContent,
  rightContent,
  className,
  leftClassName,
  rightClassName,
}: StickyScrollLayoutProps) {
  return (
    <div className={cn("relative grid gap-12 lg:grid-cols-12", className)}>
      {/* Left Sticky Side */}
      <aside className={cn("lg:col-span-5 lg:h-fit lg:sticky lg:top-32", leftClassName)}>
        {leftContent}
      </aside>

      {/* Right Scrolling Side */}
      <main className={cn("lg:col-span-7", rightClassName)}>
        {rightContent}
      </main>
    </div>
  );
}
