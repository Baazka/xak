export type Audit = {
  aud_id: number;
  comp_id: number;
  comp_reg_no: string;
  comp_legal_name: string;
  aud_code: string;
  aud_type_id: number;
  aud_type_name: string;
  aud_year: number;
  aud_name: string;
  aud_begin_date: string;
  aud_end_date: string;
  aud_status_id: number;
  aud_status_label: string;
};

export type AuditForAdmin = {
  aud_id: number;
  org_id: number;
  org_register_no: string;
  org_legal_name: string;
  comp_id: number;
  comp_reg_no: string;
  comp_legal_name: string;
  aud_code: string;
  aud_type_id: number;
  aud_type_name: string;
  aud_year: number;
  aud_name: string;
  aud_begin_date: string;
  aud_end_date: string;
  aud_status_id: number;
  aud_status_label: string;
};
