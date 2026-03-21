import Link from "next/link";

export default function Header() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
      <div>
        <p className="mb-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
          Smart platform for modern teams
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
          Санхүү, тайлан, хяналтаа
          <span className="block">нэг дороос удирд</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg text-gray-600">
          Байгууллагын дотоод үйл ажиллагаа, санхүүгийн урсгал, хэрэглэгчийн удирдлага, тайлагнал
          зэргийг нэг цэгээс хялбар удирдах нэгдсэн систем.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/signin"
            className="rounded-lg bg-black px-6 py-3 text-white hover:opacity-90"
          >
            Эхлэх
          </Link>
          <a
            href="#pricing"
            className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
          >
            Үнийн санал
          </a>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-50 to-slate-100 p-8 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Нийт орлого</p>
            <h3 className="mt-2 text-2xl font-bold">₮128.4M</h3>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Идэвхтэй хэрэглэгч</p>
            <h3 className="mt-2 text-2xl font-bold">2,480</h3>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Тайлан</p>
            <h3 className="mt-2 text-2xl font-bold">98%</h3>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Автомат процесс</p>
            <h3 className="mt-2 text-2xl font-bold">34</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
