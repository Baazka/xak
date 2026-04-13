"use client";

import { useEffect, useState, useTransition } from "react";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import LoadingScreen from "../ui/LoadingScreen";
import Alert from "../ui/alert/Alert";
import AuditCompany from "./forms/AuditCompany";
import AuditCompanyOwner from "./forms/AuditCompanyOwner";
const currentYear = new Date().getFullYear();

type OperationRow = {
  op_id: number;
  op_aud_id: number;
  op_code: string;
  op_name: string;
  op_date: string;
};

type DetailRow = {
  det_id: number;
  det_aud_id: number;
  det_type_id: number;
  det_category: string;
  det_country: string;
  det_lastname: string;
  det_firstname: string;
  det_date: string;
};

type OperationData = {
  op_code: string;
  op_name: string;
  op_date: Date;
};

type DetailData = {
  det_type_id: number;
  det_category: string;
  det_country: string;
  det_lastname: string;
  det_firstname: string;
  det_date: Date;
};

type FormDataType = {
  aud_name: string;
  aud_year: string;
  aud_begin_date: Date;
  aud_end_date: Date;
  usertype3: number;
  usertype4: number;
  usertype5: number;
  usertype6: number[];
  payment_method: string;
  aud_file_id: number | null;

  org_regno: string;
  org_legal_name: string;
  org_founded_date: Date;
  org_certno: string;
  org_type: string;
  org_main_operation: string;
  org_is_special: boolean;
  org_shareholder: number;
  org_founder: number;
  org_asset: number;

  org_address: string;
  org_phone: string;
  org_email: string;

  org_head_name: string;
  org_head_phone: string;
  org_head_email: string;

  org_acc_name: string;
  org_acc_phone: string;
  org_acc_email: string;

  org_operation_data?: [];
  org_detail_data?: [];
};

const initialData: FormDataType = {
  aud_name: "",
  aud_year: String(currentYear),
  aud_begin_date: new Date(),
  aud_end_date: new Date(),
  usertype3: 0,
  usertype4: 0,
  usertype5: 0,
  usertype6: [],
  payment_method: "",
  aud_file_id: null,

  org_regno: "",
  org_legal_name: "",
  org_founded_date: new Date(),
  org_certno: "",
  org_type: "",
  org_main_operation: "",
  org_is_special: false,
  org_shareholder: 0,
  org_founder: 0,
  org_asset: 0,
  org_address: "",
  org_phone: "",
  org_email: "",
  org_head_name: "",
  org_head_phone: "",
  org_head_email: "",
  org_acc_name: "",
  org_acc_phone: "",
  org_acc_email: "",
  org_operation_data: [],
  org_detail_data: [],
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

  const [detailRows, setDetailRows] = useState<Record<number, DetailRow[]>>({
    1: [
      {
        det_id: 0,
        det_aud_id: 0,
        det_type_id: 1,
        det_category: "",
        det_country: "",
        det_lastname: "",
        det_firstname: "",
        det_date: "",
      },
    ],
    2: [
      {
        det_id: 0,
        det_aud_id: 0,
        det_type_id: 2,
        det_category: "",
        det_country: "",
        det_lastname: "",
        det_firstname: "",
        det_date: "",
      },
    ],
    3: [
      {
        det_id: 0,
        det_aud_id: 0,
        det_type_id: 3,
        det_category: "",
        det_country: "",
        det_lastname: "",
        det_firstname: "",
        det_date: "",
      },
    ],
  });

  const [opRows, setOpRows] = useState<OperationRow[]>([
    {
      op_id: 0,
      op_aud_id: 0,
      op_code: "",
      op_name: "",
      op_date: "",
    },
  ]);

  const updateField = <K extends keyof FormDataType>(field: K, value: FormDataType[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateStepOneField = <
    K extends keyof Pick<FormDataType, "aud_name" | "aud_year" | "aud_begin_date" | "aud_end_date">,
  >(
    field: K,
    value: any
  ) => {
    updateField(field, value);
  };

  const updateAuditCompanyField = <
    K extends keyof Pick<
      FormDataType,
      | "org_regno"
      | "org_legal_name"
      | "org_founded_date"
      | "org_certno"
      | "org_type"
      | "org_main_operation"
      | "org_is_special"
      | "org_shareholder"
      | "org_founder"
      | "org_asset"
      | "org_address"
      | "org_phone"
      | "org_email"
      | "org_head_name"
      | "org_head_phone"
      | "org_head_email"
      | "org_acc_name"
      | "org_acc_phone"
      | "org_acc_email"
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

  const updateStepThreeField = <
    K extends keyof Pick<FormDataType, "payment_method" | "aud_file_id">,
  >(
    field: K,
    value: any
  ) => {
    updateField(field, value);
  };

  const userOptions = userID.map((item) => ({
    value: item.user_id,
    label: `${item.user_firstname} (${item.user_phone})`,
    regNo: item.user_email,
  }));

  const steps = [
    { id: 1, label: "Аудитын мэдээлэл" },
    { id: 2, label: "Байгууллагын мэдээлэл" },
    { id: 3, label: "Өмчлөгчийн мэдээлэл" },
    { id: 4, label: "Багийн мэдээлэл" },
    { id: 5, label: "Төлбөр" },
  ];

  const nextStep = () => {
    if (step === 1) {
      if (
        !formData.aud_name ||
        !formData.aud_begin_date ||
        !formData.aud_end_date ||
        !formData.aud_year
      ) {
        setMessage("Бүх талбарыг бөглөнө үү");
        return;
      }
    }

    if (step === 2) {
      if (
        !formData.org_regno ||
        !formData.org_legal_name ||
        !formData.org_founded_date
        // ||
        // !formData.org_certno ||
        // !formData.org_type ||
        // !formData.org_main_operation ||
        // !formData.org_is_special ||
        // !formData.org_shareholder ||
        // !formData.org_founder ||
        // !formData.org_asset ||
        // !formData.org_address ||
        // !formData.org_phone ||
        // !formData.org_email ||
        // !formData.org_head_name ||
        // !formData.org_head_phone ||
        // !formData.org_head_email ||
        // !formData.org_acc_name ||
        // !formData.org_acc_phone ||
        // !formData.org_acc_email
      ) {
        setMessage("Бүх талбарыг бөглөнө үү");
        return;
      }
    }
    if (step === 4) {
      if (
        !formData.usertype3 ||
        !formData.usertype4 ||
        !formData.usertype5 ||
        !formData.usertype6
      ) {
        setMessage("Бүх талбарыг бөглөнө үү");
        return;
      }
    }
    if (step === 5) {
      if (!formData.payment_method) {
        setMessage("Бүх талбарыг бөглөнө үү");
        return;
      }
    }

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
      const operationData: OperationData[] = opRows.map((row) => ({
        op_code: row.op_code,
        op_name: row.op_name,
        op_date: row.op_date ? new Date(row.op_date) : new Date(),
      }));

      const detailData: DetailData[] = Object.values(detailRows)
        .flat()
        .map((row) => ({
          det_type_id: row.det_type_id,
          det_category: row.det_category,
          det_country: row.det_country,
          det_lastname: row.det_lastname,
          det_firstname: row.det_firstname,
          det_date: row.det_date ? new Date(row.det_date) : new Date(),
        }));

      const payload = {
        aud_name: formData.aud_name,
        aud_year: formData.aud_year,
        aud_begin_date: formData.aud_begin_date,
        aud_end_date: formData.aud_end_date,
        audCompId: 1,
        comp_data: {
          org_regno: formData.org_regno,
          org_legal_name: formData.org_legal_name,
          org_founded_date: formData.org_founded_date,
          org_certno: formData.org_certno,
          org_main_operation: formData.org_main_operation,
          org_type: formData.org_type,
          org_is_special: formData.org_is_special,
          org_shareholder: formData.org_shareholder,
          org_founder: formData.org_founder,
          org_asset: formData.org_asset,

          org_address: formData.org_address,
          org_phone: formData.org_phone,
          org_email: formData.org_email,
          org_head_name: formData.org_head_name,
          org_head_phone: formData.org_head_phone,
          org_head_email: formData.org_head_email,
          org_acc_name: formData.org_acc_name,
          org_acc_phone: formData.org_acc_phone,
          org_acc_email: formData.org_acc_email,
        },
        org_operation_data: operationData,
        org_detail_data: detailData,
        payment_method: formData.payment_method,
        aud_file_id: formData.aud_file_id,
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

      // Амжилттай
      setAlert({
        show: true,
        variant: "success",
        title: "Амжилттай",
        message: "Аудит амжилттай хадгалагдлаа",
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
        const userList: UserItem[] = data.users ?? [];

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
    <div className="rounded-2xl border p-6 overflow-hidden">
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
              <div
                className={`mb-1 ${s.id <= step ? "text-brand-500 font-medium" : "text-gray-400"}`}
              >
                {s.label}
              </div>
              <div className={`h-2 rounded ${s.id <= step ? "bg-brand-500" : "bg-gray-200"}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-y-auto max-h-[60vh] pr-2">
        {step === 1 && (
          <StepOne
            values={{
              aud_name: formData.aud_name,
              aud_year: formData.aud_year,
              aud_begin_date: formData.aud_begin_date,
              aud_end_date: formData.aud_end_date,
            }}
            onChange={updateStepOneField}
          />
        )}

        {step === 2 && (
          <AuditCompany
            values={{
              org_regno: formData.org_regno,
              org_legal_name: formData.org_legal_name,
              org_founded_date: formData.org_founded_date,
              org_certno: formData.org_certno,
              org_type: formData.org_type,
              org_main_operation: formData.org_main_operation,
              org_is_special: formData.org_is_special,
              org_shareholder: formData.org_shareholder,
              org_founder: formData.org_founder,
              org_asset: formData.org_asset,
              org_address: formData.org_address,
              org_phone: formData.org_phone,
              org_email: formData.org_email,
              org_head_name: formData.org_head_name,
              org_head_phone: formData.org_head_phone,
              org_head_email: formData.org_head_email,
              org_acc_name: formData.org_acc_name,
              org_acc_phone: formData.org_acc_phone,
              org_acc_email: formData.org_acc_email,
            }}
            onChange={updateAuditCompanyField}
          />
        )}
        {step === 3 && (
          <AuditCompanyOwner
            values={{
              org_regno: formData.org_regno,
              org_legal_name: formData.org_legal_name,
              org_founded_date: formData.org_founded_date,
              org_certno: formData.org_certno,
              org_type: formData.org_type,
              org_main_operation: formData.org_main_operation,
              org_address: formData.org_address,
              org_head_name: formData.org_head_name,
            }}
            rows={detailRows}
            setRows={setDetailRows}
            opRows={opRows}
            setOpRows={setOpRows}
          />
        )}
        {step === 4 && (
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
        {step === 5 && (
          <StepThree
            values={{
              payment_method: formData.payment_method,
              aud_file_id: formData.aud_file_id,
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

          {step < 5 ? (
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
      </div>
      <LoadingScreen show={loading} />
    </div>
  );
}
