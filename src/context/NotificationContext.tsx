"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Notification = {
  id: number;
  title?: string;
  content?: string;
  date?: string;
  is_read: number; // 0 | 1
};

type NotificationCtx = {
  notifications: Notification[];
  unreadCount: number;
  open: boolean;
  toggleOpen: () => void;
  close: () => void;        
  markAsRead: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationContext = createContext<NotificationCtx | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.is_read === 0 ? 1 : 0), 0),
    [notifications]
  );

  const refresh = async () => {
    const res = await fetchWithAuth("/api/notifications", { method: "GET" });

    if (!res.ok) return;

    const json = await res.json();
    setNotifications(Array.isArray(json?.data) ? json.data : []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const markAsRead = async (id: number) => {
    const res = await fetchWithAuth(`/api/notifications/${id}/read`, {
      method: "POST",
    });

    if (!res.ok) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
  };

  const toggleOpen = () => setOpen((p) => !p);

  const close = () => setOpen(false); 

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        open,
        toggleOpen,
        close,        
        markAsRead,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};