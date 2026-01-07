import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Our Platform</h1>
      <p>Best solution for your business</p>
      <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
        Нэвтрэх
      </Link>
    </main>
  );
}
