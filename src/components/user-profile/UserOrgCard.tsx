"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "@/context/AuthContext";
import SkeletonForm from "../form/SkeletonForm";

export default function UserOrgCard() {
  const { user, loading } = useAuth();
  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm " +
    "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 " +
    "dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        {loading ? (
          <SkeletonForm />
        ) : (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Аудитын компанийн мэдээлэл
            </h4>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Компанийн нэр
                </p>
                <input
                  className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                  value={user?.org_legal_name}
                  readOnly
                />
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Байгууллагын регистрын дугаар
                </p>
                <input
                  className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                  value={user?.org_register_no}
                  readOnly
                />
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Байгууллагын утас
                </p>
                <input
                  className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                  value={user?.org_phone}
                  readOnly
                />
              </div>

              <div>
                <p className="rounded-2xl mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Байгууллагын мэйл хаяг
                </p>
                <input
                  className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                  value={user?.org_email}
                  readOnly
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-1">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Байгууллагын хаяг
                </p>
                <textarea
                  className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                  value={user?.org_address}
                  readOnly
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Удирдлагын нэр
                </p>
                <input
                  className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                  value={user?.org_head_name}
                  readOnly
                />
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Удирдлагын утас
                </p>
                <input
                  className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                  value={user?.org_head_phone}
                  readOnly
                />
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Удирдлагын мэйл хаяг
                </p>
                <input
                  className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                  value={user?.org_head_email}
                  readOnly
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
