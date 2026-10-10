"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "复制",
  copiedLabel = "已复制",
  variant = "outline",
  size = "sm",
  className,
  ...rest
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const area = document.createElement("textarea");
        area.value = value;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={copy} {...rest}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
