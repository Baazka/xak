"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon, PaperPlaneIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

type Org = {
  org_legal_name: string | null;
  org_register_no: string | null;
  org_phone: string | null;
  org_email: string | null;
  org_address: string | null;
  org_head_name: string | null;
  org_head_phone: string | null;
  org_head_email: string | null;
};

export default function SignUpForm() {
  const [org, setOrg] = useState<Org>({
    org_legal_name: null,
    org_register_no: null,
    org_phone: null,
    org_email: null,
    org_address: null,
    org_head_name: null,
    org_head_phone: null,
    org_head_email: null,
  });

  const { toast } = useToast();
  const router = useRouter();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(org),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        toast("error", data.message || "Алдаа гарлаа");
      }

      toast("success", "Амжилттай бүртгүүллээ. Бүртгэл баталгаажсаны дараа нэвтрэх эрх үүснэ.");

      router.push("/signin");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-17/20 mx-auto">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Бүртгэл үүсгэх хүсэлт
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Аудитын хуулийн этгээдийн мэдээллээ оруулна уу
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Аудитын байгууллагын нэр<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={org.org_legal_name ?? ""}
                      onChange={(e) => setOrg({ ...org, org_legal_name: e.target.value })}
                      placeholder="Байгууллагын нэр"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Байгууллагын регистрийн дугаар<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={org.org_register_no ?? ""}
                      onChange={(e) => setOrg({ ...org, org_register_no: e.target.value })}
                      placeholder="Регистр"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Байгууллагын утас<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={org.org_phone ?? ""}
                      onChange={(e) => setOrg({ ...org, org_phone: e.target.value })}
                      placeholder="Утас"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Байгууллагын мэйл хаяг<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={org.org_email ?? ""}
                      onChange={(e) => setOrg({ ...org, org_email: e.target.value })}
                      placeholder="Мэйл"
                    />
                  </div>
                </div>
                <div>
                  <Label>
                    Байгууллагын хаяг<span className="text-error-500">*</span>
                  </Label>
                  <textarea
                    className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden bg-transparent text-gray-900 dark:text-gray-300 text-gray-900 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    value={org.org_address ?? ""}
                    onChange={(e) => setOrg({ ...org, org_address: e.target.value })}
                    placeholder="Хаяг"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <Label>
                      Удирдлагын нэр<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={org.org_head_name ?? ""}
                      onChange={(e) => setOrg({ ...org, org_head_name: e.target.value })}
                      placeholder="Нэр"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Удирдлагын утас<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={org.org_head_phone ?? ""}
                      onChange={(e) => setOrg({ ...org, org_head_phone: e.target.value })}
                      placeholder="Утас"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Удирдлагын мэйл хаяг<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={org.org_head_email ?? ""}
                      onChange={(e) => setOrg({ ...org, org_head_email: e.target.value })}
                      placeholder="Мэйл"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    className="flex items-center justify-center w-2/3 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                    onClick={handleSubmit}
                  >
                    <PaperPlaneIcon className="w-4 h-4 mr-2" />
                    {loading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
                    )}
                    {loading ? "Илгээж байна..." : "Хүсэлт илгээх"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Буцах
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
