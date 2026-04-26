"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import HelpdeskDialog from "@/components/global/HelpdeskDialog";

type OpenParams = {
  audId?: number | null;
  formId?: number | null;
};

type Ctx = {
  openHelp: (params?: OpenParams) => void;
  closeHelp: () => void;
};

const HelpDeskContext = createContext<Ctx | null>(null);

export const useHelpDesk = () => {
  const ctx = useContext(HelpDeskContext);
  if (!ctx) throw new Error("useHelpDesk must be used within HelpDeskProvider");
  return ctx;
};

export default function HelpDeskProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [audId, setAudId] = useState<number | null>(null);
  const [formId, setFormId] = useState<number | null>(null);

  const openHelp = useCallback((params?: OpenParams) => {
    setAudId(params?.audId ?? null);
    setFormId(params?.formId ?? null);
    setOpen(true);
  }, []);

  const closeHelp = useCallback(() => setOpen(false), []);

  return (
    <HelpDeskContext.Provider value={{ openHelp, closeHelp }}>
      {children}

      {/* <button
        type="button"
        onClick={() => openHelp()}
        className="
          fixed bottom-6 right-6 z-[999]
          rounded-full bg-blue-600 p-3 text-white shadow-lg
          transition hover:bg-blue-700 hover:scale-105
        "
        title="Тусламж"
      >
        <MessageCircle className="w-5 h-5" />
      </button> */}

      <HelpdeskDialog open={open} onOpenChange={setOpen} audId={audId} formId={formId} />
    </HelpDeskContext.Provider>
  );
}
