import { RoleCode } from "@/app/config/roleHome";

export type AuthUser = {
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
  firstname?: string;
  lastname?: string;
  user_phone: string;
  user_register_no?: string;
  role_label: string;
  role_code: string;
  role_text: string;

  activeRole: RoleCode;
  roles: RoleCode[];
  permissions: string[];
};
