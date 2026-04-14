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
  aud_file_id: number;

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
    <div className="relative z-20 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
        <div className="flex flex-col items-start gap-1 border-r border-gray-300 pr-4 dark:border-gray-700">
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-sm text-gray-800 dark:text-gray-100">Аудитын нэр:</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{headerData?.aud_name}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-sm text-gray-800 dark:text-gray-100">Аудитын код:</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{headerData?.aud_code}</p>
          </div>
        </div>
        <button
          onClick={onToggleOrg}
          className="flex flex-1 items-center justify-between rounded-xl px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Байгууллагын мэдээлэл</p>
          </div>
          <ChevronDown
            className={`text-gray-600 transition dark:text-gray-300 ${openOrg ? "rotate-180" : ""}`}
          />
        </button>

        <button
          onClick={onToggleAudit}
          className="flex flex-1 items-center justify-between rounded-xl px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Аудитын мэдээлэл</p>
          </div>
          <ChevronDown
            className={`text-gray-600 transition dark:text-gray-300 ${openAudit ? "rotate-180" : ""}`}
          />
        </button>

        <div className="border-l border-gray-300 pl-4 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {headerData?.aud_status_name}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/audit")}
          className="dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Буцах
        </Button>
      </div>

      {openOrg && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="grid grid-cols-[180px_1fr] gap-y-2 pl-4">
              <p className="text-gray-500 dark:text-gray-400">Байгууллагын нэр:</p>
              <span className="text-gray-900 dark:text-gray-100">
                {headerData?.org_legal_name ?? "-"}
              </span>

              <p className="text-gray-500 dark:text-gray-400">Байгууллагын регистр:</p>
              <span className="text-gray-900 dark:text-gray-100">
                {headerData?.org_regno ?? "-"}
              </span>
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-y-2 border-l border-gray-300 pl-4 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">Удирдлагын нэр:</p>
              <span className="text-gray-900 dark:text-gray-100">
                {headerData?.org_head_name ?? "-"}
              </span>

              <p className="text-gray-500 dark:text-gray-400">Удирдлагын утас:</p>
              <span className="text-gray-900 dark:text-gray-100">
                {headerData?.org_head_phone ?? "-"}
              </span>

              <p className="text-gray-500 dark:text-gray-400">Удирдлагын мэйл:</p>
              <span className="text-gray-900 dark:text-gray-100">
                {headerData?.org_head_email ?? "-"}
              </span>
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-y-2 border-l border-gray-300 pl-4 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">Нягтлан бодогчийн нэр:</p>
              <span className="text-gray-900 dark:text-gray-100">
                {headerData?.org_acc_name ?? "-"}
              </span>

              <p className="text-gray-500 dark:text-gray-400">Нягтлан бодогчийн утас:</p>
              <span className="text-gray-900 dark:text-gray-100">
                {headerData?.org_acc_phone ?? "-"}
              </span>

              <p className="text-gray-500 dark:text-gray-400">Нягтлан бодогчийн мэйл:</p>
              <span className="text-gray-900 dark:text-gray-100">
                {headerData?.org_acc_email ?? "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {openAudit && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-4">
            <div className="pl-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Аудитын үндсэн мэдээлэл
                </p>
                <Edit className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-[130px_1fr] items-start">
                  <p className="text-gray-500 dark:text-gray-400">Аудитын нэр:</p>
                  <span className="text-gray-900 dark:text-gray-100">
                    {headerData?.aud_name ?? "-"}
                  </span>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-start">
                  <p className="text-gray-500 dark:text-gray-400">Аудитын жил:</p>
                  <span className="text-gray-900 dark:text-gray-100">
                    {headerData?.aud_year ?? "-"}
                  </span>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-start">
                  <p className="text-gray-500 dark:text-gray-400">Аудитын огноо:</p>
                  <span className="text-gray-900 dark:text-gray-100">
                    {headerData?.aud_begin_date ?? "-"} - {headerData?.aud_end_date ?? "-"}
                  </span>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-start">
                  <p className="text-gray-500 dark:text-gray-400">Аудитын гэрээ:</p>
                  <a
                    href={`/api/files/download/${headerData?.aud_file_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Гэрээ файл
                  </a>
                </div>
              </div>
            </div>

            <div className="col-span-2 border-l border-gray-300 pl-4 dark:border-gray-700">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Аудитын багийн мэдээлэл
                </p>
                <Edit className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  {teamData
                    ?.filter((a) => a.team_role_id !== 6)
                    .map((member) => (
                      <div key={member.team_id} className="grid grid-cols-[150px_1fr] items-start">
                        <p className="text-gray-500 dark:text-gray-400">{member.role_text}:</p>
                        <span className="text-gray-900 dark:text-gray-100">
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
                        <p className="text-gray-500 dark:text-gray-400">{member.role_text}:</p>
                        <span className="text-gray-900 dark:text-gray-100">
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
