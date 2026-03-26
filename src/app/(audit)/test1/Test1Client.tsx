"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Test1Client() {
  const router = useRouter();

  return <Button onClick={() => router.push("/audit")}>Буцах </Button>;
}
