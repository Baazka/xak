"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number; // ms
};

type ToastCtx = {
  toast: (type: ToastType, message: string, opts?: { title?: string; duration?: number }) => void;
  success: (message: string, opts?: { title?: string; duration?: number }) => void;
  error: (message: string, opts?: { title?: string; duration?: number }) => void;
  info: (message: string, opts?: { title?: string; duration?: number }) => void;
  warning: (message: string, opts?: { title?: string; duration?: number }) => void;
};

const ToastContext = createContext<ToastCtx | null>(null);

function Icon({ type }: { type: ToastType }) {
  // жижиг svg, dependency хэрэггүй
  if (type === "success")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  if (type === "error")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  if (type === "warning")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 9v5m0 4h.01M10.3 4.3l-8 14A2 2 0 004 21h16a2 2 0 001.7-2.7l-8-14a2 2 0 00-3.4 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 16v-4m0-4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string, opts?: { title?: string; duration?: number }) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const t: Toast = {
        id,
        type,
        message,
        title: opts?.title,
        duration: opts?.duration ?? 3000,
      };

      setToasts((prev) => [...prev, t]);

      // auto close
      window.setTimeout(() => remove(id), t.duration);
    },
    [remove]
  );

  const api = useMemo<ToastCtx>(
    () => ({
      toast,
      success: (m, o) => toast("success", m, o),
      error: (m, o) => toast("error", m, o),
      info: (m, o) => toast("info", m, o),
      warning: (m, o) => toast("warning", m, o),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* container */}
      <div className="fixed left-1/2 top-20 -translate-x-1/2 z-[9999]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              w-[320px] rounded-xl border px-4 py-3 shadow-lg
              bg-white text-gray-900 border-gray-200
              dark:bg-[#111827] dark:text-gray-100 dark:border-gray-800
              animate-[toastIn_.12s_ease-out]
              ${t.type === "success" ? "ring-1 ring-green-500/20" : ""}
              ${t.type === "error" ? "ring-1 ring-red-500/20" : ""}
              ${t.type === "warning" ? "ring-1 ring-yellow-500/20" : ""}
              ${t.type === "info" ? "ring-1 ring-blue-500/20" : ""}
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  mt-0.5
                  ${t.type === "success" ? "text-green-600" : ""}
                  ${t.type === "error" ? "text-red-600" : ""}
                  ${t.type === "warning" ? "text-yellow-600" : ""}
                  ${t.type === "info" ? "text-blue-600" : ""}
                `}
              >
                <Icon type={t.type} />
              </div>

              <div className="flex-1">
                {t.title && <div className="text-sm font-semibold">{t.title}</div>}
                <div className="text-sm text-gray-700 dark:text-gray-300">{t.message}</div>
              </div>

              <button
                onClick={() => remove(t.id)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Close toast"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* animation keyframes */}
      <style jsx global>{`
        @keyframes toastIn {
          from {
            transform: translateY(-6px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
