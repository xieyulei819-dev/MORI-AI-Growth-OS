import { NextResponse } from "next/server";
import type { z } from "zod";

import { redactSecrets } from "@/lib/utils";
import type { AgentRunMeta } from "@/types";

export function ok<T>(data: T, meta: AgentRunMeta, status = 200) {
  return NextResponse.json({ ok: true, data, meta }, { status });
}

export function fail(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

export function parseBody<T>(schema: z.ZodType<T>, body: unknown):
  | { success: true; data: T }
  | { success: false; response: NextResponse } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      response: fail(
        "INVALID_REQUEST",
        "请求参数不合法：" +
          parsed.error.issues
            .slice(0, 3)
            .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
            .join("; "),
        422,
      ),
    };
  }
  return { success: true, data: parsed.data };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function serverError(error: unknown, fallbackMessage = "服务内部错误，请稍后重试。") {
  const message = redactSecrets(error instanceof Error ? error.message : fallbackMessage);
  console.error(
    "[MORI][api]",
    redactSecrets(error instanceof Error ? `${error.name}: ${error.message}` : String(error)),
  );
  return fail("SERVER_ERROR", message, 500);
}
