import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-xl font-bold">System</div>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-gray-600 hover:text-black">
            Features
          </a>
          <a href="#finance" className="text-sm text-gray-600 hover:text-black">
            Finance
          </a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-black">
            Pricing
          </a>
          <a href="#testimonials" className="text-sm text-gray-600 hover:text-black">
            Reviews
          </a>
          <a href="#contact" className="text-sm text-gray-600 hover:text-black">
            Contact
          </a>
        </nav>

        <Link
          href="/signin"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Нэвтрэх
        </Link>
      </div>
    </header>
  );
}
