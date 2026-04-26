"use client";

import type { FormItem } from "../AuditClient";
import FormAuditCompany from "../forms/FormAuditCompany";
import FormAuditCompanyOwner from "../forms/FormAuditCompanyOwner";
import Form104 from "../forms/Form104";
import Form105 from "../forms/Form105";
import Form106 from "../forms/Form106";
import Form201 from "../forms/Form201";
import Form202 from "../forms/Form202";
import Form203 from "../forms/Form203";
import Form204 from "../forms/Form204";
import Form205 from "../forms/Form205";
import Form206 from "../forms/Form206";
import Form207 from "../forms/Form207";
import Form208 from "../forms/Form208";
import Form209 from "../forms/Form209";
import Form301 from "../forms/Form301";
import Form302 from "../forms/Form302";
import Form303 from "../forms/Form303";
import Form304 from "../forms/Form304";
import Form305 from "../forms/Form305";
import Form306 from "../forms/Form306";
import Form307 from "../forms/Form307";
import Form308 from "../forms/Form308";
import Form401 from "../forms/Form401";

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
        case "204":
          content = <Form204 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "205":
          content = <Form205 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "206":
          content = <Form206 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "207":
          content = <Form207 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "208":
          content = <Form208 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "209":
          content = <Form209 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "302":
          content = <Form302 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "301":
          content = <Form301 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "303":
          content = <Form303 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "304":
          content = <Form304 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "305":
          content = <Form305 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "306":
          content = <Form306 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "307":
          content = <Form307 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "308":
          content = <Form308 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        case "401":
          content = <Form401 auditId={auditData.auditId} formListId={active.form_id} />;
          break;
        default:
          content = <div className="text-gray-700 dark:text-gray-300">Маягт олдсонгүй</div>;
      }
    }
  }

  return (
    <div
      id="print-area"
      className="print-clean h-full min-h-0 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
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
