"use client";

import AppAuditHeader from "@/layout/AppAuditHeader";
import React from "react";
import { NotificationProvider } from "@/context/NotificationContext";
import HelpDeskProvider from "@/context/HelpDeskContext";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      {/* Main Content Area */}

      {/* Header */}
      <AppAuditHeader />
      {/* Page Content */}
      <HelpDeskProvider>
        <div>{children}</div>
      </HelpDeskProvider>
    </NotificationProvider>
  );
}
