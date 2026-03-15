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

type userRoleType = {
  role_id: number;
  role_label: string;
  role_code: string;
  role_text: string;
};

export default function UserDialogNew() {
  const [open, setOpen] = useState(false);

  const [user_regno, setUser_regno] = useState("");
  const [user_firstname, setUserFirstname] = useState("");
  const [user_phone, setUser_phone] = useState("");
  const [user_email, setUser_email] = useState("");

  const [userRoles, setUserRoles] = useState<userRoleType[]>([]);

  const [userRoleId, setUserRoleId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);

  useEffect(() => {
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
        setUserRoles(roles);

        if (userRoles.length > 0) {
          setUserRoleId(userRoles[0].role_id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  const handleSubmit = async () => {
    if (!user_firstname || !user_phone || !user_email || !userRoleId) {
      return;
    }

    setLoading(true);

    try {
      const body: any = {
        user_role_id: userRoleId,
        user_regno,
        user_firstname,
        user_phone,
        user_email,
      };

      const res = await fetchWithAuth("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpen(false);
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || "Error creating notification");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600">
          Шинэ хэрэглэгч
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg z-[1000]">
        <DialogHeader>
          <DialogTitle>Хэрэглэгч</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <input
            placeholder="Регистрын дугаар"
            value={user_regno}
            onChange={(e) => setUser_regno(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            placeholder="Овог нэр"
            value={user_firstname}
            onChange={(e) => setUserFirstname(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            placeholder="Утас"
            value={user_phone}
            onChange={(e) => setUser_phone(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            placeholder="Мэйл хаяг"
            value={user_email}
            onChange={(e) => setUser_email(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <select
            value={userRoleId}
            onChange={(e) => setUserRoleId(Number(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">Эрхийн түвшин сонгох</option>
            {userRoles.map((rl) => (
              <option key={rl.role_code} value={rl.role_id}>
                {rl.role_text}
              </option>
            ))}
          </select>

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
