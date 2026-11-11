"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="py-12 text-center text-xs text-muted">
      Public registration is disabled. Redirecting to Admin Login...
    </div>
  );
}
