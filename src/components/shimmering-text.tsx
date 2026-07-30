"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShimmeringTextProps {
  text: string;
  className?: string;
}

export function ShimmeringText({ text, className }: ShimmeringTextProps) {
  return (
    <span className={cn("animate-pulse text-slate-300 font-medium", className)}>
      {text}
    </span>
  );
}

export default ShimmeringText;
