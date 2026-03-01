"use client";

import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationItem({ noti }: any) {
  const { markAsRead } = useNotifications();

  return (
    <div
      onClick={() => markAsRead(noti.id)}
      className={`p-3 rounded-lg mb-2 cursor-pointer ${
        noti.is_read ? "bg-gray-100" : "bg-blue-50"
      }`}
    >
      <div className="font-semibold">{noti.title}</div>
      <div className="text-sm text-gray-600">{noti.content}</div>
      <div className="text-xs text-gray-400 mt-1">
        {formatDistanceToNow(new Date(noti.date))} ago
      </div>
    </div>
  );
}
