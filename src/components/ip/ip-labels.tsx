import { Badge } from "@/components/ui/badge";

/**
 * 事实性标注：事实 / AI推测 / 需要进一步验证。
 * 单独放在一个文件里，避免组件之间互相 import 造成循环依赖。
 */
export function LabelBadge({ label }: { label: string }) {
  const tone = label === "事实" ? "good" : label === "需要进一步验证" ? "info" : "warn";
  return <Badge tone={tone}>{label}</Badge>;
}

export function ScoreTone(value: number): "moss" | "good" | "warn" {
  if (value >= 85) return "good";
  if (value >= 70) return "moss";
  return "warn";
}
