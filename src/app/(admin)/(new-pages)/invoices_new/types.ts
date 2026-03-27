export type InvoiceList = {
  inv_id: number;
  inv_no: string;
  inv_org_id: number;
  org_register_no: string;
  org_legal_name: string;
  inv_type_id: number;
  inv_type_name: string;
  inv_date: string;
  inv_aud_count: number;
  inv_amount: number;
  inv_status_id: number;
  inv_status_name: string;
  created_date: Date;
  inva_assign: number;
  inva_total: number;
};
