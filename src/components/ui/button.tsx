import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[13px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-55",
  {
    variants: {
      variant: {
        primary: "bg-ink text-canvas hover:bg-ink/90 shadow-card",
        moss: "bg-moss text-white hover:bg-moss/90 shadow-card",
        outline: "border border-ink-line bg-surface text-ink hover:border-ink-soft/60 hover:bg-surface-muted",
        ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
        subtle: "bg-surface-muted text-ink hover:bg-ink-line/60",
        danger: "bg-tone-bad/10 text-tone-bad hover:bg-tone-bad/18 border border-tone-bad/25",
      },
      size: {
        sm: "h-8 px-3 text-[12px]",
        md: "h-9 px-4 py-2",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    loadingLabel?: string;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading = false, loadingLabel, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
      {loading ? (loadingLabel ?? "处理中…") : children}
    </button>
  );
});

export { buttonVariants };
