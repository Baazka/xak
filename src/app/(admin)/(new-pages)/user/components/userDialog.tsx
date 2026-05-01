"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { User } from "../types";
import { FormErrors, ValidationSchema, validateForm } from "@/utils/validation";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: "create" | "edit";
  initialUser?: Pick<
    User,
    | "user_id"
    | "user_firstname"
    | "user_email"
    | "user_register_no"
    | "user_phone"
    | "role_id"
    | "role_text"
  > | null;

  onSaved?: () => void;
};

type userRoleType = {
  role_id: number;
  role_label: string;
  role_code: string;
  role_text: string;
};

type UserFormData = {
  user_firstname: string;
  regno: string;
  user_phone: string;
  user_email: string;
  userRoleId: number | "";
};

const userSchema: ValidationSchema<UserFormData> = {
  user_firstname: { required: true, label: "Овог нэр" },
  //regno: { required: true, label: "Регистрийн дугаар" },
  user_phone: {
    required: true,
    label: "Утас",
    pattern: /^[0-9]{8}$/,
    message: "Утасны дугаар 8 оронтой байх ёстой",
  },
  user_email: {
    required: true,
    label: "Мэйл хаяг",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Мэйл хаяг буруу байна",
  },
  userRoleId: { required: true, label: "Хэрэглэгчийн эрхийн түвшин" },
};

export default function UserDialog({ open, onOpenChange, mode, initialUser, onSaved }: Props) {
  const isEdit = mode === "edit";

  // const [username, setUsername] = React.useState("");
  // const [email, setEmail] = React.useState("");
  // const [password, setPassword] = React.useState("");
  const [regno, setRegno] = React.useState("");
  const [user_firstname, setUser_firstname] = React.useState("");
  const [user_email, setUser_email] = React.useState("");
  const [user_phone, setUser_phone] = React.useState("");
  const [user_id, setUserId] = React.useState(0);
  const [roleId, setRoleId] = React.useState("");

  const [RoleList, setRoleList] = React.useState<userRoleType[]>([]);
  const [userRoleId, setUserRoleId] = React.useState<number | "">("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors<UserFormData>>({});

  const inputClass = "w-full rounded border px-3 py-2";
  const normalClass = "border-gray-300";
  const errorClass = "border-red-500";

  const getInputClass = (field: keyof UserFormData) =>
    `${inputClass} ${errors[field] ? errorClass : normalClass}`;

  const clearError = (field: keyof UserFormData) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const renderError = (field: keyof UserFormData) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  React.useEffect(() => {
    const loadMeta = async () => {
      try {
        setMetaLoading(true);

        const res = await fetchWithAuth("/api/users/meta", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to load metadata");
        }

        const data = await res.json();

        const roles: userRoleType[] = data.userRole ?? [];
        setRoleList(roles);
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
    setErrors({});

    if (isEdit && initialUser) {
      setRegno(initialUser.user_register_no ?? "");
      setUser_firstname(initialUser.user_firstname ?? "");
      setUser_email(initialUser.user_email ?? "");
      setUser_phone(initialUser.user_phone ?? "");
      setUserRoleId(initialUser.role_id ?? "");
      setUserId(initialUser.user_id ?? "");
    } else {
      setRegno("");
      setUser_firstname("");
      setUser_email("");
      setUser_phone("");
    }
    setError(null);
    setLoading(false);
  }, [open, isEdit, initialUser]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    const formData: UserFormData = {
      user_firstname,
      regno,
      user_phone,
      user_email,
      userRoleId,
    };

    const validationErrors = validateForm(formData, userSchema);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      let res: Response;

      if (isEdit) {
        const id = initialUser?.user_id;
        const isRoleChange = userRoleId === initialUser?.role_id ? 0 : 1;
        const isMailChange = user_email === initialUser?.user_email ? 0 : 1;
        if (!id) {
          setError("Засах хэрэглэгч сонгогдоогүй байна.");
          return;
        }

        // ✅ EDIT → PUT /api/users/:id
        res = await fetchWithAuth(`/api/users/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_register_no: regno,
            user_firstname: user_firstname,
            user_phone: user_phone,
            user_email: user_email,
            role_id: userRoleId,
            is_role_change: isRoleChange,
            is_mail_change: isMailChange,
          }),
        });
      } else {
        // ✅ CREATE → POST /api/users
        res = await fetchWithAuth("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_register_no: regno,
            user_firstname: user_firstname,
            user_phone: user_phone,
            user_email: user_email,
            role_id: userRoleId,
          }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Хадгалахад алдаа гарлаа");
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
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isEdit ? "Мэдээлэл засах" : "Шинэ хэрэглэгч"}</h2>

          <button
            className="rounded px-2 py-1 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Овог нэр:</label>
            <input
              className={getInputClass("user_firstname")}
              value={user_firstname}
              onChange={(e) => {
                setUser_firstname(e.target.value);
                clearError("user_firstname");
              }}
              placeholder="хэрэглэгчийн нэр"
              autoFocus
            />
            {renderError("user_firstname")}
          </div>

          <div>
            <label className="mb-1 block text-sm">Регистрийн дугаар:</label>
            <input
              className={getInputClass("regno")}
              value={regno}
              onChange={(e) => {
                setRegno(e.target.value);
              }}
              placeholder="РД:"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Утас:</label>
            <input
              className={getInputClass("user_phone")}
              value={user_phone}
              onChange={(e) => setUser_phone(e.target.value)}
              placeholder="99998888"
            />
            {renderError("user_phone")}
          </div>

          <div>
            <label className="mb-1 block text-sm">Мэйл хаяг:</label>
            <input
              className={getInputClass("user_email")}
              value={user_email}
              onChange={(e) => setUser_email(e.target.value)}
              placeholder="email@example.com"
            />
            {renderError("user_email")}
          </div>

          <div>
            <label className="mb-1 block text-sm">Хэрэглэгчийн эрхийн түвшин:</label>
            <select
              value={userRoleId}
              onChange={(e) => {
                const value = e.target.value;
                setUserRoleId(value === "" ? "" : Number(value));
                clearError("userRoleId");
              }}
              className={getInputClass("userRoleId")}
            >
              <option value="">Сонгох</option>
              {RoleList.map((rl) => (
                <option key={rl.role_code} value={rl.role_id}>
                  {rl.role_text}
                </option>
              ))}
            </select>
            {renderError("userRoleId")}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Болих
            </button>
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
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
