"use client";

import AppAuditHeader from "@/layout/AppAuditHeader";
import React from "react";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      {/* Main Content Area */}

      {/* Header */}
      <AppAuditHeader />
      {/* Page Content */}
      <div>{children}</div>
    </NotificationProvider>
  );
}
