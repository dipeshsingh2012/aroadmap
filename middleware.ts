import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public asset files (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const searchParams = url.searchParams;

  // Local development / testing query param override: ?tenant=rfqengine
  const queryTenant = searchParams.get("tenant");

  // Extract host without port
  const host = hostname.replace(/:\d+$/, "").toLowerCase();
  const rootDomain = (process.env.ROOT_DOMAIN || "aroadmap.dev").toLowerCase();

  // Root platform marketing domain: aroadmap.dev, www.aroadmap.dev, or bare localhost
  const isRootPlatform =
    (host === rootDomain ||
      host === `www.${rootDomain}` ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "aroadmap.localhost") &&
    !queryTenant;

  if (isRootPlatform) {
    // If root path '/', rewrite to /home marketing page
    if (url.pathname === "/") {
      return NextResponse.rewrite(new URL("/home", req.url));
    }
    // If '/new' or other platform pages, passthrough directly
    return NextResponse.next();
  }

  // Extract tenant subdomain or custom domain slug
  let tenantSlug = "";
  if (queryTenant) {
    tenantSlug = queryTenant.toLowerCase().trim();
  } else if (host.endsWith(`.${rootDomain}`)) {
    tenantSlug = host.replace(`.${rootDomain}`, "").toLowerCase().trim();
  } else if (host.endsWith(".localhost")) {
    tenantSlug = host.replace(".localhost", "").toLowerCase().trim();
  } else {
    // Custom domain support (e.g. roadmap.rfpengine.net)
    tenantSlug = host.split(".")[0];
  }

  if (tenantSlug && tenantSlug !== "www" && tenantSlug !== "app") {
    // Rewrite internally to /[domain]/[pathname]
    // e.g. https://rfqengine.aroadmap.dev/ -> app/[domain]/page.tsx (where params.domain = 'rfqengine')
    // e.g. https://rfqengine.aroadmap.dev/changelog -> app/[domain]/changelog/page.tsx
    const targetPath = `/${tenantSlug}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(new URL(targetPath, req.url));
  }

  // Fallback to home
  return NextResponse.rewrite(new URL("/home", req.url));
}
