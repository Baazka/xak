"use client";

import { FileText, FolderOpen } from "lucide-react";
import type { FormItem, GroupedForms } from "../AuditClient";

type AuditSidebarProps = {
  pinnedForms: FormItem[];
  groupedForms: GroupedForms[];
  activeForm: FormItem | null;
  onChange: (form: FormItem) => void;
};

export default function AuditSidebar({
  pinnedForms,
  groupedForms,
  activeForm,
  onChange,
}: AuditSidebarProps) {
  return (
    <div className="relative h-full w-24 shrink-0 z-20">
      <div className="group sticky top-0 h-full">
        <div className="absolute left-0 top-0 z-10 flex h-full min-h-0 w-24 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 group-hover:w-64">
          <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-3 py-4">
            <FolderOpen className="h-5 w-5 shrink-0 text-gray-600" />
            <span className="hidden text-sm font-semibold text-gray-800 group-hover:block">
              Маягтууд
            </span>
          </div>

          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto p-2">
            {pinnedForms.length > 0 && (
              <div className="mb-2 space-y-1 border-b pb-2">
                {pinnedForms.map((item) => {
                  const isActive = activeForm?.form_id === item.form_id;
                  return (
                    <button
                      key={item.form_id}
                      type="button"
                      onClick={() => onChange(item)}
                      title={item.form_name}
                      className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition ${
                        isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-gray-500" />

                      <span className="text-xs font-medium group-hover:hidden">
                        {item.form_code}
                      </span>

                      <span className="hidden whitespace-nowrap text-sm group-hover:block">
                        {item.form_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {groupedForms.map((group) => (
              <div key={group.stage} className="space-y-1">
                <div className="px-2 pt-1">
                  <span className="hidden text-xs font-semibold tracking-wide text-gray-500 group-hover:block">
                    {group.stage}
                  </span>
                </div>

                {group.items.map((item) => {
                  const isActive = activeForm?.form_id === item.form_id;

                  return (
                    <button
                      key={item.form_id}
                      type="button"
                      onClick={() => onChange(item)}
                      title={item.form_name}
                      className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition ${
                        isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-gray-500" />

                      <span className="text-xs font-medium group-hover:hidden">
                        {item.form_code}
                      </span>

                      <span className="hidden whitespace-nowrap text-sm group-hover:block">
                        {item.form_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
