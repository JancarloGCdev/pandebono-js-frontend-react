import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/cookies";
import { verifySessionToken } from "@/lib/auth/jwt";

export async function proxy(request: NextRequest) {
  const raw = request.cookies.get(AUTH_COOKIE)?.value;
  if (!raw) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  let token: string;
  try {
    token = decodeURIComponent(raw);
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }
  const session = await verifySessionToken(token);
  if (!session) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
