"use client";

import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext<any>(null);

export function NotificationProvider({ children }: any) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then(setNotifications);
  }, []);

  const markAsRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev: any) =>
      prev.map((n: any) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        open,
        toggleOpen: () => setOpen((p) => !p),
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);