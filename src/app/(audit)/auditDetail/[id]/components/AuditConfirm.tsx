"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

type Props = {
  formId: number;
};

type FormConfirm = {
  action_id: number;
  action_form_id: number;
  action_status_id: number;
  action_status_name: string;
  action_date: string;
  action_by: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
};

export default function AuditConfirm({ formId }: Props) {
  const [formConfirm, setFormConfirm] = useState<FormConfirm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFormConfirmData() {
      try {
        setLoading(true);

        const resConfirm = await fetchWithAuth(
          `/api/audit/audit_forms/confirmation?form_id=${formId}`
        );
        const confirmResult = await resConfirm.json();

        setFormConfirm(Array.isArray(confirmResult?.confirm) ? confirmResult.confirm : []);
      } catch (err) {
        console.error(err);
        setFormConfirm([]);
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      loadFormConfirmData();
    } else {
      setFormConfirm([]);
      setLoading(false);
    }
  }, [formId]);

  if (loading) {
    return <div>Уншиж байна...</div>;
  }

  if (formConfirm.length === 0) {
    return <div>Баталгаажуулалтын мэдээлэл алга</div>;
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-gray-800">Баталгаажуулалт</h3>
        <div className="h-px flex-1 bg-gray-200 ml-3" />
      </div>
      {formConfirm.map((item) => (
        <div key={item.action_id} className="flex items-center gap-6 text-sm">
          <div className="w-24 text-gray-800">{item.action_status_name}:</div>

          <div className="min-w-[220px] border-b border-gray-300 pb-1 text-gray-900">
            {item.user_firstname || ""}
          </div>

          <div className="text-gray-800">Огноо:</div>
          <div className="min-w-[170px] border-b border-gray-300 pb-1 text-gray-900">
            {item.action_date || ""}
          </div>

          <div className="text-gray-800">Утас:</div>
          <div className="min-w-[140px] border-b border-gray-300 pb-1 text-gray-900">
            {item.user_phone || ""}
          </div>

          <div className="text-gray-800">Имэйл:</div>
          <div className="min-w-[150px] border-b border-gray-300 pb-1 text-gray-900">
            {item.user_email || ""}
          </div>
        </div>
      ))}
    </div>
  );
}
