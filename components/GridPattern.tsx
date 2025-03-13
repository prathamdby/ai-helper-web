"use client";

import { cn } from "@/lib/utils";

interface GridPatternProps {
  className?: string;
  size?: number;
  opacity?: number;
}

const GridPattern = ({
  className,
  size = 50,
  opacity = 0.05,
}: GridPatternProps = {}) => {
  return (
    <div
      className={cn(
        "bg-grid-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(white,transparent_85%)]",
        className
      )}
      style={{
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
};

export default GridPattern;
