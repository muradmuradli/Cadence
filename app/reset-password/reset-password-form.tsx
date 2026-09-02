"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AudioLines, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { Waveform } from "@/components/waveform";
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/lib/schemas/auth";

function PasswordField({
  label,
  placeholder,
  register,
  error,
}: {
  label: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...register}
          className="w-full border-b-2 border-border bg-transparent px-1 py-2.5 pr-8 text-base outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-acid"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-magenta">{error}</p>}
    </label>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenIsInvalid = !token || searchParams.get("error") === "INVALID_TOKEN";

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (!token) return;

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      toast.error(
        error.message ??
          "That link has expired or is invalid. Request a new one.",
      );
      return;
    }

    router.push("/auth?reset=true");
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
            Set a new password
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {tokenIsInvalid
              ? "This reset link is invalid or has expired."
              : "Choose a strong new password for your account."}
          </p>
        </div>

        {tokenIsInvalid ? (
          <div className="mt-10 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-acid hover:underline"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="mt-10 space-y-6">
            <PasswordField
              label="New password"
              placeholder="••••••••"
              register={form.register("password")}
              error={form.formState.errors.password?.message}
            />
            <PasswordField
              label="Confirm password"
              placeholder="••••••••"
              register={form.register("confirmPassword")}
              error={form.formState.errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="group flex w-full items-center justify-between gap-3 rounded-full bg-acid px-6 py-3.5 font-display text-base font-bold text-acid-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
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
