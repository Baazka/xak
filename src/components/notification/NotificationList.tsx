"use client";

import React from "react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";

export default function NotificationList() {
  const { notifications } = useNotifications();

  if (!notifications?.length) {
    return <div className="text-center text-gray-400 py-10">No notifications</div>;
  }

  return (
    <ul className="flex flex-col h-auto">
      {notifications.map((noti: any) => (
        <li key={noti.id}>
          <NotificationItem noti={noti} />
        </li>
      ))}
    </ul>
  );
}
