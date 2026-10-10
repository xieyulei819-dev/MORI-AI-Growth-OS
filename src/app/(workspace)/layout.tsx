import { AppShell } from "@/components/layout/app-shell";
import { agentStatusSummary } from "@/lib/ai/runner";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const status = agentStatusSummary();

  return (
    <AppShell
      aiStatus={{
        mode: status.mode,
        model: status.model,
        provider: status.provider,
        reason: status.reason,
      }}
      datasetLabel="Demo 数据集：MORI 晚间修护精华 · 30 天模拟投放数据"
    >
      {children}
    </AppShell>
  );
}
