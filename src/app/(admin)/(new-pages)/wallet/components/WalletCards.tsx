import React from "react";
import { BoxIcon, DollarLineIcon, GroupIcon, PlusIcon, ShootingStarIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";

type Props = {
  balance: number;
  handledepo?: () => void;
};

export default function QWalletCards({ balance, handledepo }: Props) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1">
      <div className="flex justify-between items-center rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div>
          <div className="flex gap-6">
            <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/[0.90]">
              <DollarLineIcon />
            </div>
            <div>
              <p className="text-gray-500 text-theme-sm dark:text-gray-400">Дансны үлдэгдэл</p>

              <div className="flex items-end justify-between mt-3">
                <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {balance} ₮
                </h4>
              </div>
            </div>
          </div>
          {/* <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
              +20%
            </span>

            <span className="text-gray-500 text-theme-xs dark:text-gray-400">Vs last month</span>
          </div> */}
        </div>

        <div>
          <Button size="sm" variant="primary" startIcon={<PlusIcon />} onClick={handledepo}>
            Данс цэнэглэх
          </Button>
        </div>
      </div>
    </div>
  );
}
