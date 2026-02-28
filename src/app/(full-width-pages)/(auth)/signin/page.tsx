import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  // title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  title: "QVerify - Санхүүгийн аудитын цахим систем",
  // description: "This is Next.js Signin Page TailAdmin Dashboard Template",
  description: "QVerify - Санхүүгийн аудитын цахим систем V1.0",
};

export default function SignIn() {
  return <SignInForm />;
}
