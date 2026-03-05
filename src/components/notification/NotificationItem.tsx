"use client";

import { formatDistanceToNow } from "date-fns";
import { mn } from "date-fns/locale";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationItem({ noti }: any) {
  const { markAsRead, close } = useNotifications();

  const timeAgo = noti?.date
    ? formatDistanceToNow(new Date(noti.date), {
        addSuffix: true,
        locale: mn,
      })
    : "";

  const unread = noti?.is_read === 0 || noti?.is_read === false;

  return (
    <DropdownItem
      onItemClick={() => {
        markAsRead(noti.id);
        close();
      }}
      className={`rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 transition 
      dark:border-gray-800 
      ${
        unread
          ? "bg-blue-50 hover:bg-blue-100 dark:bg-white/5"
          : "hover:bg-gray-100 dark:hover:bg-white/5"
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium text-gray-800 dark:text-white">{noti.title}</div>

        <div className="text-sm text-gray-600 dark:text-gray-400">{noti.content}</div>

        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
          <span>{noti.type ?? "System"}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </DropdownItem>
  );
}
