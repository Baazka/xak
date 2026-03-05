"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationBell() {
  const { unreadCount, toggleOpen, open } = useNotifications();

  return (
    <button
      type="button"
      aria-label="Notifications"
      aria-expanded={open}
      onClick={toggleOpen}
      className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {unreadCount > 0 && (
        <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
      )}

      <Bell className="w-5 h-5" />

      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 text-[11px] leading-[18px] text-center rounded-full bg-red-500 text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
