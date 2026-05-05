"use client";

import * as React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useParams, useRouter } from "next/navigation";
import QuillEditor from "@/components/editor/QuillEditor";
import { useToast } from "@/context/ToastContext";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

type Props = {
  taskId: number;
};

type TaskDetail = {
  task_id: number;
  task_org_id?: number;
  org_legal_name?: string;
  user_role_name?: string;
  user_firstname?: string;
  user_email?: string;
  user_phone?: string;
  task_code?: string;
  task_date?: string;
  task_status_id?: number;
  task_status_name?: string;
  task_priority_id?: number;
  task_priority_name?: string;
  task_title?: string;
  task_content?: string;
  task_audit_id?: number;
  task_form_id?: number;
  task_created_by?: number;
};

type TaskComment = {
  comment_id: number;
  comment_task_id: number;
  comment_date: string;
  created_by: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
  comment_text: string;
};

export default function TaskDetailPage() {
  const [data, setData] = React.useState<TaskDetail | null>(null);
  const [taskComment, setTaskComment] = React.useState<TaskComment[]>([]);
  const [metaLoading, setMetaLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { id } = useParams();
  const [loader, setLoader] = React.useState(0);

  const [commentText, setCommentText] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const { toast } = useToast();
  const [canceling, setCanceling] = React.useState(false);
  const router = useRouter();

  const task_id = id;

  const statusColor =
    data?.task_status_id === 1
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
      : data?.task_status_id === 2
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
        : data?.task_status_id === 3
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";

  const loadData = async () => {
    try {
      setMetaLoading(true);

      const res = await fetchWithAuth(`/api/helpdesk/${task_id}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to load data");
      }

      const datares = await res.json();

      setData(datares.data);
    } catch (error) {
      console.error(error);
    } finally {
      setMetaLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
    loadTaskCommentData();
  }, [id, loader]);

  const loadTaskCommentData = async () => {
    try {
      setLoading(true);

      const resComment = await fetchWithAuth(`/api/helpdesk/comments?task_id=${task_id}`);
      const commentResult = await resComment.json();

      setTaskComment(Array.isArray(commentResult?.taskComment) ? commentResult.taskComment : []);
    } catch (err) {
      console.error(err);
      setTaskComment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    const ok = window.confirm("Энэ тайлбарыг устгах уу?");
    if (!ok) return;

    try {
      setDeletingId(commentId);

      const res = await fetchWithAuth(`/api/helpdesk/comments`, {
        method: "DELETE",
        body: JSON.stringify({ comment_id: commentId }),
      });

      if (!res.ok) {
        throw new Error("Устгахад алдаа гарлаа");
      }

      setTaskComment((prev) => prev.filter((item) => item.comment_id !== commentId));
    } catch (err) {
      console.error(err);
      alert("Устгахад алдаа гарлаа");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    const text = commentText.trim();

    if (!text) {
      toast("error", "Тайлбар оруулна уу");
      return;
    }

    try {
      setSaving(true);

      const res = await fetchWithAuth(`/api/helpdesk/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_task_id: task_id,
          comment_id: null,
          comment_text: commentText,
          comment_created_by: data?.task_created_by,
        }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      toast("success", "Тайлбар нэмэгдлээ");

      setCommentText("");
      await loadTaskCommentData();
    } catch (err) {
      console.error(err);
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (statusId: number) => {
    switch (statusId) {
      case 1:
        return "Илгээсэн";
      case 2:
        return "Шийдвэрлэж буй";
      case 3:
        return "Хүсэлтийг шийдвэрлэсэн";
      case 4:
        return "Хүсэлтийг цуцалсан";
    }
  };

  const handleProcess = async (statusId: number) => {
    try {
      setLoading(true);

      const res = await fetchWithAuth(`/api/helpdesk/${task_id}`, {
        method: "POST",
        body: JSON.stringify({ task_id: task_id, task_status_id: statusId }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      const statusLabel = getStatusLabel(statusId);

      // CREATE NOTIFICATION
      const notiRes = await fetchWithAuth("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noti_type_id: 3,
          title: "Тусламж " + data?.task_code + " " + statusLabel,
          content:
            "Таны " +
            data?.task_code +
            " дугаартай хүсэлт " +
            statusLabel +
            " төлөвт шилжсэн байна.",
          target_type_code: "USER",
          userIds: [data?.task_created_by],
        }),
      });

      setLoader(loader + 1);
      switch (statusId) {
        case 2:
          toast("info", "Шийдвэрлэлт эхлүүллээ");
          break;
        case 3:
          toast("success", "Хүсэлтийг шийдвэрлэлээ");
          break;
        case 4:
          toast("error", "Хүсэлтийг цуцаллаа");
          break;
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-2">
        <PageBreadcrumb pageTitle="Тусламжийн дэлгэрэнгүй" />

        <div className="mt-4 mb-4">
          <Link href="/helpdesk">
            <Button variant="outline">Буцах</Button>
          </Link>
        </div>

        {!data ? (
          <div className="rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <div className="text-sm text-red-500">Мэдээлэл олдсонгүй.</div>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 p-4 mb-4">
              <div className="mb-4 flex flex-col gap-3 border-b border-gray-200 pb-3 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Код:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {data.task_code}
                  </span>

                  <span className="text-gray-400">|</span>

                  <span className="text-gray-500 dark:text-gray-400">Огноо:</span>
                  <span className="text-gray-900 dark:text-gray-100">{data.task_date}</span>

                  <span className="text-gray-400">|</span>

                  <span className="text-gray-500 dark:text-gray-400">Төлөв:</span>

                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                    {data.task_status_name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      router.push(`/auditDetail/${data.task_audit_id}?formId=${data.task_form_id}`)
                    }
                  >
                    Маягт
                  </Button>
                  {data.task_status_id === 1 && (
                    <Button
                      onClick={() => handleProcess(2)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500"
                    >
                      Шийдвэрлэлт эхлүүлэх
                    </Button>
                  )}

                  {data.task_status_id === 2 && (
                    <>
                      <Button
                        onClick={() => handleProcess(3)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      >
                        Шийдвэрлэсэн
                      </Button>

                      <Button
                        onClick={() => handleProcess(4)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-error-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-error-600 dark:bg-error-600 dark:hover:bg-error-500"
                      >
                        Цуцлах
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-b border-gray-200 pb-4 dark:border-gray-800">
                <div>
                  <label className="mb-1 block text-sm">Аудитын байгууллага:</label>
                  <input
                    className="w-full rounded border px-3 py-2 bg-gray-700/10"
                    value={data.org_legal_name}
                    disabled
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Эрхийн түвшин:</label>
                  <input
                    className="w-full rounded border px-3 py-2 bg-gray-700/10"
                    value={data.user_role_name}
                    disabled
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Хэрэглэгчийн нэр:</label>
                  <input
                    className="w-full rounded border px-3 py-2 bg-gray-700/10"
                    value={data.user_firstname}
                    disabled
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Хэрэглэгчийн утас, мэйл хаяг:</label>
                  <input
                    className="w-full rounded border px-3 py-2 bg-gray-700/10"
                    value={data.user_phone + " | " + data.user_email}
                    disabled
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm">Агуулга:</label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      value={data.task_title}
                      disabled
                    />
                  </div>
                  <div className="">
                    <div>
                      <label className="mb-1 block text-sm">Асуудлын түвшин:</label>
                      <input
                        className="w-full rounded border px-3 py-2"
                        value={data.task_priority_name}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Тайлбар:</label>

                  <QuillEditor value={data.task_content ?? ""} readonly={true} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 p-4">
              <div className="mb-4 flex items-center gap-3">
                <h3 className="shrink-0 text-gray-800 dark:text-gray-100 text-sm font-semibold">
                  Тайлбар
                </h3>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>
              {taskComment.length === 0 ? (
                <div className="rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                  Мэдээлэл алга
                </div>
              ) : (
                <div className="space-y-1">
                  {taskComment.map((item) => (
                    <div
                      key={item.comment_id}
                      className="group rounded border border-gray-200 bg-white px-3 py-2 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            {item.user_firstname}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">
                            {item.comment_date}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.comment_id)}
                          disabled={deletingId === item.comment_id}
                          className="opacity-0 text-red-500 transition group-hover:opacity-100 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {deletingId === item.comment_id ? "..." : "✕"}
                        </button>
                      </div>

                      <div className="mt-1 text-sm leading-snug text-gray-700 dark:text-gray-300">
                        {item.comment_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-3 mt-3 flex items-center gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Тайлбар..."
                  className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400"
                />

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-9 shrink-0 rounded bg-blue-600 px-3 text-xs text-white hover:bg-blue-700 disabled:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                >
                  {saving ? "..." : "Тайлбар нэмэх"}
                </button>
              </div>
            </div>
            {/* <DeleteConfirmDialog
              loading={canceling}
              showText={true}
              onConfirm={() => handleProcess(4)}
            /> */}
          </>
        )}
      </div>
    </>
  );
}
