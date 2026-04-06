import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const role = request.cookies.get("role")?.value;
  const path = request.nextUrl.pathname;

  console.log("PROXY HIT:", path, role);

  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (path.startsWith("/merchant") && role !== "merchant") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (path.startsWith("/user/dashboard") && role !== "user") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (path.startsWith("/store") && role !== "user") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/merchant/:path*", "/user/dashboard/:path*", "/store/:path*"],
};
