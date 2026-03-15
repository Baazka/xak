export type User = {
  role_id: number;
  role_text: string;
  user_id: number;
  user_firstname: string;
  user_email: string;
  user_phone: string;
  user_register_no: string;
  user_password: string;
};

export type UserForAdmin = {
  role_text: string;
  org_id: number;
  org_register_no: string;
  org_legal_name: string;
  user_id: number;
  user_register_no: string;
  user_firstname: string;
  user_email: string;
  user_phone: string;
  user_role_name: string;
};
