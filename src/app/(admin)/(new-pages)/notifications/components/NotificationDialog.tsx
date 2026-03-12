"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type NotificationType = {
  type_id: number;
  type_name: string;
  type_description: string | null;
};

type TargetTypeItem = {
  type_id: number;
  type_name: string;
  type_code: string;
};

export default function NotificationDialog() {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [targetTypes, setTargetTypes] = useState<TargetTypeItem[]>([]);

  const [notificationTypeId, setNotificationTypeId] = useState<number | "">("");
  const [targetTypeCode, setTargetTypeCode] = useState<string>("");

  const [targetIds, setTargetIds] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setMetaLoading(true);

        const res = await fetchWithAuth("/api/notifications/meta", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to load metadata");
        }

        const data = await res.json();

        const notiTypes: NotificationType[] = data.notificationTypes ?? [];
        const trgTypes: TargetTypeItem[] = data.targetTypes ?? [];

        setNotificationTypes(notiTypes);
        setTargetTypes(trgTypes);

        if (notiTypes.length > 0) {
          setNotificationTypeId(notiTypes[0].type_id);
        }

        if (trgTypes.length > 0) {
          setTargetTypeCode(trgTypes[0].type_code);
        }
      } catch (error) {
        console.error(error);
        alert("Dropdown data ачааллахад алдаа гарлаа");
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  const handleSubmit = async () => {
    if (!title || !content || !notificationTypeId || !targetTypeCode) {
      return;
    }

    const needsIds = targetTypeCode === "USER" || targetTypeCode === "ROLE";

    if (needsIds && !targetIds.trim()) {
      alert("Target IDs оруулна уу");
      return;
    }

    setLoading(true);

    try {
      const ids = targetIds
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((x) => !Number.isNaN(x) && x > 0);

      const body: any = {
        noti_type_id: notificationTypeId,
        title,
        content,
        target_type_code: targetTypeCode,
      };

      if (targetTypeCode === "USER") {
        body.userIds = ids;
      }

      if (targetTypeCode === "ROLE") {
        body.roleIds = ids;
      }

      const res = await fetchWithAuth("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpen(false);
        setTitle("");
        setContent("");
        setTargetIds("");
        alert("Notification created");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || "Error creating notification");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-black text-white rounded-lg">Шинэ мэдэгдэл</button>
      </DialogTrigger>

      <DialogContent className="max-w-lg z-[1000]">
        <DialogHeader>
          <DialogTitle>Мэдэгдэл үүсгэх</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <input
            placeholder="Гарчиг"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Агуулга"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <select
            value={notificationTypeId}
            onChange={(e) => setNotificationTypeId(Number(e.target.value))}
            className="w-full border p-2 rounded"
            disabled={metaLoading}
          >
            <option value="">Мэдэгдэлийн төрөл сонгох</option>
            {notificationTypes.map((item) => (
              <option key={item.type_id} value={item.type_id}>
                {item.type_name}
              </option>
            ))}
          </select>

          <select
            value={targetTypeCode}
            onChange={(e) => setTargetTypeCode(e.target.value)}
            className="w-full border p-2 rounded"
            disabled={metaLoading}
          >
            <option value="">Хэрэглэгчийн төрөл сонгох</option>
            {targetTypes.map((item) => (
              <option key={item.type_id} value={item.type_code}>
                {item.type_name}
              </option>
            ))}
          </select>

          {(targetTypeCode === "USER" || targetTypeCode === "ROLE") && (
            <input
              placeholder={
                targetTypeCode === "USER"
                  ? "User IDs (comma separated: 1,2,3)"
                  : "Role IDs (comma separated: 1,2,3)"
              }
              value={targetIds}
              onChange={(e) => setTargetIds(e.target.value)}
              className="w-full border p-2 rounded"
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || metaLoading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
