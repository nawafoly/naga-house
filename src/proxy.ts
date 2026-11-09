import { NextResponse, type NextRequest } from "next/server";

import { stagingRobotsHeader } from "./lib/staging-robots";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const robots = stagingRobotsHeader(request.nextUrl.hostname);

  if (robots) {
    response.headers.set("X-Robots-Tag", robots);
  }

  return response;
}

// Public HTML routes only; do not intercept images, JS, admin auth, or APIs.
export const config = {
  matcher: ["/", "/events/:path*", "/categories/:path*"],
};
