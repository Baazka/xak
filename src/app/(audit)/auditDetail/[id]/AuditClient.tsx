"use client";

import { useEffect, useMemo, useState } from "react";
import AuditOrgCard from "./components/AuditOrgCard";
import AuditSidebar from "./components/AuditSidebar";
import AuditContent from "./components/AuditContent";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export type FormItem = {
  form_id: number;
  form_name: string;
  form_stage: string;
  form_code: string;
};

export type GroupedForms = {
  stage: string;
  items: FormItem[];
};

export default function AuditDetailClient({ auditId }: { auditId: number }) {
  const [openOrg, setOpenOrg] = useState(false);
  const [openAudit, setOpenAudit] = useState(false);
  const [activeForm, setActiveForm] = useState<FormItem | null>(null);
  const [forms, setForms] = useState<FormItem[]>([]);

  useEffect(() => {
    const loadForms = async () => {
      try {
        const res = await fetchWithAuth("/api/refs/audit_form");
        const data = await res.json();
        const rows: FormItem[] = Array.isArray(data?.data) ? data.data : [];

        setForms(rows);

        const defaultForm = rows.find((f) => f.form_code === "308");
        if (defaultForm) {
          setActiveForm(defaultForm);
        } else if (rows.length > 0) {
          setActiveForm(rows[0]);
        }
      } catch (err) {
        console.error(err);
        setForms([]);
        setActiveForm(null);
      }
    };

    loadForms();
  }, []);

  const mergedForms = useMemo(() => {
    return [...forms];
  }, [forms]);

  const groupedForms: GroupedForms[] = useMemo(() => {
    const map = new Map<string, FormItem[]>();

    for (const form of forms) {
      const stage = form.form_stage || "Бусад";
      if (!map.has(stage)) {
        map.set(stage, []);
      }
      map.get(stage)!.push(form);
    }

    return Array.from(map.entries()).map(([stage, items]) => ({
      stage,
      items,
    }));
  }, [forms]);

  const auditData = {
    auditId,
  };

  return (
    <div className="relative space-y-4 px-4 pt-4">
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
      <div className="flex h-[74vh] gap-4">
        <div className="h-full shrink-0">
          <AuditSidebar
            groupedForms={groupedForms}
            activeForm={activeForm}
            onChange={setActiveForm}
          />
        </div>

        <div className="h-full min-w-0 flex-1">
          <AuditContent activeForm={activeForm} forms={mergedForms} auditData={auditData} />
        </div>
      </div>
    </div>
  );
}
