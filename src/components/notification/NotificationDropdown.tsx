"use client";

import { useNotifications } from "../../context/NotificationContext";
import NotificationList from "./NotificationList";

export default function NotificationDropdown() {
  const { open } = useNotifications();

  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl p-4 z-50">
      <NotificationList />
    </div>
  );
}
