// src/app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

import { getJwtSecret } from "@/lib/jwt";
import type { JwtPayload } from "@/lib/jwtPayload";
import { getHomeByRole, RoleCode } from "@/app/config/roleHome";

// components
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Finance from "@/components/landing/Finance";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import Contact from "@/components/landing/Contact";

export default async function LandingPage() {
  const token = (await cookies()).get("access_token")?.value;

  let home: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify<JwtPayload>(token, getJwtSecret());

      const activeRole = (payload as any)?.activeRole as RoleCode | undefined;
      home = getHomeByRole(activeRole);
    } catch {
      home = null;
    }
  }

  if (home) {
    redirect(home);
  }

  return (
    <main className="bg-white text-gray-900">
      <Header />
      <Hero />
      <Features />
      <Finance />
      <Pricing />
      <Testimonials />
      <Contact />
    </main>
  );
}
