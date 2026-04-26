"use client";

import { CheckCircle, FileText, FolderOpen } from "lucide-react";
import type { FormItem, GroupedForms } from "../AuditClient";
import { useEffect, useRef } from "react";

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
  const itemRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToItem = (formId: number, smooth = true) => {
    const el = itemRefs.current[formId];
    if (!el) return;

    el.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "center",
    });
  };

  useEffect(() => {
    if (!activeForm?.form_id) return;

    const t = setTimeout(() => {
      scrollToItem(activeForm.form_id, true);
    }, 50);

    return () => clearTimeout(t);
  }, [activeForm?.form_id]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div className="z-20 h-full w-24 shrink-0">
      <div className="group sticky top-0 h-full">
        <div
          className="absolute left-0 top-0 z-10 flex h-full min-h-0 w-24 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 group-hover:w-84 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-3 py-4 dark:border-gray-800">
            <FolderOpen className="h-5 w-5 shrink-0 text-gray-600 dark:text-gray-300" />
            <span className="hidden text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:block">
              Маягтууд
            </span>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
            {pinnedForms.length > 0 && (
              <div className="mb-2 space-y-1 border-b border-gray-200 pb-2 dark:border-gray-800">
                {pinnedForms.map((item) => {
                  const isActive = activeForm?.form_id === item.form_id;
                  return (
                    <button
                      key={item.form_id}
                      ref={(el) => {
                        itemRefs.current[item.form_id] = el;
                      }}
                      type="button"
                      onClick={() => onChange(item)}
                      title={item.form_name}
                      className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition ${
                        isActive
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />

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
                  <span className="hidden border-l-2 border-blue-500 pl-2 font-semibold text-sm uppercase text-gray-600 dark:text-gray-300 group-hover:block">
                    {group.stage}
                  </span>
                </div>
                {group.items.map((item) => {
                  const isActive = activeForm?.form_id === item.form_id;

                  return (
                    <button
                      key={item.form_id}
                      ref={(el) => {
                        itemRefs.current[item.form_id] = el;
                      }}
                      type="button"
                      onClick={() => onChange(item)}
                      title={item.form_name}
                      className={`group flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition ${
                        isActive
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />

                      <span className="shrink-0 text-xs font-medium group-hover:hidden">
                        {item.form_code}
                      </span>

                      <div className="hidden w-full items-start justify-between gap-2 group-hover:flex">
                        <div className="flex-1 text-sm leading-tight">
                          <span className="break-words">{item.form_name}</span>
                        </div>

                        <div className="group/status relative shrink-0">
                          <CheckCircle className="h-4 w-4 text-green-600" />

                          <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/status:block">
                            Баталгаажсан
                          </div>
                        </div>
                      </div>
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
