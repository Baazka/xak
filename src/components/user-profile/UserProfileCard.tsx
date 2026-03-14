"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

type User = {
  user_id: number;
  user_firstname: string;
  user_email: string;
  user_phone: string;
  user_register_no: string;
  user_password: string;
};

type ProfileForm = {
  username: string;
  reg_no: string;
  email: string;
  phone: string;
};

export default function UserProfileCard() {
  const edit = useModal();
  const pwd = useModal();

  const { user, loading, refreshUser } = useAuth() as any;
  const { toast } = useToast();
  const [data, setData] = useState<User[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [username, setUsername] = useState("");
  const [reg_no, setReg_no] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      try {
        const res = await fetchWithAuth(`/api/profile`, { signal: controller.signal });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `API error: ${res.status}`);
        }

        const json = await res.json();
        setData(json.data[0]);
        setUsername(json.data[0].user_firstname);
        setReg_no(json.data[0].user_register_no);
        setPhone(json.data[0].user_phone);
        setEmail(json.data[0].user_email);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        toast("error", err?.message || "Мэдээлэл ачааллах үед алдаа гарлаа");
      } finally {
      }
    };

    run();
    return () => controller.abort();
  }, [reloadKey]);

  // setUsername(data.user_firstname);
  // setReg_no(data.user_register_no);
  // setPhone(data.user_phone);
  // setEmail(data.user_email);

  // -------- Edit profile state
  const [form, setForm] = useState<ProfileForm>({
    username: "",
    reg_no: "",
    email: "",
    phone: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!edit.isOpen || !user) return;
    setForm({
      username,
      reg_no,
      email,
      phone,
    });
    setSaveError(null);
    setSaveLoading(false);
  }, [edit.isOpen, user]); // eslint-disable-line

  useEffect(() => {
    useAuth;
  }, [form]);

  const handleSaveProfile = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (saveLoading) return;

    setSaveError(null);

    // basic validation
    if (!form.email?.trim()) {
      setSaveError("Имэйлээ бөглөнө үү.");
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetchWithAuth("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          reg_no: form.reg_no,
          email: form.email,
          phone: form.phone,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || "Хадгалахад алдаа гарлаа");

      // refresh auth user (UI sync)
      await refreshUser?.();
      setReloadKey(reloadKey + 1);

      toast("success", "Хэрэглэгчийн мэдээлэл шинэчлэгдлээ");
      edit.closeModal();
    } catch (err: any) {
      const msg = err?.message || "Профайл хадгалахад алдаа гарлаа";
      setSaveError(msg);
      toast("error", msg);
    } finally {
      setSaveLoading(false);
    }
  };

  // -------- Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm " +
    "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 " +
    "dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  useEffect(() => {
    if (!pwd.isOpen) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setPwdError(null);
    setPwdLoading(false);
  }, [pwd.isOpen]);

  const handleChangePassword = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (pwdLoading) return;

    setPwdError(null);

    if (!currentPassword || !newPassword || !confirm) {
      setPwdError("Бүх талбарыг бөглөнө үү.");
      return;
    }
    // if (newPassword.length < 8) {
    //   setPwdError("Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байна.");
    //   return;
    // }
    if (newPassword !== confirm) {
      setPwdError("Шинэ нууц үг давхцахгүй байна.");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetchWithAuth("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error || data?.message || "Нууц үг солих үед алдаа гарлаа");

      toast("success", "Нууц үг амжилттай солигдлоо");
      pwd.closeModal();
    } catch (err: any) {
      const msg = err?.message || "Сүлжээний алдаа";
      setPwdError(msg);
      toast("error", msg);
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div>
        <div className="flex w-full flex-col gap-5 lg:w-auto lg:flex-row justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Хэрэглэгчийн мэдээлэл
            </h4>
          </div>
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={pwd.openModal}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 lg:inline-flex lg:w-auto"
            >
              Нууц үг солих
            </button>
            <button
              onClick={edit.openModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              Засах
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Овог нэр</p>
            <input
              className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
              value={username}
              readOnly
            />
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Регистрын дугаар
            </p>
            <input
              className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
              value={reg_no}
              readOnly
            />
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Утас</p>
            <input
              className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
              value={phone}
              readOnly
            />
          </div>

          <div>
            <p className="rounded-2xl mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Мэйл хаяг
            </p>
            <input
              className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
              value={email}
              readOnly
            />
          </div>
        </div>

        {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              First Name
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {firstname || "-"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Last Name
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {lastname || "-"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Email address
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{email || "-"}</p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Phone</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{phone || "-"}</p>
          </div>
        </div> */}
      </div>

      {/* Edit profile modal */}
      <Modal isOpen={edit.isOpen} onClose={edit.closeModal} className="max-w-[800px] m-1">
        <div className="no-scrollbar relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Хэрэглэгчийн мэдээлэл засах
            </h4>
            {/* <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p> */}
          </div>

          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Овог нэр</Label>
                  <Input
                    type="text"
                    defaultValue={form.username}
                    onChange={(e: any) => setForm((p) => ({ ...p, username: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Регистрын дугаар</Label>
                  <Input
                    type="text"
                    defaultValue={form.reg_no}
                    onChange={(e: any) => setForm((p) => ({ ...p, reg_no: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Утас</Label>
                  <Input
                    type="text"
                    defaultValue={form.phone}
                    onChange={(e: any) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Мэйл хаяг</Label>
                  <Input
                    type="text"
                    defaultValue={form.email}
                    onChange={(e: any) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                {saveError ? (
                  <div className="col-span-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
                    {saveError}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={edit.closeModal}>
                Хаах
              </Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={saveLoading}>
                {saveLoading ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Change password modal */}
      <Modal isOpen={pwd.isOpen} onClose={pwd.closeModal} className="max-w-[520px] m-4">
        <div className="relative w-full max-w-[520px] rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Нууц үг солих
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Одоогийн нууц үгээ баталгаажуулаад шинэ нууц үгээ оруулна уу.
          </p>

          <div className="space-y-4">
            <div>
              <Label>Одоогийн нууц үг</Label>
              <Input
                type="password"
                defaultValue={currentPassword}
                onChange={(e: any) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>Шинэ нууц үг</Label>
              <Input
                type="password"
                defaultValue={newPassword}
                onChange={(e: any) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>Шинэ нууц үг давтах</Label>
              <Input
                type="password"
                defaultValue={confirm}
                onChange={(e: any) => setConfirm(e.target.value)}
              />
            </div>

            {pwdError ? (
              <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{pwdError}</div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center gap-3 lg:justify-end">
            <Button size="sm" variant="outline" onClick={pwd.closeModal} disabled={pwdLoading}>
              Болих
            </Button>
            <Button size="sm" onClick={handleChangePassword} disabled={pwdLoading}>
              {pwdLoading ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
