"use client";

import { useNotifications } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";

export default function NotificationList() {
  const { notifications } = useNotifications();

  if (!notifications.length) {
    return <div className="text-center text-gray-400">No notifications</div>;
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((noti) => (
        <NotificationItem key={noti.id} noti={noti} />
      ))}
    </div>
  );
}
