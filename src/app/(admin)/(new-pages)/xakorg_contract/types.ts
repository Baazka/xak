export type XakorgContractRow = {
  contract_id: number;
  contract_name: string;
  contract_begin_date: Date | null;
  contract_end_date: Date | null;
  contract_file_id: number | null;
  status: string;
};
