"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuditOrgCard from "./components/AuditOrgCard";
import AuditSidebar from "./components/AuditSidebar";
import AuditContent from "./components/AuditContent";

export type FormItem = {
  id: string;
  short: string;
  full: string;
};

const forms: FormItem[] = [
  { id: "m01", short: "М01", full: "Маягт 01" },
  { id: "form1", short: "М1", full: "Маягт 1" },
  { id: "form2", short: "М2", full: "Маягт 2" },
  { id: "form3", short: "М3", full: "Маягт 3" },
  { id: "form4", short: "М4", full: "Маягт 4" },
  { id: "form5", short: "М5", full: "Маягт 5" },
  { id: "form6", short: "М6", full: "Маягт 6" },
  { id: "form7", short: "М7", full: "Маягт 7" },
  { id: "form8", short: "М8", full: "Маягт 8" },
  { id: "form9", short: "М9", full: "Маягт 9" },
  { id: "form10", short: "М10", full: "Маягт 10" },

  { id: "form11", short: "М11", full: "Маягт 11" },
  { id: "form12", short: "М12", full: "Маягт 12" },
  { id: "form13", short: "М13", full: "Маягт 13" },
  { id: "form14", short: "М14", full: "Маягт 14" },
  { id: "form15", short: "М15", full: "Маягт 15" },
  { id: "form16", short: "М16", full: "Маягт 16" },
  { id: "form17", short: "М17", full: "Маягт 17" },
  { id: "form18", short: "М18", full: "Маягт 18" },
  { id: "form19", short: "М19", full: "Маягт 19" },
  { id: "form20", short: "М20", full: "Маягт 20" },
];

export default function AuditDetailClient({ auditId }: { auditId: number }) {
  const [openOrg, setOpenOrg] = useState(false);
  const [activeForm, setActiveForm] = useState("form1");

  // дараа нь API-аас ирэх shared data энд байна
  const auditData = {
    auditId: auditId,
    orgName: "Байгууллагын нэр",
    regNo: "1234567",
  };

  return (
    <div className="max-w-full space-y-4 p-4">
      <AuditOrgCard open={openOrg} onToggle={() => setOpenOrg((prev) => !prev)} data={auditData} />

      <div className="flex gap-4">
        <AuditSidebar forms={forms} activeForm={activeForm} onChange={setActiveForm} />

        <AuditContent activeForm={activeForm} auditData={auditData} />
      </div>
    </div>
  );
}
