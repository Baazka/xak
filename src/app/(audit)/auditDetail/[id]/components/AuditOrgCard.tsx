"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { set } from "date-fns";

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
  audTeamResult: any[]; // Adjust the type as needed
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
  const [teamData, setTeamData] = useState<AuditTeamMember[] | null>([]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setLoading(true);

        const res = await fetchWithAuth("/api/audit/Header/meta?aud_id=" + auditId, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to load metadata");
        }
        const data = await res.json();

        setHeaderData(data.audOrgResult);
        setTeamData(data.audTeamResult);
      } catch (error) {
        console.error("Error loading metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMeta();
  }, []);
  console.log("team data ---> ", teamData);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
        {/* Title + Toggle */}
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
          type="button"
          onClick={onToggleOrg}
          className="flex flex-1 items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-gray-50"
        >
          <div>
            <p className="text-sm text-gray-500">Байгууллагын мэдээлэл</p>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
              openOrg ? "rotate-180" : ""
            }`}
          />
        </button>
        <button
          type="button"
          onClick={onToggleAudit}
          className="flex flex-1 items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-gray-50"
        >
          <div>
            <p className="text-sm text-gray-500">
              Аудитын мэдээлэл {headerData?.audTeamResult?.length}
            </p>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
              openAudit ? "rotate-180" : ""
            }`}
          />
        </button>
        <div className="flex flex-col items-start gap-1 border-l border-gray-300 pl-4">
          <div className="flex items-center justify-center gap-1.5 ">
            <p className="text-sm text-gray-800">Аудитын төлөв:</p>
            <p className="text-sm text-gray-950 font-semibold">{headerData?.aud_status_name}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/audit")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Буцах
        </Button>
      </div>

      {/* ORG CONTENT */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          openOrg ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-4 py-4 md:px-5">
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <div className="grid grid-auto-flow:column grid-cols-3 gap-4">
                <div className="border-l border-gray-300 pl-4">
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
          </div>
        </div>
      </div>
      {/* AUDIT CONTENT */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          openAudit ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-4 py-4 md:px-5">
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <div className="grid grid-auto-flow:column grid-cols-2 gap-4">
                <div className="border-r-2 border-gray-300 pr-4">
                  <div className="flex items-center justify-between">
                    <div></div>
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
                    <div></div>
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
                <div className="border-l-2 border-gray-300 pl-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoadingScreen show={loading} />
    </div>
  );
}
