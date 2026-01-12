//src/lib/permission.ts
export function hasPermission(userPermissions: string[] = [], required?: string[]) {
  if (!required || required.length === 0) return true;
  return required.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(userPermissions: string[] = [], required: string[] = []) {
  return required.every((p) => userPermissions.includes(p));
}
