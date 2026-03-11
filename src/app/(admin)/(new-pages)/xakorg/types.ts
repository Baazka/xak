export type XakOrg = {
  id: number;
  name: string;
  reg_no: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
};

export type XakOrgNew = {
  org_id: number;
  org_register_no: string;
  org_legal_name: string;
  org_phone: string;
  org_email: string;
  org_address?: string;
  org_head_name: string;
  org_head_phone: string;
  org_head_email?: string;
  org_status: string;
  created_by?: number;
  created_date?: string;
};
