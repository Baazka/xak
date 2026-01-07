"use client";
import React, { useState } from "react";
import Link from "next/link";
import Label from "../form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.ok) {
      alert("Password updated");
      window.location.href = "/signin";
    } else {
      alert("Reset link invalid or expired");
    }
  }
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
            className="stroke-current"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
              stroke=""
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to dashboard
        </Link>
      </div> */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Нууц үг шинэчлэх
          </h1>
          {/* <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the email address linked to your account, and we’ll send you a link to reset your
            password.
          </p> */}
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* <!-- Email --> */}
              <div>
                <Label>
                  Мэйл хаяг <span className="text-error-500">*</span>{" "}
                </Label>
                <Input
                  placeholder="info@gmail.com"
                  type="password"
                  defaultValue={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* <!-- Button --> */}
              <div>
                <Button
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  size="sm"
                  type="submit"
                  disabled={loading}
                >
                  Шинэчлэх
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              <Link href="/" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Буцах
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
