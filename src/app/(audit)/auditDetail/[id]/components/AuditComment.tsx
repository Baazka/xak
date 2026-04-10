"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

type Props = {
  formId: number;
};

type FormComment = {
  comment_id: number;
  comment_form_id: number;
  comment_date: string;
  comment_by: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
  comment_text: string;
};

export default function AuditComment({ formId }: Props) {
  const [formComment, setFormComment] = useState<FormComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const loadFormCommentData = async () => {
    try {
      setLoading(true);

      const resComment = await fetchWithAuth(`/api/audit/audit_forms/comments?form_id=${formId}`);
      const commentResult = await resComment.json();

      setFormComment(Array.isArray(commentResult?.formComment) ? commentResult.formComment : []);
    } catch (err) {
      console.error(err);
      setFormComment([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      loadFormCommentData();
    } else {
      setFormComment([]);
      setLoading(false);
    }
  }, [formId]);

  const handleSave = async () => {
    const text = commentText.trim();

    if (!text) {
      alert("Тайлбар оруулна уу");
      return;
    }

    try {
      setSaving(true);

      const res = await fetchWithAuth(`/api/audit/audit_forms/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          comment_text: text,
        }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      setCommentText("");
      await loadFormCommentData();
    } catch (err) {
      console.error(err);
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    const ok = window.confirm("Энэ тайлбарыг устгах уу?");
    if (!ok) return;

    try {
      setDeletingId(commentId);

      const res = await fetchWithAuth(`/api/audit/audit_forms/comments`, {
        method: "DELETE",
        body: JSON.stringify({ comment_id: commentId }),
      });

      if (!res.ok) {
        throw new Error("Устгахад алдаа гарлаа");
      }

      setFormComment((prev) => prev.filter((item) => item.comment_id !== commentId));
    } catch (err) {
      console.error(err);
      alert("Устгахад алдаа гарлаа");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="mt-6 text-sm text-gray-500">Уншиж байна...</div>;
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="shrink-0  text-gray-800">Хяналт</h3>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Тайлбар..."
          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-9 shrink-0 rounded-md bg-blue-600 px-3 text-xs text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "..." : "Хадгалах"}
        </button>
      </div>

      {formComment.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500">
          Мэдээлэл алга
        </div>
      ) : (
        <div className="space-y-1">
          {formComment.map((item) => (
            <div
              key={item.comment_id}
              className="group rounded-md border border-gray-200 bg-white px-3 py-2 transition hover:bg-gray-50"
            >
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{item.user_firstname}</span>
                  <span className="text-gray-400">{item.comment_date}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.comment_id)}
                  disabled={deletingId === item.comment_id}
                  className="opacity-0 text-red-500 transition group-hover:opacity-100 hover:text-red-600 disabled:opacity-50"
                >
                  {deletingId === item.comment_id ? "..." : "✕"}
                </button>
              </div>

              <div className="mt-1 text-sm leading-snug text-gray-700">{item.comment_text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
