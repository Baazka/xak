"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function UserMetaCard() {
  const { user, loading } = useAuth() as any;

  const displayName = useMemo(() => {
    if (!user) return "";

    const fn = user.first_name ?? user.firstName ?? "";
    const ln = user.last_name ?? user.lastName ?? "";
    const full = `${fn} ${ln}`.trim();
    return full || user.username || user.email || "User";
  }, [user]);

  const role = user?.activeRole ?? user?.role ?? "";
  const avatar = user?.avatar || "/images/user/owner.jpg";

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <Image width={80} height={80} src={avatar} alt="user" />
          </div>

          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {displayName}
            </h4>

            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              {role ? <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
