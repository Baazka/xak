"use client";

import Form1 from "../forms/Form1";
import Form104 from "../forms/Form104";
import Form2 from "../forms/Form2";
import FormAuditCompany from "../forms/FormAuditCompany";
import FormAuditCompanyOwner from "../forms/FormAuditCompanyOwner";
type AuditContentProps = {
  activeForm: string;
  auditData: any;
};

export default function AuditContent({ activeForm, auditData }: AuditContentProps) {
  return (
    <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm overflow-y-auto h-[74vh]">
      {activeForm === "m01" && <FormAuditCompany auditId={auditData.auditId} />}
      {activeForm === "m02" && <FormAuditCompanyOwner auditId={auditData.auditId} />}
      {activeForm === "m03" && <Form104 auditId={auditData.auditId} />}
      {activeForm === "form1" && <Form1 data={auditData} />}
      {activeForm === "form2" && <Form2 data={auditData} />}
      {activeForm === "form3" && <div>Маягт 3</div>}
      {activeForm === "form4" && <div>Маягт 4</div>}
      {activeForm === "form5" && <div>Маягт 5</div>}
    </div>
  );
}
