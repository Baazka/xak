"use client";

import React from "react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";
import { useRouter } from "next/navigation";

export default function NotificationList() {
  const router = useRouter();
  const { notifications, markAsRead, close } = useNotifications();

  const handleOpenDetail = async (noti: any) => {
    if (Number(noti.is_read) === 0) {
      await markAsRead(noti.id);
    }

    close();
    router.push(`/notifications/${noti.id}`);
  };

  if (!notifications?.length) {
    return <div className="py-10 text-center text-gray-400">Мэдэгдэл ирээгүй байна.</div>;
  }

  return (
    <ul className="flex flex-col">
      {notifications.map((n) => (
        <NotificationItem key={n.id} noti={n} onClick={() => handleOpenDetail(n)} />
      ))}
    </ul>
  );
}
