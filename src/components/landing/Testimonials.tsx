export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Хэрэглэгчдийн сэтгэгдэл</h2>
          <p className="mt-3 text-gray-600">Систем ашиглаж буй багуудын үнэлгээ</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="text-gray-600">
              “Тайлан гаргах хугацаа мэдэгдэхүйц багассан. Dashboard нь удирдлагад маш ойлгомжтой.”
            </p>
            <div className="mt-6">
              <h4 className="font-semibold">Finance Manager</h4>
              <p className="text-sm text-gray-500">Mid-size company</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="text-gray-600">
              “Role-based access болон notification workflow нь багийн зохион байгуулалтыг
              сайжруулсан.”
            </p>
            <div className="mt-6">
              <h4 className="font-semibold">Operations Lead</h4>
              <p className="text-sm text-gray-500">Enterprise team</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="text-gray-600">
              “Нэг дороос бүх мэдээллээ хянах боломжтой болсон нь өдөр тутмын ажлыг их
              хөнгөвчилсөн.”
            </p>
            <div className="mt-6">
              <h4 className="font-semibold">Admin User</h4>
              <p className="text-sm text-gray-500">Internal platform</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
