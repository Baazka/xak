// src/lib/requirePermission.ts
export function requirePermission(userPermissions: string[] = [], required: string[]) {
  // ⭐ SuperAdmin wildcard
  if (userPermissions.includes("*")) return;

  const ok = required.some((p) => userPermissions.includes(p));
  if (!ok) {
    throw new Error("FORBIDDEN");
  }
}
