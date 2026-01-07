import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <div>Invalid reset link</div>;
  }

  return <ResetPasswordForm token={token} />;
}
