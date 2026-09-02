"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AudioLines, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { Waveform } from "@/components/waveform";

const RESEND_COOLDOWN_SECONDS = 45;

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || code.length !== 6 || isVerifying) return;

    setIsVerifying(true);
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp: code,
    });
    setIsVerifying(false);

    if (error) {
      toast.error(error.message ?? "That code didn't work. Try again.");
      return;
    }

    router.push("/auth?verified=true");
  }

  async function handleResend() {
    if (!email || cooldown > 0 || isResending) return;

    setIsResending(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setIsResending(false);

    if (error) {
      toast.error(error.message ?? "Couldn't resend the code. Try again shortly.");
      return;
    }

    toast.success("New code sent.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grain opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/30 blur-[130px] animate-drift"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-88 w-88 rounded-full bg-magenta/25 blur-[130px]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-10 flex items-center justify-center gap-2">
          <AudioLines className="h-5 w-5 text-acid" />
          <span className="font-display text-lg font-extrabold">
            CAD<span className="text-sonic">ENCE</span>
          </span>
        </div>

        <div className="text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-acid">
            check your inbox
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[0.95]">
            Verify your email
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {email ? (
              <>
                We sent a code to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </>
            ) : (
              "We couldn't find an email to verify."
            )}
          </p>
        </div>

        {email ? (
          <form onSubmit={handleVerify} className="mt-10 space-y-6">
            <label className="block">
              <span className="mb-1.5 block text-center text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                6-digit code
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full border-b-2 border-border bg-transparent px-1 py-2.5 text-center font-mono text-2xl tracking-[0.5em] outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-acid"
              />
            </label>

            <button
              type="submit"
              disabled={code.length !== 6 || isVerifying}
              className="group flex w-full items-center justify-between gap-3 rounded-full bg-acid px-6 py-3.5 font-display text-base font-bold text-acid-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {isVerifying ? "Verifying..." : "Verify"}
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending
                ? "Sending..."
                : cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : "Resend code"}
            </button>
          </form>
        ) : (
          <div className="mt-10 text-center">
            <Link
              href="/auth"
              className="text-sm text-acid hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        )}

        <div className="mt-10">
          <Waveform
            seed={22}
            bars={28}
            progress={0.6}
            className="opacity-40"
          />
        </div>
      </div>
    </div>
  );
}
