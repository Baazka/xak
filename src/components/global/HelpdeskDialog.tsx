"use client";

import * as React from "react";
import { X } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import QuillEditor from "@/components/editor/QuillEditor";
import { useToast } from "@/context/ToastContext";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  audId?: number | null;
  formId?: number | null;
  onSaved?: () => void;
};

type TaskPriorityType = {
  priority_id: number;
  priority_name: string;
};

export default function HelpdeskDialog({
  open,
  onOpenChange,
  audId = null,
  formId = null,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskContent, setTaskContent] = React.useState("");
  const [taskPriorityId, setTaskPriorityId] = React.useState<number | "">("");
  const [priorityList, setPriorityList] = React.useState<TaskPriorityType[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(false);

  const displayName = user?.username || user?.email?.split("@")[0] || "";
  const displayOrgName = user?.org_legal_name || "";
  const displayUserRole = user?.role_text || "";
  const displayUserEmail = user?.email || "";

  React.useEffect(() => {
    const loadMeta = async () => {
      try {
        setMetaLoading(true);

        const res = await fetchWithAuth("/api/refs/task-priority", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to load metadata");
        }

        const data = await res.json();
        const priority: TaskPriorityType[] = data?.taskPriority ?? [];

        setPriorityList(priority);
        setTaskPriorityId(priority[0]?.priority_id ?? "");
      } catch (err) {
        console.error(err);
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  React.useEffect(() => {
    if (!open) return;

    setTaskTitle("");
    setTaskContent("");
    setTaskPriorityId(priorityList[0]?.priority_id ?? "");
    setError(null);
    setLoading(false);
  }, [open, priorityList]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !user) return;

    setError(null);

    const trimmedTitle = taskTitle.trim();
    const trimmedContent = taskContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError("Агуулга болон тайлбар хэсгийг бүрэн оруулна уу");
      return;
    }

    setLoading(true);

    try {
      const res = await fetchWithAuth("/api/helpdesk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_title: trimmedTitle,
          task_content: trimmedContent,
          task_priority_id: taskPriorityId || null,
          aud_id: audId,
          form_id: formId,
          createdBy: user.id,
          user_org_id: user.org_id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || data?.message || "Хадгалахад алдаа гарлаа");
        return;
      }

      // CREATE NOTIFICATION
      const notiRes = await fetchWithAuth("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noti_type_id: 3,
          title: data?.task_code + " дугаартай тусламжийн хүсэлт үүслээ",
          content:
            user.org_legal_name +
            " Байгууллагаас " +
            data?.task_code +
            " дугаартай хүсэлт үүсгэсэн байна.",
          target_type_code: "ROLE",
          roleId: 2,
        }),
      });

      onOpenChange(false);
      onSaved?.();
      toast("success", "Тусламж амжилттай илгээгдлээ");
    } catch (err: any) {
      setError(err?.message || "Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }

  if (!open || !user) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Шинэ хүсэлт үүсгэх
          </h2>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Хаах"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Аудитын байгууллага
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                value={displayOrgName}
                disabled
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Эрхийн түвшин
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                value={displayUserRole}
                disabled
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Хэрэглэгчийн нэр
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                value={displayName}
                disabled
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Хэрэглэгчийн мэйл хаяг
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                value={displayUserEmail}
                disabled
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Агуулга
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Ерөнхий агуулга"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Асуудлын түвшин
            </label>
            <select
              value={taskPriorityId}
              onChange={(e) => setTaskPriorityId(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              disabled={metaLoading || loading}
            >
              {priorityList.length === 0 ? (
                <option value="">Сонголт байхгүй</option>
              ) : (
                priorityList.map((item) => (
                  <option key={item.priority_id} value={item.priority_id}>
                    {item.priority_name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Тайлбар
            </label>
            <QuillEditor value={taskContent} onChange={setTaskContent} />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Болих
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              disabled={loading || metaLoading}
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
