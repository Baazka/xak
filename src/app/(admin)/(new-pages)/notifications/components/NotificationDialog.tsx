"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TargetType = "USER" | "ORG" | "ROLE";

export default function NotificationDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("USER");
  const [targetIds, setTargetIds] = useState<string>(""); // comma separated
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content || !targetIds) return;

    setLoading(true);

    const ids = targetIds
      .split(",")
      .map((x) => Number(x.trim()))
      .filter(Boolean);

    const body: any = {
      title,
      content,
    };

    if (targetType === "USER") body.userIds = ids;
    if (targetType === "ORG") body.orgIds = ids;
    if (targetType === "ROLE") body.roleIds = ids;

    const res = await fetchWithAuth("/api/notifications/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      setOpen(false);
      setTitle("");
      setContent("");
      setTargetIds("");
      alert("Notification created");
    } else {
      alert("Error creating notification");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-black text-white rounded-lg">+ New Notification</button>
      </DialogTrigger>

      <DialogContent className="max-w-lg z-1000">
        <DialogHeader>
          <DialogTitle>Create Notification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as TargetType)}
            className="w-full border p-2 rounded"
          >
            <option value="USER">User</option>
            <option value="ORG">Organization</option>
            <option value="ROLE">Role</option>
          </select>

          <input
            placeholder="Target IDs (comma separated: 1,2,3)"
            value={targetIds}
            onChange={(e) => setTargetIds(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
