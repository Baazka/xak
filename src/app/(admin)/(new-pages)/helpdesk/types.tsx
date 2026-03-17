export type Task = {
  task_id: number;
  task_code: string;
  task_date: string;
  task_status_id: number;
  task_status_label: string;
  task_priority_id: number;
  task_priority_name: string;
  task_title: string;
  aud_code: string;
};

export type TaskForAdmin = {
  task_id: number;
  org_id: number;
  org_register_no: string;
  org_legal_name: string;
  task_code: string;
  task_date: string;
  task_status_id: number;
  task_status_label: string;
  task_priority_id: number;
  task_priority_name: string;
  task_title: string;
  aud_code: string;
};
