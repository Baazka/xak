"use client";

import { formatDistanceToNow } from "date-fns";
import { mn } from "date-fns/locale";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { cn } from "@/lib/cn";

type Props = {
  noti: {
    id: number;
    title?: string;
    content?: string;
    date?: string;
    is_read?: number | boolean;
  };
  onClick?: () => void;
};

export default function NotificationItem({ noti, onClick }: Props) {
  const timeAgo = noti?.date
    ? formatDistanceToNow(new Date(noti.date), {
        addSuffix: true,
        locale: mn,
      })
    : "";

  const unread = noti?.is_read === 0 || noti?.is_read === false;

  return (
    <DropdownItem onItemClick={onClick} className="p-0">
      <div
        className={cn(
          "group relative rounded-xl border p-4 transition",
          unread
            ? "border-brand-200 bg-brand-50/60 hover:bg-brand-50 dark:border-brand-800 dark:bg-brand-900/10 dark:hover:bg-brand-900/20"
            : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/60"
        )}
      >
        {unread && <span className="absolute left-3 top-5 h-2.5 w-2.5 rounded-full bg-brand-500" />}

        <div className="pl-5">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "text-sm text-gray-900 dark:text-gray-100",
                unread ? "font-semibold" : "font-medium"
              )}
            >
              {noti.title}
            </h3>

            <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
          </div>

          <div
            className="prose prose-sm mt-2 max-w-none text-gray-600 dark:prose-invert dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: noti.content ?? "" }}
          />
        </div>
      </div>
    </DropdownItem>
  );
}
