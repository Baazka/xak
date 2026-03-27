import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export default function Contact() {
  return (
    <section id="contact" className="bg-black py-10 md:py-14 text-white">
      <div className="mx-auto max-w-3xl px-4 md:px-6 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Холбоо барих</h2>

        <p className="mt-3 mx-auto max-w-md text-sm text-white/70">
          Танай байгууллагад тохирсон шийдэл, demo, үнийн санал авах бол бидэнтэй холбогдоорой.
        </p>

        <div className="mt-6 space-y-2 text-sm text-white/80">
          <p>Email: info@domain.mn</p>
          <p>Phone: +976 7000 0000</p>
          <p>Address: Ulaanbaatar, Mongolia</p>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <a
            href="mailto:info@domain.mn"
            className="rounded-md bg-white px-4 py-2 text-sm text-black"
          >
            Майл илгээх
          </a>

          <a
            href="tel:+97670000000"
            className="rounded-md border px-4 py-2 text-sm hover:bg-white hover:text-black transition"
          >
            Залгах
          </a>
        </div>

        {/* SOCIAL */}
        <div className="mt-5 flex justify-center gap-3">
          <a className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white hover:text-black transition">
            <FaFacebookF size={14} />
          </a>
          <a className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white hover:text-black transition">
            <FaTwitter size={14} />
          </a>
          <a className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white hover:text-black transition">
            <FaLinkedinIn size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
