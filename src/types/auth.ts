import { RoleCode } from "@/app/config/roleHome";

export type AuthUser = {
  id: number;
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  avatar?: string;

  activeRole: RoleCode;
  roles: RoleCode[];
  permissions: string[];
};
