"use client";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { ArrowRightIcon, UserIcon } from "lucide-react";
import { EnvelopeIcon } from "@/icons";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import { User } from "../types/userType";
import { useEffect, useState } from "react";

interface UserModalProps {
  user?: User;
  onSaved: (user: User) => void;
}

export default function UserModal({ user, onSaved }: UserModalProps) {
  const addUserModal = useModal();

  const [form, setForm] = useState<User>();

  useEffect(() => {
    if (user) setForm(user);
    else setForm({} as User);
  }, [user]);

  const handleChange = (field: keyof User, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: user ? "update" : "create", data: form }),
    });
    if (res.ok) {
      if (form) {
        onSaved(form);
      }
    }
    addUserModal.closeModal();
  };

  return (
    <>
      <Button onClick={addUserModal.openModal}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 10.0002H15.0006M10.0002 5V15.0006"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {user ? "Засах" : "Нэмэх"}
      </Button>
      <Modal
        isOpen={addUserModal.isOpen}
        onClose={addUserModal.closeModal}
        className="relative w-full max-w-[558px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
      >
        <div>
          <h4 className="text-title-xs mb-1 font-semibold text-gray-800 dark:text-white/90">
            {user ? "Хэрэглэгч засах" : "Хэрэглэгч нэмэх"}
          </h4>
          <div className="grid grid-cols-1 gap-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Хэрэглэгчийн нэр"
                className="pl-11"
                defaultValue={form?.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
                <UserIcon />
              </span>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Мэйл хаяг"
                className="pl-11"
                defaultValue={form?.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
                <EnvelopeIcon />
              </span>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row w-full items-center justify-between gap-3">
            <Button variant="outline" onClick={addUserModal.closeModal} className="w-full">
              Хаах
            </Button>
            <Button className="w-full" onClick={handleSubmit}>
              Хадгалах
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
