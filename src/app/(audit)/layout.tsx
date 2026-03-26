"use client";

import AppHeader from "@/layout/AppHeader";
import React from "react";
import { usePathname } from "next/navigation";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Route-specific styles for the main content container
  const getRouteSpecificStyles = () => {
    switch (pathname) {
      case "/text-generator":
        return "";
      case "/code-generator":
        return "";
      case "/image-generator":
        return "";
      case "/video-generator":
        return "";
      default:
        return "p-2 mx-auto max-w-(--breakpoint-2xl) md:p-2";
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen ">
        {/* Main Content Area */}
        <div className={`flex-1`}>
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className={getRouteSpecificStyles()}>{children}</div>
        </div>
      </div>
    </NotificationProvider>
  );
}
