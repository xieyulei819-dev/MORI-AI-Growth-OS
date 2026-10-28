import { NextResponse, type NextRequest } from "next/server";

import {
  AI_VISITOR_COOKIE,
  AI_VISITOR_HEADER,
  AI_VISITOR_ID_PATTERN,
} from "@/lib/ai/visitor";

export function middleware(request: NextRequest) {
  const current = request.cookies.get(AI_VISITOR_COOKIE)?.value ?? "";
  const visitorId = AI_VISITOR_ID_PATTERN.test(current) ? current : crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);

  // Always overwrite this internal header. A caller cannot choose another
  // visitor's quota by supplying the header directly.
  requestHeaders.set(AI_VISITOR_HEADER, visitorId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (current !== visitorId) {
    response.cookies.set(AI_VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
