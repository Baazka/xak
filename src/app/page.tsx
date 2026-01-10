import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Тавтай морил </h1>
      <p className="mb-8 text-center">Манай вэбсайт руу тавтай морил!</p>
      <div className="flex gap-4">
        <a href="/signin" className="px-6 py-3 rounded bg-black text-white">
          Нэвтрэх
        </a>
      </div>
    </main>
  );
}
