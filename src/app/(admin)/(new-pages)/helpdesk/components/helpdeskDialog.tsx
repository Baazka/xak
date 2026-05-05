"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { Task } from "../types";
import { M_PLUS_1 } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import QuillEditor from "@/components/editor/QuillEditor";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  onSaved?: () => void;
};

type taskPriorityType = {
  priority_id: number;
  priority_name: string;
};

export default function HelpdeskDialog({ open, onOpenChange, onSaved }: Props) {
  const { user } = useAuth();

  if (!user) return null;
  const created_user = user.id;
  const org_id = user.org_id;
  const displayName = user.username || user.email.split("@")[0];
  const displayOrgName = user.org_legal_name;
  const displayUserRole = user.role_text;
  const displayUserEmail = user.email;

  // const [username, setUsername] = React.useState("");
  // const [email, setEmail] = React.useState("");
  // const [password, setPassword] = React.useState("");
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskContent, setTaskContent] = React.useState("");
  const [taskPriorityId, setTaskPriorityId] = React.useState<number | "">("");

  const [regno, setRegno] = React.useState("");
  const [user_firstname, setUser_firstname] = React.useState("");
  const [user_email, setUser_email] = React.useState("");
  const [user_phone, setUser_phone] = React.useState("");
  const [user_id, setUserId] = React.useState(0);
  const [roleId, setRoleId] = React.useState("");

  const [priorityList, setPriorityList] = React.useState<taskPriorityType[]>([]);
  const [userRoleId, setUserRoleId] = React.useState<number | "">("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(false);

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

        const priority: taskPriorityType[] = data.taskPriority ?? [];
        setPriorityList(priority);
        setTaskPriorityId(data.taskPriority[0].priority_id);
      } catch (error) {
        console.error(error);
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
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    const tTitle = taskTitle.trim();
    const tContent = taskContent.trim().toLowerCase();

    if (!tTitle || !tContent) {
      setError("Агуулга болон тайлбар хэсгийг бүрэн оруулна уу");
      return;
    }

    setLoading(true);
    try {
      let res: Response;

      // ✅ CREATE → POST /api/users
      res = await fetchWithAuth("/api/helpdesk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_title: taskTitle,
          task_content: taskContent,
          task_priority_id: taskPriorityId,
          createdBy: created_user,
          user_org_id: org_id,
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
          title: "Тусламж " + taskTitle,
          content: taskContent,
          target_type_code: "ROLE",
          roleId: 2,
        }),
      });
      if (!notiRes.ok) {
        setError(data?.error || data?.message || "Мэдэгдэл үүсгэхэд алдаа гарлаа");
        return;
      }

      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || "Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 dark:bg-black/70"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-lg dark:bg-gray-900 dark:text-gray-100"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Шинэ хүсэлт үүсгэх</h2>

          <button
            className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Аудитын байгууллага:</label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                value={displayName}
                disabled
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Эрхийн түвшин:</label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                value={displayUserRole}
                disabled
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Хэрэглэгчийн нэр:</label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                value={displayName}
                disabled
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Хэрэглэгчийн мэйл хаяг:</label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                value={displayUserEmail}
                disabled
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Агуулга:</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Ерөнхий агуулга"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Асуудлын түвшин:</label>
              <select
                value={taskPriorityId}
                onChange={(e) => setTaskPriorityId(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                {priorityList.map((rl) => (
                  <option key={rl.priority_id} value={rl.priority_id}>
                    {rl.priority_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm">Тайлбар:</label>

            <QuillEditor value={taskContent} onChange={setTaskContent} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Болих
            </button>
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-60 dark:bg-white dark:text-black"
              disabled={loading}
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
