"use client";

import { formatDistanceToNow } from "date-fns";
import { mn } from "date-fns/locale";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationItem({ noti }: any) {
  const { markAsRead } = useNotifications();

  const timeAgo = noti?.date
    ? formatDistanceToNow(new Date(noti.date), {
        addSuffix: true,
        locale: mn,
      })
    : "";

  return (
    <div
      onClick={() => markAsRead(noti.id)}
      className={`p-3 rounded-lg mb-2 cursor-pointer transition ${
        noti.is_read === 1 ? "bg-gray-100 hover:bg-gray-200" : "bg-blue-50 hover:bg-blue-100"
      }`}
    >
      <div className="font-semibold text-sm">{noti.title}</div>
      <div className="text-sm text-gray-600">{noti.content}</div>
      <div className="text-xs text-gray-400 mt-1">{timeAgo}</div>
    </div>
  );
}
