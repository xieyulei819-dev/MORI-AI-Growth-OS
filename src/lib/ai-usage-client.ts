export const AI_USAGE_CHANGED_EVENT = "mori:ai-usage-changed";

/** Ask the visible usage badge to refresh after an AI route settles. */
export function notifyAiUsageChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AI_USAGE_CHANGED_EVENT));
  }
}
