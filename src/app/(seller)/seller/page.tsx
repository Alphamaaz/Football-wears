"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs font-bold uppercase tracking-wider">Redirecting to Football Wears Admin Dashboard...</p>
      </div>
    </div>
  );
}
