import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
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

  // Handle /tenant/:slug legacy redirect to /:slug
  if (url.pathname.startsWith("/tenant/")) {
    const slug = url.pathname.replace("/tenant/", "");
    return NextResponse.redirect(new URL(`/${slug}`, req.url));
  }

  // Check query parameter override (?tenant=rfqengine)
  const queryTenant = searchParams.get("tenant");
  if (queryTenant && url.pathname === "/") {
    return NextResponse.rewrite(new URL(`/${queryTenant.toLowerCase()}`, req.url));
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
    // Rewrite directly to dynamic tenant route: /[subdomain]
    const tenantPath = `/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(new URL(tenantPath, req.url));
  }

  return NextResponse.next();
}
