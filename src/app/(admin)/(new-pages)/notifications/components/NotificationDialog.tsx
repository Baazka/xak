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
import Button from "@/components/ui/button/Button";
import QuillEditor from "@/components/editor/QuillEditor";

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

type OrgItem = {
  org_id: number;
  org_legal_name: string;
  org_register_no?: string;
};

type RoleItem = {
  role_id: number;
  role_label: string;
  role_code: string;
  role_text: string;
};

export default function NotificationDialog() {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [targetTypes, setTargetTypes] = useState<TargetTypeItem[]>([]);

  const [notificationTypeId, setNotificationTypeId] = useState<number | "">("");
  const [targetTypeCode, setTargetTypeCode] = useState("");

  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const [targetIds, setTargetIds] = useState("");
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
        const orgList: OrgItem[] = data.orgs ?? [];
        const roleList: RoleItem[] = data.roles ?? [];

        setNotificationTypes(notiTypes);
        setTargetTypes(trgTypes);
        setOrgs(orgList);
        setRoles(roleList);

        setNotificationTypeId(notiTypes[0]?.type_id ?? "");
        setTargetTypeCode(trgTypes[0]?.type_code ?? "");
        setSelectedOrgId(orgList[0]?.org_id?.toString() ?? "");
        setSelectedRoleId(roleList[0]?.role_id?.toString() ?? "");
      } catch (error) {
        console.error(error);
        alert("Dropdown data ачааллахад алдаа гарлаа");
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
      setTargetIds("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !notificationTypeId || !targetTypeCode) {
      alert("Шаардлагатай талбаруудыг бөглөнө үү");
      return;
    }

    if (targetTypeCode === "XAK" && !selectedOrgId) {
      alert("Байгууллага сонгоно уу");
      return;
    }

    if (targetTypeCode === "ROLE" && !selectedRoleId) {
      alert("Эрх сонгоно уу");
      return;
    }

    if (targetTypeCode === "USER" && !targetIds.trim()) {
      alert("Хэрэглэгчийн ID оруулна уу");
      return;
    }

    setLoading(true);

    try {
      const parsedUserIds = targetIds
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((x) => !Number.isNaN(x) && x > 0);

      const body: any = {
        noti_type_id: notificationTypeId,
        title: title.trim(),
        content,
        target_type_code: targetTypeCode,
      };

      if (targetTypeCode === "XAK") {
        body.orgIds = [Number(selectedOrgId)];
      }

      if (targetTypeCode === "ROLE") {
        body.roleIds = [Number(selectedRoleId)];
      }

      if (targetTypeCode === "USER") {
        body.userIds = parsedUserIds;
      }

      const res = await fetchWithAuth("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpen(false);
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
        <Button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600">
          Шинэ мэдэгдэл
        </Button>
      </DialogTrigger>

      <DialogContent className="z-[1000] max-w-lg">
        <DialogHeader>
          <DialogTitle>Мэдэгдэл үүсгэх</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Гарчиг</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Агуулга</label>
            <QuillEditor value={content} onChange={setContent} />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Мэдэгдлийн төрөл</label>
            <select
              value={notificationTypeId}
              onChange={(e) => setNotificationTypeId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-lg border px-3 py-2"
              disabled={metaLoading}
            >
              <option value="">Сонгох</option>
              {notificationTypes.map((item) => (
                <option key={item.type_id} value={item.type_id}>
                  {item.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Хэрэглэгчийн төрөл</label>
            <select
              value={targetTypeCode}
              onChange={(e) => setTargetTypeCode(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              disabled={metaLoading}
            >
              <option value="">Сонгох</option>
              {targetTypes.map((item) => (
                <option key={item.type_id} value={item.type_code}>
                  {item.type_name}
                </option>
              ))}
            </select>
          </div>

          {targetTypeCode === "XAK" && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Байгууллага</label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Сонгох</option>
                {orgs.map((org) => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.org_legal_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetTypeCode === "ROLE" && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Эрх</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Сонгох</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_text || role.role_label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetTypeCode === "USER" && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Хэрэглэгчийн ID</label>
              <input
                value={targetIds}
                onChange={(e) => setTargetIds(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
              <p className="text-xs text-gray-500">Жишээ: 1,2,3</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || metaLoading}
            className="w-full rounded-lg bg-black py-2 text-white disabled:opacity-60"
          >
            {loading ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
