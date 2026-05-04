"use client";

import { ArrowLeft, ChevronDown, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DatePicker from "@/components/form/date-picker";
import FileUpload, { UploadedFileItem } from "@/components/ui/FileUpload";
import type { StepTwoData } from "@/components/audit/StepTwo";
import StepTwo from "@/components/audit/StepTwo";
import YearStepper from "@/components/form/YearStepper";
import { validateForm, FormErrors, ValidationSchema } from "@/utils/validation";
import { useToast } from "@/context/ToastContext";

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
  aud_contract_file_id: number;

  info_reg_no: string;
  info_legal_name: string;
  info_head_name: string;
  info_head_phone: string;
  info_head_email: string;
  info_acc_name: string;
  info_acc_phone: string;
  info_acc_email: string;
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

type UserItem = {
  user_id: number;
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
  const [openBasicInfoModal, setOpenBasicInfoModal] = useState(false);
  const [openTeamModal, setOpenTeamModal] = useState(false);
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [userID, setUserIDs] = useState<UserItem[]>([]);
  const [basicErrors, setBasicErrors] = useState<FormErrors<typeof basicForm>>({});
  const [teamErrors, setTeamErrors] = useState<FormErrors<StepTwoData>>({});
  const { toast } = useToast();

  const [savingType, setSavingType] = useState<"basic" | "team" | null>(null);

  const [basicForm, setBasicForm] = useState({
    aud_name: "",
    aud_year: "",
    aud_begin_date: "",
    aud_end_date: "",
    aud_code: "",
    aud_contract_file_id: null as number | null,
  });

  const [teamStepValues, setTeamStepValues] = useState<StepTwoData>({
    usertype3: 0,
    usertype4: 0,
    usertype5: 0,
    usertype6: [],
  });

  const userOptions = userID.map((item) => ({
    value: item.user_id,
    label: `${item.user_firstname} (${item.user_phone})`,
    regNo: item.user_email,
  }));

  const basicSchema: ValidationSchema<typeof basicForm> = {
    aud_name: { required: true, label: "Аудитын нэр" },
    aud_year: { required: true, label: "Аудитын жил" },
    aud_begin_date: { required: true, label: "Эхлэх хугацаа" },
    aud_end_date: { required: true, label: "Дуусах хугацаа" },
  };

  const teamSchema: ValidationSchema<StepTwoData> = {
    usertype3: { required: true, label: "Ахлах аудитор" },
    usertype4: { required: true, label: "Аудитор" },
    usertype5: { required: true, label: "Хянагч" },
  };

  const loadMeta = async () => {
    try {
      setLoading(true);

      const [res, resUser] = await Promise.all([
        fetchWithAuth(`/api/audit/Header/meta?aud_id=${auditId}`),
        fetchWithAuth("/api/auditadd/meta", {
          method: "GET",
        }),
      ]);

      if (!res.ok || !resUser.ok) {
        throw new Error("Failed to load metadata");
      }

      const data = await res.json();
      const dataUser = await resUser.json();
      console.log("team data ------>", data);

      const userList: UserItem[] = dataUser.users ?? [];

      setHeaderData(data.audOrgResult ?? null);
      setTeamData(data.audTeamResult ?? []);
      setUserIDs(userList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async (type: "basic" | "team") => {
    const errors =
      type === "basic"
        ? validateForm(basicForm, basicSchema)
        : validateForm(teamStepValues, teamSchema);

    if (Object.keys(errors).length > 0) {
      if (type === "basic") {
        setBasicErrors(errors as FormErrors<typeof basicForm>);
      } else {
        setTeamErrors(errors as FormErrors<StepTwoData>);
      }
      return;
    }

    setBasicErrors({});
    setTeamErrors({});
    try {
      setSavingType(type);

      const body =
        type === "basic"
          ? {
              type: "basic",
              aud_id: auditId,
              aud_name: basicForm.aud_name,
              aud_year: Number(basicForm.aud_year),
              aud_begin_date: basicForm.aud_begin_date || null,
              aud_end_date: basicForm.aud_end_date || null,
              aud_contract_file_id: basicForm.aud_contract_file_id,
            }
          : {
              type: "team",
              aud_id: auditId,
              team_data: [
                teamStepValues.usertype3
                  ? { user_id: Number(teamStepValues.usertype3), role_id: 3 }
                  : null,
                teamStepValues.usertype4
                  ? { user_id: Number(teamStepValues.usertype4), role_id: 4 }
                  : null,
                teamStepValues.usertype5
                  ? { user_id: Number(teamStepValues.usertype5), role_id: 5 }
                  : null,
                ...teamStepValues.usertype6.map((id) => ({
                  user_id: Number(id),
                  role_id: 6,
                })),
              ].filter(Boolean),
            };

      const res = await fetchWithAuth(`/api/audit/Header`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      await loadMeta();

      if (type === "basic") {
        setOpenBasicInfoModal(false);
      } else {
        setOpenTeamModal(false);
      }

      toast("success", "Амжилттай хадгаллаа");
    } catch (error) {
      console.error(error);
      toast("error", "Хадгалахад алдаа гарлаа");
    } finally {
      setSavingType(null);
    }
  };

  useEffect(() => {
    loadMeta();
  }, [auditId]);

  useEffect(() => {
    if (!headerData) return;

    setBasicForm({
      aud_name: headerData.aud_name ?? "",
      aud_year: String(headerData.aud_year ?? ""),
      aud_begin_date: headerData.aud_begin_date ?? "",
      aud_end_date: headerData.aud_end_date ?? "",
      aud_code: headerData.aud_code ?? "",
      aud_contract_file_id: headerData.aud_contract_file_id ?? null,
    });
  }, [headerData]);

  useEffect(() => {
    if (!teamData?.length) return;

    setTeamStepValues({
      usertype3: teamData.find((x) => x.team_role_id === 3)?.team_user_id ?? 0,
      usertype4: teamData.find((x) => x.team_role_id === 4)?.team_user_id ?? 0,
      usertype5: teamData.find((x) => x.team_role_id === 5)?.team_user_id ?? 0,
      usertype6: teamData.filter((x) => x.team_role_id === 6).map((x) => x.team_user_id),
    });
  }, [teamData]);

  const handleAudYearChange = (field: string, value: string) => {
    setBasicForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleTeamStepChange = <K extends keyof StepTwoData>(field: K, value: StepTwoData[K]) => {
    setTeamStepValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
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
                  {headerData?.info_legal_name ?? "-"}
                </span>

                <p className="text-gray-500 dark:text-gray-400">Байгууллагын регистр:</p>
                <span className="text-gray-900 dark:text-gray-100">
                  {headerData?.info_reg_no ?? "-"}
                </span>
              </div>

              <div className="grid grid-cols-[180px_1fr] gap-y-2 border-l border-gray-300 pl-4 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">Удирдлагын нэр:</p>
                <span className="text-gray-900 dark:text-gray-100">
                  {headerData?.info_head_name ?? "-"}
                </span>

                <p className="text-gray-500 dark:text-gray-400">Удирдлагын утас:</p>
                <span className="text-gray-900 dark:text-gray-100">
                  {headerData?.info_head_phone ?? "-"}
                </span>

                <p className="text-gray-500 dark:text-gray-400">Удирдлагын мэйл:</p>
                <span className="text-gray-900 dark:text-gray-100">
                  {headerData?.info_head_email ?? "-"}
                </span>
              </div>

              <div className="grid grid-cols-[180px_1fr] gap-y-2 border-l border-gray-300 pl-4 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">Нягтлан бодогчийн нэр:</p>
                <span className="text-gray-900 dark:text-gray-100">
                  {headerData?.info_acc_name ?? "-"}
                </span>

                <p className="text-gray-500 dark:text-gray-400">Нягтлан бодогчийн утас:</p>
                <span className="text-gray-900 dark:text-gray-100">
                  {headerData?.info_acc_phone ?? "-"}
                </span>

                <p className="text-gray-500 dark:text-gray-400">Нягтлан бодогчийн мэйл:</p>
                <span className="text-gray-900 dark:text-gray-100">
                  {headerData?.info_acc_email ?? "-"}
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
                  <button
                    type="button"
                    onClick={() => setOpenBasicInfoModal(true)}
                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
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
                      href={`/api/files/download/${headerData?.aud_contract_file_id}`}
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
                  <button
                    type="button"
                    onClick={() => setOpenTeamModal(true)}
                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    {teamData
                      ?.filter((a) => a.team_role_id !== 6)
                      .map((member) => (
                        <div
                          key={member.team_id}
                          className="grid grid-cols-[150px_1fr] items-start"
                        >
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
                        <div
                          key={member.team_id}
                          className="grid grid-cols-[100px_1fr] items-start"
                        >
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
      <Dialog open={openBasicInfoModal} onOpenChange={setOpenBasicInfoModal}>
        <DialogContent className="z-[1000] sm:max-w-[600px] dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Аудитын үндсэн мэдээлэл засах</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                Аудитын нэр
              </label>
              <input
                type="text"
                value={basicForm.aud_name}
                onChange={(e) => {
                  setBasicForm((prev) => ({ ...prev, aud_name: e.target.value }));
                  setBasicErrors((prev) => ({ ...prev, aud_name: "" }));
                }}
                className={`rounded-lg border px-3 py-2 text-sm outline-none dark:bg-gray-800 dark:text-gray-100 ${
                  basicErrors.aud_name
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                }`}
              />
              {basicErrors.aud_name && (
                <p className="text-xs text-red-500">{basicErrors.aud_name}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Аудитын жил
                </label>
                <YearStepper
                  value={basicForm.aud_year}
                  lessYear={5}
                  onChange={(value) => handleAudYearChange("aud_year", value)}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Аудитын код
                </label>
                <input
                  type="text"
                  value={basicForm.aud_code}
                  readOnly
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <DatePicker
                  id="basic_aud_begin_date"
                  label="Эхлэх хугацаа"
                  value={basicForm.aud_begin_date ?? ""}
                  onChange={(selectedDates) => {
                    const d = selectedDates[0];

                    setBasicForm((prev) => ({
                      ...prev,
                      aud_begin_date: d ? d.toISOString().slice(0, 10) : "",
                    }));
                  }}
                  size="md"
                  isStatic={true}
                />
              </div>

              <div className="grid gap-2">
                <DatePicker
                  id="basic_aud_end_date"
                  label="Дуусах хугацаа"
                  value={basicForm.aud_end_date ?? ""}
                  minDate={basicForm.aud_begin_date ?? undefined}
                  onChange={(selectedDates) => {
                    const date = selectedDates?.[0];

                    setBasicForm((prev) => ({
                      ...prev,
                      aud_end_date: date ? date.toISOString().slice(0, 10) : "",
                    }));

                    setBasicErrors((prev) => ({ ...prev, aud_end_date: "" }));
                  }}
                  size="md"
                  isStatic={true}
                />
              </div>

              <div className="grid gap-2">
                <label className="block text-sm font-medium">Гэрээ хавсаргах</label>
                <FileUpload
                  accept=".pdf,.doc,.docx"
                  multiple={false}
                  auditId={9999999}
                  value={files}
                  onChange={(nextFiles) => {
                    setFiles(nextFiles);

                    if (!nextFiles.length) {
                      setBasicForm((prev) => ({ ...prev, aud_file_id: null }));
                    }
                  }}
                  onUploaded={(fileIds) => {
                    setBasicForm((prev) => ({ ...prev, aud_file_id: fileIds[0] ?? null }));
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenBasicInfoModal(false)}
                disabled={savingType !== null}
              >
                Болих
              </Button>
              <Button
                type="button"
                onClick={() => handleSave("basic")}
                disabled={savingType !== null}
              >
                {savingType === "basic" ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={openTeamModal} onOpenChange={setOpenTeamModal}>
        <DialogContent className="z-[1000] pointer-events-auto  !w-[60vw] !max-w-[60vw] dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Аудитын багийн мэдээлэл засах</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <StepTwo
              values={teamStepValues}
              userOptions={userOptions}
              errors={teamErrors}
              onChange={(field, value) => {
                handleTeamStepChange(field, value);
                setTeamErrors((prev) => ({ ...prev, [field]: "" }));
              }}
              useMenuPortal={false}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenTeamModal(false)}
              disabled={savingType !== null}
            >
              Болих
            </Button>
            <Button type="button" onClick={() => handleSave("team")} disabled={savingType !== null}>
              {savingType === "team" ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
