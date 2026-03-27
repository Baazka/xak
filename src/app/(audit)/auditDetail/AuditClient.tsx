"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
const steps = ["Step 1", "Step 2", "Step 3"];
const menus = [
  "Menuууууууу 1",
  "Menuууууууу 2",
  "Menuууууууу 3",
  "Menuууууууу 4",
  "Menuууууууу 5",
  "Menuууууууу 6",
  "Menuууууууу 7",
  "Menuууууууу 8",
  "Menuууууууу 9",
  "Menuууууууу 10",
  "Menuууууууу 11",
  "Menuууууууу 12",
  "Menuууууууу 13",
  "Menuууууууу 14",
  "Menuууууууу 15",
  "Menuууууууу 16",
  "Menuууууууу 17",
  "Menuууууууу 18",
];

export default function AuditDetailClient() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [activeMenu, setActiveMenu] = useState(0);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY;
  };

  const handleClick = (i: number) => {
    setActiveMenu(i);

    const el = document.getElementById(`menu-${i}`);
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] overflow-hidden bg-white dark:bg-gray-900 dark:text-white">
      <div className="flex h-full">
        <aside className="border-r dark:border-gray-700">
          <div className="flex h-full flex-col">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex flex-1 items-center justify-center rotate-180 px-4 py-2 text-sm font-medium transition [writing-mode:vertical-rl]
              ${
                activeStep === i
                  ? "border border-blue-500 bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
              >
                {step}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 min-h-0 flex-1 flex-col gap-4 p-6">
          <div className="flex shrink-0 items-center gap-3">
            <div className="shrink-0">
              <Button onClick={() => router.push("/audit")}>Буцах</Button>
            </div>

            {/* LEFT */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="shrink-0 rounded-lg bg-gray-200 px-2 py-1 hover:bg-gray-300"
              >
                ◀
              </button>
            )}
            <div
              ref={scrollRef}
              onWheel={handleWheel}
              className="no-scrollbar flex-1 overflow-x-auto"
            >
              <div className="flex min-w-max items-center gap-2">
                {menus.map((menu, i) => (
                  <button
                    key={i}
                    id={`menu-${i}`}
                    onClick={() => handleClick(i)}
                    className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition
                  ${
                    activeMenu === i
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  }`}
                  >
                    {menu}
                  </button>
                ))}
              </div>
            </div>
            {/* RIGHT */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="shrink-0 rounded-lg bg-gray-200 px-2 py-1 hover:bg-gray-300"
              >
                ▶
              </button>
            )}
          </div>

          <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-gray-800 p-5 dark:border-gray-700">
            <div className="mb-4 shrink-0 text-lg font-bold">
              Step {activeStep + 1} / Menu {activeMenu + 1}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-purple-100 p-4 dark:bg-purple-900/30">
              <div className="space-y-2">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-white/60 p-4 dark:bg-white/10">
                    Row {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
