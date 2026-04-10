"use client";

import Form1 from "../forms/Form1";
import Form104 from "../forms/Form104";
import Form105 from "../forms/Form105";
import Form106 from "../forms/Form106";
import Form2 from "../forms/Form2";
import FormAuditCompany from "../forms/FormAuditCompany";
import FormAuditCompanyOwner from "../forms/FormAuditCompanyOwner";
import type { FormItem } from "../AuditClient";

type AuditContentProps = {
  activeForm: FormItem | null;
  forms: FormItem[];
  auditData: any;
};

export default function AuditContent({ activeForm, forms, auditData }: AuditContentProps) {
  const active = activeForm;
  let content: React.ReactNode = null;

  const staticForms: Record<string, React.ReactNode> = {
    M01: <FormAuditCompany auditId={auditData.auditId} />,
    M02: <FormAuditCompanyOwner auditId={auditData.auditId} />,
  };

  if (active) {
    if (staticForms[(active.form_code || "").toUpperCase()]) {
      content = staticForms[(active.form_code || "").toUpperCase()];
    } else {
      switch (active.form_code) {
        case "104":
          content = <Form104 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "105":
          content = <Form105 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "106":
          content = <Form106 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "form1":
          content = <Form1 data={auditData} />;
          break;
        case "form2":
          content = <Form2 data={auditData} />;
          break;
        default:
          content = <div>Маягт олдсонгүй</div>;
      }
    }
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {active && (
        <div className="mb-4 border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">{active.form_name}</h2>
        </div>
      )}
      {content}
    </div>
  );
}
