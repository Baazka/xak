export default function Contact() {
  return (
    <section id="contact" className="bg-black py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">Contact</h2>
          <p className="mt-4 max-w-lg text-white/70">
            Танай байгууллагад тохирсон шийдэл, demo, үнийн санал авах бол бидэнтэй холбогдоорой.
          </p>

          <div className="mt-8 space-y-3 text-white/80">
            <p>Email: info@xak.mn</p>
            <p>Phone: +976 7000 0000</p>
            <p>Address: Ulaanbaatar, Mongolia</p>
          </div>
        </div>

        <form className="space-y-4 rounded-3xl bg-white p-6 text-black">
          <div>
            <label className="mb-2 block text-sm font-medium">Нэр</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="Таны нэр"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">И-мэйл</label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Мессеж</label>
            <textarea
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="Сонирхож буй зүйлээ бичнэ үү"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-black px-6 py-3 text-white hover:opacity-90"
          >
            Илгээх
          </button>
        </form>
      </div>
    </section>
  );
}
