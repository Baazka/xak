// src/components/auth/OtpForm.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Label from "@/components/form/Label";
import Alert from "../ui/alert/Alert";

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

export default function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery); // хүсвэл readonly болго
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [cooldown, setCooldown] = useState(0); // секунд
  const canResend = cooldown === 0 && !resendLoading;

  const otpValue = useMemo(() => otp.join(""), [otp]);
  const otpComplete = otpValue.length === 6 && /^\d{6}$/.test(otpValue);

  const [alert, setAlert] = useState<{
    show: boolean;
    variant: "error" | "success" | "warning";
    title: string;
    message: string;
  }>({
    show: false,
    variant: "error",
    title: "",
    message: "",
  });

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // авто фокус
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    const v = onlyDigits(value).slice(-1); // 1 digit
    const updated = [...otp];
    updated[index] = v;
    setOtp(updated);

    if (v && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const updated = [...otp];

      if (updated[index]) {
        updated[index] = "";
        setOtp(updated);
        return;
      }

      if (index > 0) {
        updated[index - 1] = "";
        setOtp(updated);
        inputsRef.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = onlyDigits(event.clipboardData.getData("text")).slice(0, 6).split("");

    const updated = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i];
    setOtp(updated);

    const last = Math.min(pasted.length, 6) - 1;
    if (last >= 0) inputsRef.current[last]?.focus();
  };

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!email) {
      setAlert({
        show: true,
        variant: "error",
        title: "Алдаа",
        message: "Имэйл олдсонгүй. Дахин нэвтэрч оролдоно уу.",
      });
      return;
    }
    if (!otpComplete) {
      setAlert({
        show: true,
        variant: "error",
        title: "Алдаа",
        message: "6 оронтой OTP кодоо бүрэн оруулна уу.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAlert({
          show: true,
          variant: "error",
          title: "Алдаа",
          message: data?.error || "OTP баталгаажуулахад алдаа гарлаа",
        });
        return;
      }

      if (data?.next) {
        router.replace(data.next);
      } else {
        router.replace(`/set-password?email=${encodeURIComponent(email)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!canResend) return;
    if (!email) {
      setAlert({
        show: true,
        variant: "error",
        title: "Алдаа",
        message: "Имэйл олдсонгүй. Дахин нэвтэрч оролдоно уу.",
      });
      return;
    }

    setResendLoading(true);
    try {
      const res = await fetch("/api/users/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAlert({
          show: true,
          variant: "error",
          title: "Алдаа",
          message: data?.error || "OTP дахин илгээхэд алдаа гарлаа",
        });
        return;
      }

      setCooldown(60); // 60 сек
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            OTP баталгаажуулах
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Имэйл рүү очсон 6 оронтой кодыг оруулна уу.
          </p>
        </div>
        {alert.show && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}
        <form onSubmit={verify}>
          <div className="space-y-5">
            <div>
              <Label>И-мэйл</Label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4"
                placeholder="name@gmail.com"
                // readOnly
              />
            </div>

            <div>
              <Label>OTP код</Label>
              <div className="flex gap-2 sm:gap-4" id="otp-container">
                {otp.map((_, index) => (
                  <input
                    key={index}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    type="text"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(el) => {
                      if (el) inputsRef.current[index] = el;
                    }}
                    className="dark:bg-dark-900 otp-input h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !otpComplete}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60"
              >
                {loading ? "Шалгаж байна..." : "Баталгаажуулах"}
              </button>

              {/* Secondary action: text link */}
              <button
                type="button"
                onClick={resend}
                disabled={!canResend}
                className="text-sm whitespace-nowrap text-brand-500 hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {resendLoading
                  ? "Явуулж байна..."
                  : cooldown > 0
                    ? `Дахин илгээх (${cooldown})`
                    : "Дахин илгээх"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          Код ирэхгүй бол “Дахин илгээх”-ийг дарна уу.
        </div>
      </div>
    </div>
  );
}
