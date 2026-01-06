import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

import React from "react";

export const metadata: Metadata = {
  title: "Next.js Forgot Password | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Password Forgot page for TailAdmin Dashboard Template",
  // other metadata
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
