"use client";

import { useNotifications } from "../../context/NotificationContext";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const { unreadCount, toggleOpen } = useNotifications();

  return (
    <div className="relative cursor-pointer" onClick={toggleOpen}>
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
