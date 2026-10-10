import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva("chip", {
  variants: {
    tone: {
      moss: "chip-moss",
      neutral: "chip-neutral",
      good: "chip-good",
      warn: "chip-warn",
      bad: "chip-bad",
      info: "chip-info",
      clay: "chip-clay",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const TONE_BY_VALUE: Record<string, VariantProps<typeof badgeVariants>["tone"]> = {
  good: "good",
  warn: "warn",
  bad: "bad",
  info: "info",
  moss: "moss",
  clay: "clay",
  neutral: "neutral",
};

export function toneFromValue(value: string | undefined) {
  return TONE_BY_VALUE[value ?? "neutral"] ?? "neutral";
}
