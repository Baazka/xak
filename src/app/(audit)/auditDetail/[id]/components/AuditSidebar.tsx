"use client";

import {
  CheckCircle,
  ChevronsDown,
  ChevronsUp,
  FileChartPie,
  FileText,
  FolderOpen,
  ListTodo,
  MessageCircle,
  NotebookPen,
  FileCheck,
  SendIcon,
  EyeIcon,
  ZapIcon,
  FileArchiveIcon,
  OctagonAlertIcon,
} from "lucide-react";
import type { FormItem, GroupedForms } from "../AuditClient";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type AuditSidebarProps = {
  groupedForms: GroupedForms[];
  activeForm: FormItem | null;
  onChange: (form: FormItem) => void;
};
export default function AuditSidebar({ groupedForms, activeForm, onChange }: AuditSidebarProps) {
  const itemRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const allOpen = groupedForms.every((g) => openGroups[g.stage]);

  const getStageIcon = (stage: string) => {
    const key = stage.trim();

    const icons: Record<string, React.ReactNode> = {
      "Төлөвлөхийн өмнөх үе шат": <FileText className="h-4 w-4" />,
      "Төлөвлөх үе шат": <NotebookPen className="h-4 w-4" />,
      "Гүйцэтгэх үе шат": <ListTodo className="h-4 w-4" />,
      "Тайлагнах үе шат": <FileChartPie className="h-4 w-4" />,
    };

    return icons[key] ?? <FolderOpen className="h-4 w-4" />;
  };

  const scrollToItem = (formId: number, smooth = true) => {
    const el = itemRefs.current[formId];
    if (!el) return;

    el.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "center",
    });
  };

  const toggleGroup = (stage: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const toggleAllGroups = () => {
    const updated: Record<string, boolean> = {};

    groupedForms.forEach((g) => {
      updated[g.stage] = !allOpen;
    });

    setOpenGroups(updated);
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

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    groupedForms.forEach((g) => {
      initial[g.stage] = true;
    });
    setOpenGroups(initial);
  }, [groupedForms]);

  return (
    <div className="relative h-full w-24 shrink-0">
      <div className="group/sidebar h-full">
        <div className="absolute left-0 top-0 flex h-full min-h-0 w-24 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 group-hover/sidebar:w-84 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-3 py-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 shrink-0 text-gray-600 dark:text-gray-300" />

              <span className="hidden text-sm font-semibold text-gray-800 group-hover/sidebar:block dark:text-gray-100">
                Маягтууд
              </span>
            </div>

            <button
              type="button"
              onClick={toggleAllGroups}
              className="hidden rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 group-hover/sidebar:block dark:hover:bg-gray-800 dark:hover:text-white"
              title={allOpen ? "Бүгд хаах" : "Бүгд нээх"}
            >
              {allOpen ? <ChevronsUp className="h-4 w-4" /> : <ChevronsDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
            {groupedForms.map((group) => {
              const isOpen = openGroups[group.stage];

              return (
                <div key={group.stage} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.stage)}
                    className="group/header flex w-full items-center justify-between px-2 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center group-hover/sidebar:hidden">
                        {getStageIcon(group.stage)}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 hidden group-hover/sidebar:block transition ${
                          isOpen ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                      <span className="hidden group-hover/sidebar:block">{group.stage}</span>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="space-y-1">
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
                            className={`group/item flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition ${
                              isActive
                                ? "bg-green-500/10 text-green-700 ring-1 ring-green-500/30 dark:bg-green-400/10 dark:text-green-300"
                                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                          >
                            <span className="shrink-0 text-xs font-medium group-hover/sidebar:hidden flex items-center gap-1">
                              <FileText
                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                  isActive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              />
                              {item.form_code}
                            </span>

                            <div className="hidden w-full items-start justify-between gap-2 group-hover/sidebar:flex">
                              <span
                                className={`mr-1 text-xs  font-semibold ${
                                  isActive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {item.form_code}
                              </span>
                              <div className="flex-1 text-sm leading-tight">
                                <span className="break-words">{item.form_name}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="group/icon relative flex items-center text-blue-600">
                                  <MessageCircle className="h-5 w-5" />

                                  {item.cmt_count > 0 && (
                                    <span className="absolute -top-1 -right-1 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                                      {item.cmt_count > 9 ? "9+" : (item.cmt_count ?? 0)}
                                    </span>
                                  )}

                                  <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/icon:block">
                                    Сэтгэгдэл
                                  </div>
                                </div>

                                <div className="group/icon relative">
                                  {item.form_status_id === 1 && (
                                    <>
                                      <FileCheck className="h-5 w-5 text-blue-600" />
                                      <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/icon:block">
                                        Хадгалсан
                                      </div>
                                    </>
                                  )}
                                  {item.form_status_id === 2 && (
                                    <>
                                      <SendIcon className="h-5 w-5 text-amber-600" />
                                      <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/icon:block">
                                        Илгээсэн
                                      </div>
                                    </>
                                  )}
                                  {item.form_status_id === 3 && (
                                    <>
                                      <EyeIcon className="h-5 w-5 text-cyan-600" />
                                      <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/icon:block">
                                        Хянасан
                                      </div>
                                    </>
                                  )}
                                  {item.form_status_id === 4 && (
                                    <>
                                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                                      <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/icon:block">
                                        Баталгаажсан
                                      </div>
                                    </>
                                  )}
                                  {item.form_status_id === 5 && (
                                    <>
                                      <OctagonAlertIcon className="h-5 w-5 text-error-600" />
                                      <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/icon:block">
                                        Буцаасан
                                      </div>
                                    </>
                                  )}
                                  {item.form_status_id === 6 && (
                                    <>
                                      <ZapIcon className="h-5 w-5 text-mist-600" />
                                      <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/icon:block">
                                        Чанарын хяналт
                                      </div>
                                    </>
                                  )}
                                  {item.form_status_id === 7 && (
                                    <>
                                      <FileArchiveIcon className="h-5 w-5 text-yellow-600" />
                                      <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover/icon:block">
                                        Архивласан
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
