export function tenantEnvironmentKey(prefix: string, tenantId: string): string {
  const tenantKey = tenantId.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  if (!tenantKey) {
    throw new Error("A tenant ID is required to resolve tenant configuration.");
  }
  return `${prefix}_${tenantKey}`;
}
