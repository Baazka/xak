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

type ProfileForm = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
};

export default function UserInfoCard() {
  const edit = useModal();
  const pwd = useModal();

  const { user, loading, refreshUser } = useAuth() as any;
  const { toast } = useToast();


  const firstname = user?.firstname ?? "";
  const lastname = user?.lastname ?? "";
  const email = user?.email ?? "";
  const phone = user?.phone ?? "";

  // -------- Edit profile state
  const [form, setForm] = useState<ProfileForm>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!edit.isOpen || !user) return;
    setForm({
      firstname,
      lastname,
      email,
      phone,
    });
    setSaveError(null);
    setSaveLoading(false);
  }, [edit.isOpen, user]); // eslint-disable-line

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
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          phone: form.phone,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || "Хадгалахад алдаа гарлаа");

      // refresh auth user (UI sync)
      await refreshUser?.();

      toast("success", "Профайл шинэчлэгдлээ");
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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
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
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
          <button
            onClick={edit.openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            Edit
          </button>

          <button
            onClick={pwd.openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 lg:inline-flex lg:w-auto"
          >
            Нууц үг солих
          </button>
        </div>
      </div>

      {/* Edit profile modal */}
      <Modal isOpen={edit.isOpen} onClose={edit.closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    defaultValue={form.firstname}
                    onChange={(e: any) => setForm((p) => ({ ...p, firstname: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    defaultValue={form.lastname}
                    onChange={(e: any) => setForm((p) => ({ ...p, lastname: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input
                    type="text"
                    defaultValue={form.email}
                    onChange={(e: any) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    defaultValue={form.phone}
                    onChange={(e: any) => setForm((p) => ({ ...p, phone: e.target.value }))}
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
                Close
              </Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={saveLoading}>
                {saveLoading ? "Saving..." : "Save Changes"}
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
