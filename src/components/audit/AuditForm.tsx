"use client";

import { useEffect, useState, useTransition } from "react";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import LoadingScreen from "../ui/LoadingScreen";
import Alert from "../ui/alert/Alert";
const currentYear = new Date().getFullYear();

type UploadedFileItem = {
  file: File;
  preview?: string;
};

type FormDataType = {
  aud_name: string;
  aud_year: string;
  aud_comp_id: number;
  aud_begin_date: Date;
  aud_end_date: Date;
  usertype3: number;
  usertype4: number;
  usertype5: number;
  usertype6: number[];
  payment_method: string;
  attachments: UploadedFileItem[];
};

const initialData: FormDataType = {
  aud_name: "",
  aud_year: String(currentYear),
  aud_comp_id: 0,
  aud_begin_date: new Date(),
  aud_end_date: new Date(),
  usertype3: 0,
  usertype4: 0,
  usertype5: 0,
  usertype6: [],
  payment_method: "",
  attachments: [],
};

type CompItem = {
  comp_id: number;
  comp_legal_name: string;
  comp_reg_no?: string;
};

type UserItem = {
  user_id: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
};

export default function AuditForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>(initialData);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [compID, setOrgs] = useState<CompItem[]>([]);
  const [userID, setUserIDs] = useState<UserItem[]>([]);

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

  const updateField = <K extends keyof FormDataType>(field: K, value: FormDataType[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateStepOneField = <
    K extends keyof Pick<
      FormDataType,
      "aud_name" | "aud_year" | "aud_comp_id" | "aud_begin_date" | "aud_end_date" | "attachments"
    >,
  >(
    field: K,
    value: any
  ) => {
    updateField(field, value);
  };

  const updateStepTwoField = <
    K extends keyof Pick<FormDataType, "usertype3" | "usertype4" | "usertype5" | "usertype6">,
  >(
    field: K,
    value: any
  ) => {
    updateField(field, value);
  };

  const updateStepThreeField = <K extends keyof Pick<FormDataType, "payment_method">>(
    field: K,
    value: any
  ) => {
    updateField(field, value);
  };

  const orgOptions = compID.map((item) => ({
    value: item.comp_id,
    label: item.comp_legal_name,
    regNo: item.comp_reg_no,
  }));

  const userOptions = userID.map((item) => ({
    value: item.user_id,
    label: `${item.user_firstname} (${item.user_phone})`,
    regNo: item.user_email,
  }));

  const steps = [
    { id: 1, label: "Аудитын мэдээлэл" },
    { id: 2, label: "Багийн мэдээлэл" },
    { id: 3, label: "Төлбөр" },
  ];

  const nextStep = () => {
    if (step === 1) {
      if (
        !formData.aud_name ||
        !formData.aud_comp_id ||
        !formData.aud_begin_date ||
        !formData.aud_end_date ||
        !formData.aud_year
      ) {
        setMessage("1-р алхмын бүх талбарыг бөглөнө үү");
        return;
      }
    }

    // if (step === 2) {
    //   if (!formData.email || !formData.address || !formData.city) {
    //     setMessage("2-р алхмын бүх талбарыг бөглөнө үү");
    //     return;
    //   }
    // }

    setMessage("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setMessage("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setAlert({ show: false, variant: "error", title: "", message: "" });
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        aud_name: formData.aud_name,
        aud_year: formData.aud_year,
        aud_comp_id: formData.aud_comp_id,
        aud_begin_date: formData.aud_begin_date,
        aud_end_date: formData.aud_end_date,
        payment_method: formData.payment_method,
        team_data: [
          formData.usertype3 ? { user_id: Number(formData.usertype3), role_id: 3 } : null,
          formData.usertype4 ? { user_id: Number(formData.usertype4), role_id: 4 } : null,
          formData.usertype5 ? { user_id: Number(formData.usertype5), role_id: 5 } : null,
          ...formData.usertype6.map((id) => ({
            user_id: Number(id),
            role_id: 6,
          })),
        ].filter(Boolean),
      };

      const res = await fetch("/api/auditadd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAlert({
          show: true,
          variant: "error",
          title: "Алдаа",
          message: data.error || "Мэдээлэл буруу байна",
        });
        setLoading(false);
        return;
      }

      const auditId = data?.audit_id;

      if (auditId && formData.attachments.length > 0) {
        const fd = new FormData();
        fd.append("audit_id", String(auditId));

        formData.attachments.forEach((item) => {
          fd.append("files", item.file);
        });

        const uploadRes = await fetch("/api/files/upload", {
          method: "POST",
          body: fd,
        });

        const uploadData = await uploadRes.json().catch(() => ({}));

        if (!uploadRes.ok) {
          throw new Error(uploadData?.error || "Файл upload хийхэд алдаа гарлаа");
        }
      }

      // Амжилттай
      setAlert({
        show: true,
        variant: "success",
        title: "Амжилттай",
        message: "Амжилттай нэвтэрлээ",
      });

      setTimeout(() => {
        router.push("/audit");
      }, 1500);
    } catch (error) {
      setAlert({
        show: true,
        variant: "error",
        title: "Серверийн алдаа",
        message: "Түр хүлээгээд дахин оролдоно уу",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setLoading(true);

        const res = await fetchWithAuth("/api/auditadd/meta", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to load metadata");
        }
        const data = await res.json();
        const compList: CompItem[] = data.company ?? [];
        const userList: UserItem[] = data.users ?? [];

        setOrgs(compList);
        setUserIDs(userList);
      } catch (error) {
        console.error("Error loading metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMeta();
  }, []);

  return (
    <div className="rounded-2xl border p-6">
      {alert.show && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}
      <div className="mb-6 mt-4">
        <div className="flex gap-2">
          {steps.map((s) => (
            <div key={s.id} className="flex-1 text-center">
              {/* LABEL */}
              <div
                className={`mb-1 text-xs ${
                  s.id <= step ? "text-brand-500 font-medium" : "text-gray-400"
                }`}
              >
                {s.label}
              </div>

              {/* BAR */}
              <div className={`h-2 rounded ${s.id <= step ? "bg-brand-500" : "bg-gray-200"}`} />
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <StepOne
          values={{
            aud_name: formData.aud_name,
            aud_year: formData.aud_year,
            aud_comp_id: formData.aud_comp_id,
            aud_begin_date: formData.aud_begin_date,
            aud_end_date: formData.aud_end_date,
            attachments: formData.attachments,
          }}
          orgOptions={orgOptions}
          onChange={updateStepOneField}
        />
      )}

      {step === 2 && (
        <StepTwo
          values={{
            usertype3: formData.usertype3,
            usertype4: formData.usertype4,
            usertype5: formData.usertype5,
            usertype6: formData.usertype6,
          }}
          userOptions={userOptions}
          onChange={updateStepTwoField}
        />
      )}

      {step === 3 && (
        <StepThree
          values={{
            payment_method: formData.payment_method,
          }}
          onChange={updateStepThreeField}
        />
      )}

      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          Өмнөх
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="rounded-lg bg-brand-500 px-4 py-2 text-white"
          >
            Дараах
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-brand-500 px-4 py-2 text-white"
          >
            Хадгалах
          </button>
        )}
      </div>
      <LoadingScreen show={loading} />
    </div>
  );
}
