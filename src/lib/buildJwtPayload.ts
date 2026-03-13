import { JwtPayload } from "./jwtPayload";
import { RoleCode } from "@/app/config/roleHome";

export function buildJwtPayload({
  user,
  activeRole,
  roles,
  permissions,
}: {
  user: {
    org_id: number;
    org_register_no: string;
    org_legal_name: string;
    org_phone: string;
    org_email: string;
    org_address: string;
    org_head_name: string;
    org_head_phone: string;
    org_head_email?: string;
    id: number;
    user_level_id: number;
    user_level_name: string;
    email: string;
    username: string;
    user_phone?: string;
    user_register_no?: string;
    role_label: string;
    role_code: string;
    role_text: string;
  };
  //id: string; email: string; username?: string; avatar?: string };
  activeRole: RoleCode;
  roles: RoleCode[];
  permissions: string[];
}): JwtPayload {
  return {
    org_id: user.org_id,
    org_register_no: user.org_register_no,
    org_legal_name: user.org_legal_name,
    org_phone: user.org_phone,
    org_email: user.org_email,
    org_address: user.org_address,
    org_head_name: user.org_head_name,
    org_head_phone: user.org_head_phone,
    org_head_email: user.org_head_email,
    id: user.id,
    email: user.email,
    username: user.username,
    user_level_id: user.user_level_id,
    user_level_name: user.user_level_name,
    user_phone: user.user_phone,
    user_register_no: user.user_register_no,
    role_label: user.role_label,
    role_code: user.role_code,
    role_text: user.role_text,
    activeRole,
    roles,
    permissions,
  };
}
