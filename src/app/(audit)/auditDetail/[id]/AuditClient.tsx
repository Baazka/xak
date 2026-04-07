"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuditOrgCard from "./components/AuditOrgCard";
import AuditSidebar from "./components/AuditSidebar";
import AuditContent from "./components/AuditContent";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export type FormItem = {
  id: string;
  short: string;
  full: string;
};

const forms: FormItem[] = [
  { id: "m01", short: "М01", full: "Маягт 01" },
  { id: "m02", short: "М02", full: "Маягт 02" },
  { id: "m03", short: "М03", full: "Маягт 03" },
  { id: "m04", short: "М04", full: "Маягт 04" },
  { id: "form1", short: "М1", full: "Маягт 1" },
  { id: "form2", short: "М2", full: "Маягт 2" },
];

export default function AuditDetailClient({ auditId }: { auditId: number }) {
  const [openOrg, setOpenOrg] = useState(false);
  const [openAudit, setOpenAudit] = useState(false);
  const [activeForm, setActiveForm] = useState("m04");

  // дараа нь API-аас ирэх shared data энд байна
  const auditData = {
    auditId: auditId,
    orgName: "Байгууллагын нэр",
    regNo: "1234567",
  };

  return (
    <div className="max-w-full space-y-4 p-4">
      <AuditOrgCard
        openOrg={openOrg}
        openAudit={openAudit}
        onToggleOrg={() => {
          setOpenAudit(false);
          setOpenOrg((prev) => !prev);
        }}
        onToggleAudit={() => {
          setOpenOrg(false);
          setOpenAudit((prev) => !prev);
        }}
        auditId={auditId}
      />

      <div className="flex gap-4">
        <AuditSidebar forms={forms} activeForm={activeForm} onChange={setActiveForm} />

        <AuditContent activeForm={activeForm} auditData={auditData} />
      </div>
    </div>
  );
}
