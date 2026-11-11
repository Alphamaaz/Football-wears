"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck } from "lucide-react";
import { login } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";
import { Alert, Button, Input, Label } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@footballwears.shop");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await login({ email, password });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please check your credentials and try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-black uppercase tracking-wider text-primary border border-primary/25">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
          Store Admin Login
        </h1>
        <p className="text-xs sm:text-sm text-body leading-relaxed">
          Exclusive portal for Hamad (Store Owner) to manage football inventory, track Cash on Delivery dispatches, and upload new kits.
        </p>
      </div>

      {error && <div className="mb-5"><Alert kind="error">{error}</Alert></div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-xs font-bold text-ink">Admin Email Address</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@footballwears.shop"
              className="pl-10 h-11 rounded-2xl text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold text-ink">Admin Password</Label>
          </div>
          <div className="relative mt-1">
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-2xl text-sm"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            full
            size="lg"
            disabled={submitting}
            className="h-12 rounded-2xl font-extrabold text-sm shadow-soft transition-all"
          >
            {submitting ? (
              "Signing in…"
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Log In to Admin Dashboard
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-line text-center">
        <p className="text-xs text-muted flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Restricted to Football Wears Store Administrator (Hamad)</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
