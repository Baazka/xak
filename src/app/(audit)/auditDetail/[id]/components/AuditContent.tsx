"use client";

import Form104 from "../forms/Form104";
import Form105 from "../forms/Form105";
import Form106 from "../forms/Form106";
import Form201 from "../forms/Form201";
import Form202 from "../forms/Form202";
import Form203 from "../forms/Form203";
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
        case "201":
          content = <Form201 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "202":
          content = <Form202 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "203":
          content = <Form203 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        default:
          content = <div className="text-gray-700 dark:text-gray-300">Маягт олдсонгүй</div>;
      }
    }
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {active && (
        <div className="mb-4 border-b border-gray-200 pb-2 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {active.form_name}
          </h2>
        </div>
      )}
      {content}
    </div>
  );
}
