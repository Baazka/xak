import { JwtPayload } from "./jwtPayload";
import { RoleCode } from "@/app/config/roleHome";

export function buildJwtPayload({
  user,
  activeRole,
  roles,
  permissions,
}: {
  user: { id: string; email: string; name?: string; avatar?: string };
  activeRole: RoleCode;
  roles: RoleCode[];
  permissions: string[];
}): JwtPayload {
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    activeRole,
    roles,
    permissions,
  };
}
