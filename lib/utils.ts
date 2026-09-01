export function getTenantUrl(subdomain: string): string {
  if (typeof window !== "undefined") {
    const host = window.location.host;
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      const port = window.location.port ? `:${window.location.port}` : "";
      return `http://${subdomain}.localhost${port}`;
    }
  }
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "aroadmap.dev";
  return `https://${subdomain}.${rootDomain}`;
}
