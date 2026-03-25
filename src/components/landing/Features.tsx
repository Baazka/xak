export default function Features() {
  return (
    <section id="features" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Үндсэн боломжууд</h2>
          <p className="mt-3 text-gray-600">
            Танай багийн өдөр тутмын ажлыг илүү хялбар болгох хэрэгслүүд
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">Хэрэглэгчийн удирдлага</h3>
            <p className="text-gray-600">
              Эрх, үүрэг, role-based хандалт болон хэрэглэгчийн бүрэн хяналт.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">Тайлан ба аналитик</h3>
            <p className="text-gray-600">
              Нэгдсэн dashboard, тайлан, KPI болон гүйцэтгэлийн хяналт.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">Мэдэгдэл ба workflow</h3>
            <p className="text-gray-600">
              Дотоод урсгал, notification, approval process-уудыг автоматжуулна.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
