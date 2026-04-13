"use client";

import { ArrowLeft, ChevronDown, Edit } from "lucide-react";
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

        console.log(teamData, "teamData");
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
          </div>
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

      {openOrg && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border bg-white p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="pl-4 grid grid-cols-[180px_1fr] gap-y-2">
              <p className="text-gray-500">Байгууллагын нэр:</p>
              <span>{headerData?.org_legal_name ?? "-"}</span>

              <p className="text-gray-500">Байгууллагын регистр:</p>
              <span>{headerData?.org_regno ?? "-"}</span>
            </div>

            <div className="border-l border-gray-300 pl-4 grid grid-cols-[180px_1fr] gap-y-2">
              <p className="text-gray-500">Удирдлагын нэр:</p>
              <span>{headerData?.org_head_name ?? "-"}</span>

              <p className="text-gray-500">Удирдлагын утас:</p>
              <span>{headerData?.org_head_phone ?? "-"}</span>

              <p className="text-gray-500">Удирдлагын мэйл:</p>
              <span>{headerData?.org_head_email ?? "-"}</span>
            </div>

            <div className="border-l border-gray-300 pl-4 grid grid-cols-[180px_1fr] gap-y-2">
              <p className="text-gray-500">Нягтлан бодогчийн нэр:</p>
              <span>{headerData?.org_acc_name ?? "-"}</span>

              <p className="text-gray-500">Нягтлан бодогчийн утас:</p>
              <span>{headerData?.org_acc_phone ?? "-"}</span>

              <p className="text-gray-500">Нягтлан бодогчийн мэйл:</p>
              <span>{headerData?.org_acc_email ?? "-"}</span>
            </div>
          </div>
        </div>
      )}

      {openAudit && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border bg-white p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="pl-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Аудитын үндсэн мэдээлэл</p>
                <Edit className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-[130px_1fr] items-start">
                  <p className="text-gray-500">Аудитын нэр:</p>
                  <span>{headerData?.aud_name ?? "-"}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-start">
                  <p className="text-gray-500">Аудитын жил:</p>
                  <span>{headerData?.aud_year ?? "-"}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-start">
                  <p className="text-gray-500">Аудитын огноо:</p>
                  <span>
                    {headerData?.aud_begin_date ?? "-"} - {headerData?.aud_end_date ?? "-"}
                  </span>
                </div>
                <div className="grid grid-cols-[130px_1fr] items-start">
                  <p className="text-gray-500">Аудитын гэрээ:</p>
                  <a href="" className="text-blue-600 hover:underline">
                    Гэрээ файл
                  </a>
                </div>
              </div>
            </div>

            <div className="col-span-2 border-l border-gray-300 pl-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Аудитын багийн мэдээлэл</p>
                <Edit className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  {teamData
                    ?.filter((a) => a.team_role_id !== 6)
                    .map((member) => (
                      <div key={member.team_id} className="grid grid-cols-[150px_1fr] items-start">
                        <p className="text-gray-500">{member.role_text}:</p>
                        <span>
                          {member.user_firstname ?? "-"} ({member.user_phone ?? "-"})
                        </span>
                      </div>
                    ))}
                </div>

                <div className="space-y-2 text-sm">
                  {teamData
                    ?.filter((a) => a.team_role_id === 6)
                    .map((member) => (
                      <div key={member.team_id} className="grid grid-cols-[100px_1fr] items-start">
                        <p className="text-gray-500">{member.role_text}:</p>
                        <span>
                          {member.user_firstname ?? "-"} ({member.user_phone ?? "-"})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LoadingScreen show={loading} />
    </div>
  );
}
