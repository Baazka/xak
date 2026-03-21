import Link from "next/link";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Pricing</h2>
          <p className="mt-3 text-gray-600">Танай багийн хэрэгцээнд тохирсон багцууд</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold">Starter</h3>
            <p className="mt-2 text-sm text-gray-500">Жижиг багт</p>
            <div className="mt-6 text-4xl font-bold">
              ₮99K<span className="text-base font-normal text-gray-500">/сар</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>5 хэрэглэгч</li>
              <li>Үндсэн dashboard</li>
              <li>Стандарт тайлан</li>
            </ul>
            <Link
              href="/signin"
              className="mt-8 inline-block rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-50"
            >
              Сонгох
            </Link>
          </div>

          <div className="rounded-2xl bg-black p-8 text-white shadow-sm">
            <div className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs">
              Popular
            </div>
            <h3 className="text-xl font-semibold">Business</h3>
            <p className="mt-2 text-sm text-white/70">Өсөлттэй байгууллагад</p>
            <div className="mt-6 text-4xl font-bold">
              ₮249K<span className="text-base font-normal text-white/70">/сар</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li>25 хэрэглэгч</li>
              <li>Advanced analytics</li>
              <li>Workflow automation</li>
            </ul>
            <Link
              href="/signin"
              className="mt-8 inline-block rounded-lg bg-white px-5 py-3 text-black hover:opacity-90"
            >
              Эхлэх
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="mt-2 text-sm text-gray-500">Том байгууллагад</p>
            <div className="mt-6 text-4xl font-bold">Custom</div>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>Хязгааргүй хэрэглэгч</li>
              <li>Custom integration</li>
              <li>Dedicated support</li>
            </ul>
            <a
              href="#contact"
              className="mt-8 inline-block rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-50"
            >
              Холбогдох
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
