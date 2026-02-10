// src/app/(full-width-pages)/(auth)/set-password/page.tsx
import SetPasswordForm from "@/components/auth/SetPasswordForm";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token = "", email = "" } = await searchParams;

  return <SetPasswordForm token={token} email={email} />;
}
