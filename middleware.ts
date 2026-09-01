import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .svg, .png, .jpg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const searchParams = url.searchParams;

  // Passthrough for API routes
  if (url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check query parameter override (?tenant=rfqengine)
  const queryTenant = searchParams.get("tenant");
  if (queryTenant && url.pathname === "/") {
    return NextResponse.rewrite(new URL(`/tenant/${queryTenant.toLowerCase()}`, req.url));
  }

  // Extract clean host
  const host = hostname.replace(/:\d+$/, "").toLowerCase();
  const rootDomain = (process.env.ROOT_DOMAIN || "aroadmap.dev").toLowerCase();

  // Root marketing site for root domain or localhost
  if (
    host === "aroadmap.dev" ||
    host === "www.aroadmap.dev" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "aroadmap.localhost"
  ) {
    // If user navigates to direct /tenant/... path, let it pass
    if (url.pathname.startsWith("/tenant/")) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // Subdomain extraction (e.g. "rfqengine.aroadmap.dev" or "rfqengine.localhost")
  let subdomain = "";
  if (host.endsWith(`.${rootDomain}`)) {
    subdomain = host.replace(`.${rootDomain}`, "");
  } else if (host.endsWith(".localhost")) {
    subdomain = host.replace(".localhost", "");
  }

  if (subdomain && subdomain !== "www" && subdomain !== "app") {
    // Rewrite to tenant subpath: /tenant/[subdomain]
    const tenantPath = `/tenant/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(new URL(tenantPath, req.url));
  }

  return NextResponse.next();
}
