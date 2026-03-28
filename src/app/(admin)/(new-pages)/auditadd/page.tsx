"use client";

import AuditForm from "@/components/audit/AuditForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuth } from "@/context/AuthContext";

export default function AuditPage() {
  const { user } = useAuth();
  return (
    <div className="w-full">
      <div>
        <PageBreadcrumb pageTitle="Аудит үүсгэх" />
      </div>

      <AuditForm />
    </div>
  );
}
