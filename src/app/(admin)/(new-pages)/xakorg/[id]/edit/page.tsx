import { cookies } from "next/headers";
import XakOrgForm from "../../components/xakOrgForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditXakorgPage({ params }: Props) {
  const { id } = await params;

  const cookieStore = cookies();
  const cookieHeader = (await cookieStore)
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${process.env.APP_URL}/api/xakorg/${id}`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // 404 эсвэл permission алдаа
    throw new Error("Xakorg not found");
  }

  const data = await res.json();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Харьяа байгууллага засах</h1>

      <XakOrgForm id={id} initialData={data} />
    </div>
  );
}
