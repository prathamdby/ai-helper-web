"use client";

import { cn } from "@/lib/utils";

interface GridPatternProps {
  className?: string;
  size?: number;
}

const GridPattern = ({ className, size = 50 }: GridPatternProps = {}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(white,transparent_85%)]",
        className
      )}
      style={{
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
};

export default GridPattern;
