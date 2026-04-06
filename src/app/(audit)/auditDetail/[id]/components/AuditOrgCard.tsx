"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type AuditOrgCardProps = {
  open: boolean;
  onToggle: () => void;
  data: {
    orgName?: string;
    regNo?: string;
  };
};

export default function AuditOrgCard({ open, onToggle, data }: AuditOrgCardProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
        <Button variant="outline" size="sm" onClick={() => router.push("/audit")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Буцах
        </Button>

        {/* Title + Toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-gray-50"
        >
          <div>
            <p className="text-sm text-gray-500">Байгууллагын мэдээлэл</p>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* CONTENT */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-4 py-4 md:px-5">
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <div>Нэр: {data.orgName}</div>
              <div>Регистр: {data.regNo}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
