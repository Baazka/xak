"use client";

import AppAuditHeader from "@/layout/AppAuditHeader";
import React from "react";
import { usePathname } from "next/navigation";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <NotificationProvider>
      <div className="min-h-screen ">
        {/* Main Content Area */}
        <div className={`flex-1`}>
          {/* Header */}
          <AppAuditHeader />
          {/* Page Content */}
          <div className="px-4 py-6">{children}</div>
        </div>
      </div>
    </NotificationProvider>
  );
}
