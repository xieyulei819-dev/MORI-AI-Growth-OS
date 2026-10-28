import { NextResponse } from "next/server";

import type { IpRunMeta } from "@/lib/ip/runner";

export { fail, parseBody, readJson, serverError } from "@/lib/api";

/**
 * IP 模块统一成功响应。结构与 MORI 主体一致（{ ok, data, meta }），
 * 因此前端可以直接复用相同的解析逻辑，只是 agent 名称换成了 IP Agent。
 */
export function ipOk<T>(data: T, meta: IpRunMeta, status = 200) {
  return NextResponse.json({ ok: true, data, meta }, { status });
}
