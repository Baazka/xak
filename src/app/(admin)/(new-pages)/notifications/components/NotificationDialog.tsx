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
import OrgMultiSelect from "./OrgMultiSelect";
import UserMultiSelect from "./UserMultiSelect";
import { FormErrors, ValidationSchema, validateForm } from "@/utils/validation";
import { useToast } from "@/context/ToastContext";


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

type UserItem = {
  user_id: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
  org_legal_name: string;
  org_register_no?: string;
};

type RoleItem = {
  role_id: number;
  role_label: string;
  role_code: string;
  role_text: string;
};

type NotificationDialogProps = {
  onCreated?: () => void;
};

type NotificationFormData = {
  title: string;
  contentText: string;
  notificationTypeId: number | "";
  targetTypeCode: string;
  selectedOrgIds: number[];
  selectedUserIds: number[];
  selectedRoleId: string;
};

const notificationSchema: ValidationSchema<NotificationFormData> = {
  title: { required: true, label: "Гарчиг" },
  contentText: { required: true, label: "Агуулга" },
  notificationTypeId: { required: true, label: "Мэдэгдлийн төрөл" },
  targetTypeCode: { required: true, label: "Хүлээн авагчийн төрөл" },
};

export default function NotificationDialog({ onCreated }: NotificationDialogProps) {
  const toast = useToast();

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [targetTypes, setTargetTypes] = useState<TargetTypeItem[]>([]);

  const [notificationTypeId, setNotificationTypeId] = useState<number | "">("");
  const [targetTypeCode, setTargetTypeCode] = useState("");

  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState<number[]>([]);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors<NotificationFormData>>({});

  const clearError = (field: keyof NotificationFormData) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const renderError = (field: keyof NotificationFormData) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  const getPlainText = (html: string) =>
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();
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
        const userList: UserItem[] = data.users ?? [];
        const roleList: RoleItem[] = data.roles ?? [];

        setNotificationTypes(notiTypes);
        setTargetTypes(trgTypes);
        setOrgs(orgList);
        setUsers(userList);
        setRoles(roleList);

        setNotificationTypeId(notiTypes[0]?.type_id ?? "");
        setTargetTypeCode(trgTypes[0]?.type_code ?? "");
        setSelectedOrgIds([]);
        setSelectedUserIds([]);
        setSelectedRoleId(roleList[0]?.role_id?.toString() ?? "");
      } catch (error) {
        console.error(error);
        toast.error("Dropdown data ачааллахад алдаа гарлаа", {
          title: "Алдаа",
        });
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, [toast]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
      setSelectedOrgIds([]);
      setSelectedUserIds([]);
      setSelectedRoleId("");
      setErrors({});
      return;
    }

    if (targetTypeCode === "ROLE" && roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(String(roles[0].role_id));
    }
  }, [open, targetTypeCode, roles, selectedRoleId]);

  useEffect(() => {
    setSelectedOrgIds([]);
    setSelectedUserIds([]);
    setSelectedRoleId("");

    if (targetTypeCode === "ROLE" && roles.length > 0) {
      setSelectedRoleId(String(roles[0].role_id));
    }
  }, [targetTypeCode, roles]);

  const handleSubmit = async () => {
    const formData: NotificationFormData = {
      title,
      contentText: getPlainText(content),
      notificationTypeId,
      targetTypeCode,
      selectedOrgIds,
      selectedUserIds,
      selectedRoleId,
    };

    const validationErrors = validateForm(formData, notificationSchema);

    if (targetTypeCode === "XAK" && selectedOrgIds.length === 0) {
      validationErrors.selectedOrgIds = "Байгууллага сонгоно уу";
    }

    if (targetTypeCode === "USER" && selectedUserIds.length === 0) {
      validationErrors.selectedUserIds = "Хэрэглэгч сонгоно уу";
    }

    if (targetTypeCode === "ROLE" && !selectedRoleId) {
      validationErrors.selectedRoleId = "Эрх сонгоно уу";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const body: any = {
        noti_type_id: notificationTypeId,
        title: title.trim(),
        content,
        target_type_code: targetTypeCode,
      };

      if (targetTypeCode === "XAK") {
        body.orgIds = selectedOrgIds;
      }

      if (targetTypeCode === "ROLE") {
        body.roleId = Number(selectedRoleId);
      }

      if (targetTypeCode === "USER") {
        body.userIds = selectedUserIds;
      }

      const res = await fetchWithAuth("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpen(false);
        toast.success("Мэдэгдэл амжилттай үүслээ", {
          title: "Амжилттай",
        });
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Мэдэгдэл үүсгэхэд алдаа гарлаа", {
          title: "Алдаа",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Мэдэгдэл үүсгэх үед серверийн алдаа гарлаа", {
        title: "Алдаа",
      });
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

      <DialogContent className="z-[1000] !w-[70vw] !max-w-[70vw]">
        <DialogHeader>
          <DialogTitle>Мэдэгдэл үүсгэх</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Гарчиг</label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError("title");
                }}
                className="w-full rounded-lg border px-3 py-2"
              />
              {renderError("title")}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Агуулга</label>
              <QuillEditor
                value={content}
                onChange={(val) => {
                  setContent(val);
                  clearError("contentText");
                }}
              />
              {renderError("contentText")}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Мэдэгдлийн төрөл</label>
              <select
                value={notificationTypeId}
                onChange={(e) => {
                  setNotificationTypeId(e.target.value ? Number(e.target.value) : "");
                  clearError("notificationTypeId");
                }}
                className={`w-full rounded-lg border px-3 py-2 ${
                  errors.notificationTypeId ? "border-red-500" : ""
                }`}
                disabled={metaLoading}
              >
                <option value="">Сонгох</option>
                {notificationTypes.map((item) => (
                  <option key={item.type_id} value={item.type_id}>
                    {item.type_name}
                  </option>
                ))}
              </select>
              {renderError("notificationTypeId")}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Хэрэглэгчийн төрөл</label>
              <select
                value={targetTypeCode}
                onChange={(e) => {
                  setTargetTypeCode(e.target.value);
                  clearError("targetTypeCode");
                }}
                className={`w-full rounded-lg border px-3 py-2 ${
                  errors.targetTypeCode ? "border-red-500" : ""
                }`}
                disabled={metaLoading}
              >
                <option value="">Сонгох</option>
                {targetTypes.map((item) => (
                  <option key={item.type_id} value={item.type_code}>
                    {item.type_name}
                  </option>
                ))}
              </select>
              {renderError("targetTypeCode")}
            </div>

            {targetTypeCode === "XAK" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Байгууллага</label>
                <OrgMultiSelect
                  orgs={orgs}
                  value={selectedOrgIds}
                  onChange={(ids) => {
                    setSelectedOrgIds(ids);
                    clearError("selectedOrgIds");
                  }}
                  disabled={metaLoading}
                />
                {renderError("selectedOrgIds")}
              </div>
            )}

            {targetTypeCode === "ROLE" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Эрх</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => {
                    setSelectedRoleId(e.target.value);
                    clearError("selectedRoleId");
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">Сонгох</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_text || role.role_label}
                    </option>
                  ))}
                </select>
                {renderError("selectedRoleId")}
              </div>
            )}

            {targetTypeCode === "USER" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Хэрэглэгч</label>
                <UserMultiSelect
                  users={users}
                  value={selectedUserIds}
                  onChange={(ids) => {
                    setSelectedUserIds(ids);
                    clearError("selectedUserIds");
                  }}
                  disabled={metaLoading}
                />
                {renderError("selectedUserIds")}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
