import Link from "next/link";

export default function Home() {
  return (
    <div>
      Welcome
      <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
        Нэвтрэх
      </Link>
    </div>
  );
}
