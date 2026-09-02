"use client";

import { useState } from "react";
import Link from "next/link";
import { AudioLines, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { Waveform } from "@/components/waveform";
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@/lib/schemas/auth";

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Try again.");
      return;
    }

    setIsSent(true);
  });

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
            account recovery
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[0.95]">
            Forgot your password?
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {isSent
              ? "If an account exists for that email, a reset link has been sent."
              : "Enter your email and we'll send you a link to reset it."}
          </p>
        </div>

        {isSent ? (
          <div className="mt-10 text-center">
            <Link href="/auth" className="text-sm text-acid hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="mt-10 space-y-6">
            <label className="block">
              <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                placeholder="you@studio.com"
                {...form.register("email")}
                className="w-full border-b-2 border-border bg-transparent px-1 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-acid"
              />
              {form.formState.errors.email && (
                <p className="mt-1.5 text-xs text-magenta">
                  {form.formState.errors.email.message}
                </p>
              )}
            </label>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="group flex w-full items-center justify-between gap-3 rounded-full bg-acid px-6 py-3.5 font-display text-base font-bold text-acid-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>
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
