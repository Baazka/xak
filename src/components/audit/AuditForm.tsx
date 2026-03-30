"use client";

import { useEffect, useState, useTransition } from "react";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
const currentYear = new Date().getFullYear();

type FormDataType = {
  aud_name: string;
  aud_year: string;
  aud_comp_id: number;
  aud_begin_date: Date;
  aud_end_date: Date;
  usertype3: number;
  usertype4: number;
  usertype5: number;
  usertype6: number;
  username: string;
  password: string;
  confirmPassword: string;
  payment_method: number;
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
  usertype6: 0,
  payment_method: 0,
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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>(initialData);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [compID, setOrgs] = useState<CompItem[]>([]);
  const [userID, setUserIDs] = useState<UserItem[]>([]);

  const updateField = (field: keyof FormDataType, value: string | number | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const orgOptions = compID.map((item) => ({
    value: item.comp_id,
    label: item.comp_legal_name,
    regNo: item.comp_reg_no,
  }));

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

  const handleSubmit = async () => {
    // if (!formData.username || !formData.password || !formData.confirmPassword) {
    //   setMessage("3-р алхмын бүх талбарыг бөглөнө үү");
    //   return;
    // }
    console.log(formData, "formData");
    try {
      const res = await fetch("/api/auditadd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Хадгалах үед алдаа гарлаа");
      }

      console.log("success:", data);
      alert("Амжилттай хадгаллаа");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Алдаа гарлаа");
    }
  };
  const steps = [
    { id: 1, label: "Аудитын мэдээлэл" },
    { id: 2, label: "Багийн мэдээлэл" },
    { id: 3, label: "Төлбөр" },
  ];

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
      <div className="mb-6">
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
          }}
          orgOptions={orgOptions}
          onChange={updateField}
        />
      )}

      {step === 2 && (
        <StepTwo
          values={{
            email: formData.email,
            address: formData.address,
            city: formData.city,
          }}
          onChange={updateField}
        />
      )}

      {step === 3 && (
        <StepThree
          values={{
            username: formData.username,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }}
          onChange={updateField}
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
    </div>
  );
}
