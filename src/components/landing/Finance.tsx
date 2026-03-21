export default function Finance() {
  return (
    <section id="finance" className="py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">Finance overview</h2>
          <p className="mt-4 text-gray-600">
            Санхүүгийн өгөгдөл, төсөв, урсгал зардал, тайлангуудыг нэг дороос хянах боломж.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold">Төсөв ба гүйцэтгэл</h3>
              <p className="mt-2 text-sm text-gray-600">
                Төсөвлөсөн ба гүйцэтгэлийн зөрүүг бодит цагт хянана.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold">Автомат тайлагнал</h3>
              <p className="mt-2 text-sm text-gray-600">
                Давтагддаг санхүүгийн тайланг автомат бэлтгэнэ.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold">Нэгтгэсэн дата</h3>
              <p className="mt-2 text-sm text-gray-600">
                Олон эх сурвалжаас дата нэгтгэж шийдвэр гаргалтыг хурдасгана.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-black p-8 text-white shadow-sm">
          <p className="text-sm text-white/70">Monthly performance</p>
          <h3 className="mt-2 text-3xl font-bold">+24.8%</h3>
          <div className="mt-8 space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Revenue</span>
                <span>82%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div className="h-3 w-[82%] rounded-full bg-white" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Cost efficiency</span>
                <span>68%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div className="h-3 w-[68%] rounded-full bg-white" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Automation</span>
                <span>74%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div className="h-3 w-[74%] rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
