"use client";

import { FileText, FolderOpen } from "lucide-react";
import type { FormItem } from "../AuditDetailClient";

type AuditSidebarProps = {
  forms: FormItem[];
  activeForm: string;
  onChange: (id: string) => void;
};

export default function AuditSidebar({ forms, activeForm, onChange }: AuditSidebarProps) {
  return (
    <div className="group">
      <div className="flex h-[74vh] w-25 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 group-hover:w-64">
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-3 py-4">
          <FolderOpen className="h-5 w-5 text-gray-600" />
          <span className="hidden text-sm font-semibold text-gray-800 group-hover:block">
            Маягтууд
          </span>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {forms.map((item) => {
            const isActive = activeForm === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                title={item.full}
                className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition ${
                  isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileText className="h-4 w-4 shrink-0 text-gray-500" />

                <span className="text-xs font-medium group-hover:hidden">{item.short}</span>

                <span className="hidden whitespace-nowrap text-sm group-hover:block">
                  {item.full}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
