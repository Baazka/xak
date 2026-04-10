"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

export type HeaderData = {
  aud_id: number;
  aud_code: string;
  aud_name: string;
  aud_year: number;
  aud_begin_date: string;
  aud_end_date: string;
  aud_status_id: number;
  aud_status_name: string;
  aud_status_code: string;

  org_regno: string;
  org_legal_name: string;
  org_head_name: string;
  org_head_phone: string;
  org_head_email: string;
  org_acc_name: string;
  org_acc_phone: string;
  org_acc_email: string;
};

type AuditOrgCardProps = {
  openOrg: boolean;
  openAudit: boolean;
  onToggleOrg: () => void;
  onToggleAudit: () => void;
  auditId: number;
};

type AuditTeamMember = {
  aud_id: number;
  team_id: number;
  team_role_id: number;
  role_text: string;
  team_user_id: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
};

export default function AuditOrgCard({
  openOrg,
  openAudit,
  onToggleOrg,
  onToggleAudit,
  auditId,
}: AuditOrgCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [headerData, setHeaderData] = useState<HeaderData | null>(null);
  const [teamData, setTeamData] = useState<AuditTeamMember[]>([]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/Header/meta?aud_id=${auditId}`);
        const data = await res.json();

        setHeaderData(data.audOrgResult);
        setTeamData(data.audTeamResult || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMeta();
  }, [auditId]);

  return (
    <div className="relative z-20 rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
        <div className="flex flex-col items-start gap-1 border-r border-gray-300 pr-4">
          <div className="flex items-center justify-center gap-1.5 ">
            <p className="text-sm text-gray-800">Аудитын нэр:</p>
            <p className="text-sm text-gray-500">{headerData?.aud_name}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 ">
            <p className="text-sm text-gray-800">Аудитын код:</p>
            <p className="text-sm text-gray-500">{headerData?.aud_code}</p>
          </div>
        </div>

        <button
          onClick={onToggleOrg}
          className="flex flex-1 items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl"
        >
          <div>
            <p className="text-sm text-gray-500">Байгууллагын мэдээлэл</p>
          </div>
          <ChevronDown className={`transition ${openOrg ? "rotate-180" : ""}`} />
        </button>

        <button
          onClick={onToggleAudit}
          className="flex flex-1 items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl"
        >
          <div>
            <p className="text-sm text-gray-500">Аудитын мэдээлэл</p>
          </div>{" "}
          <ChevronDown className={`transition ${openAudit ? "rotate-180" : ""}`} />
        </button>

        <div className="border-l pl-4">
          <span className="text-sm font-semibold">{headerData?.aud_status_name}</span>
        </div>

        <Button size="sm" variant="outline" onClick={() => router.push("/audit")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Буцах
        </Button>
      </div>

      {/* ORG DROPDOWN */}
      {openOrg && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border bg-white shadow-lg p-4">
          <div className="grid grid-auto-flow:column grid-cols-3 gap-4">
            <div className="pl-4">
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-800">Байгууллагын нэр:</p>
                <input type="text" value={headerData?.org_legal_name ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-800">Байгууллагын регистр:</p>
                <input type="text" value={headerData?.org_regno ?? ""} readOnly />
              </div>
            </div>
            <div className="border-l border-gray-300 pl-4">
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-800">Удирдлагын нэр:</p>
                <input type="text" value={headerData?.org_head_name ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-800">Удирдлагын утас:</p>
                <input type="text" value={headerData?.org_head_phone ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1">
                <p className="text-sm text-gray-800">Удирдлагын мэйл:</p>
                <input type="text" value={headerData?.org_head_email ?? ""} readOnly />
              </div>
            </div>
            <div className="border-l border-gray-300 pl-4">
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-800">Нягтлан бодогчийн нэр:</p>
                <input type="text" value={headerData?.org_acc_name ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-800">Нягтлан бodогчийн утас:</p>
                <input type="text" value={headerData?.org_acc_phone ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-800">Нягтлан бодогчийн мэйл:</p>
                <input type="text" value={headerData?.org_acc_email ?? ""} readOnly />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT DROPDOWN */}
      {openAudit && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border bg-white shadow-lg p-4">
          <div className="grid grid-auto-flow:column grid-cols-2 gap-4">
            <div className="border-r-2 border-gray-300 pr-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-950 font-semibold">Аудитын үндсэн мэдээлэл</p>
                </div>
                <div>
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    засах
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-sm text-gray-950">Аудитын нэр:</p>
                <input type="text" value={headerData?.aud_name ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-sm text-gray-950">Аудитын жил:</p>
                <input type="text" value={headerData?.aud_year ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-sm text-gray-950">Аудит дуусах хугацаа:</p>
                <input type="text" value={headerData?.aud_end_date ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-sm text-gray-950">Аудит дуусах хугацаа:</p>
                <input type="text" value={headerData?.aud_end_date ?? ""} readOnly />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-sm text-gray-950">Аудитын гэрээ:</p>
                <a href="" className="text-blue-600 hover:underline">
                  Гэрээ файл
                </a>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3 mt-2">
                <div className="flex items-center gap-1 justify-center">
                  <p className="text-sm text-gray-950 font-semibold">Аудитын багийн мэдээлэл</p>
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    засах
                  </button>
                </div>
              </div>

              {teamData?.map((member) => (
                <div key={member.team_id} className="grid items-center gap-1 mt-2 grid-cols-2">
                  <p className="text-sm text-gray-950 text-end">{member.role_text}:</p>
                  <input
                    type="text"
                    value={member.user_firstname + " (" + member.user_phone + ")"}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <LoadingScreen show={loading} />
    </div>
  );
}
