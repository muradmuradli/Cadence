"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { AudioLines, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Waveform } from "@/components/waveform";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthState, signIn } from "./actions";
import { authClient } from "@/lib/auth/client";
import {
  SignInFormValues,
  SignUpFormValues,
  signInSchema,
  signUpSchema,
} from "@/lib/schemas/auth";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const initialState: AuthState = {};

function Field({
  label,
  type = "text",
  placeholder,
  name,
  form,
}: {
  label: "Name" | "Email" | "Password" | "Confirm password";
  type?: string;
  placeholder: string;
  name: "name" | "email" | "password" | "confirmPassword";
  form: UseFormReturn<SignInFormValues> | UseFormReturn<SignUpFormValues>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const typedForm = form as unknown as UseFormReturn<FieldValues>;
  const error = typedForm.formState.errors[name];
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          {...typedForm.register(name)}
          className={`w-full border-b-2 border-border bg-transparent px-1 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-acid ${
            isPassword ? "pr-8" : ""
          }`}
        />
        {isPassword && (
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
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-magenta">
          {error.message as string}
        </p>
      )}
    </label>
  );
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasShownVerifiedToast = useRef(false);
  const hasShownResetToast = useRef(false);

  const [mode, setMode] = useState<"in" | "up">("in");

  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialState,
  );

  useEffect(() => {
    if (signInState.error) {
      toast.error(signInState.error);
    }
  }, [signInState]);

  useEffect(() => {
    if (
      searchParams.get("verified") === "true" &&
      !hasShownVerifiedToast.current
    ) {
      hasShownVerifiedToast.current = true;
      toast.success("Email verified! You can now sign in.");
      router.replace("/auth");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (searchParams.get("reset") === "true" && !hasShownResetToast.current) {
      hasShownResetToast.current = true;
      toast.success("Password reset! You can now sign in with your new password.");
      router.replace("/auth");
    }
  }, [searchParams, router]);

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const form = mode === "in" ? signInForm : signUpForm;
  const typedForm = form as unknown as UseFormReturn<FieldValues>;
  const isSignUpSubmitting = typedForm.formState.isSubmitting;
  const isPending = mode === "in" ? signInPending : isSignUpSubmitting;

  const onSubmit = typedForm.handleSubmit(async (data) => {
    if (mode === "in") {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      startTransition(() => {
        signInAction(formData);
      });
      return;
    }

    const { data: signUpData, error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Try again.");
      return;
    }

    if (signUpData?.user && !signUpData.user.emailVerified) {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      return;
    }

    router.push("/dashboard");
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden lg:flex-row">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grain opacity-30"
      />

      <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-surface px-8 py-12 lg:flex lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/30 blur-[130px] animate-drift"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-88 w-88 rounded-full bg-magenta/25 blur-[130px]"
        />
        <div className="relative flex items-center gap-2">
          <AudioLines className="h-5 w-5 text-acid" />
          <span className="font-display text-lg font-extrabold">
            CAD<span className="text-sonic">ENCE</span>
          </span>
        </div>

        <div className="relative max-w-lg py-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-acid">
            synthetic voice lab
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
            Type it.
            <br />
            <span className="text-sonic">Hear it breathe.</span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground">
            Twenty-four studio voices, instant cloning from a ten second sample,
            and renders that sound like they were tracked in a booth.
          </p>
        </div>

        <div className="relative h-24">
          <Waveform
            seed={9}
            bars={80}
            active
            tone="magenta"
            className="opacity-70"
          />
        </div>
      </section>

      <section className="relative flex flex-1 items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 inline-flex rounded-full border border-border p-1">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-sonic text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "in" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <h2 className="font-display text-4xl font-extrabold">
            {mode === "in" ? "Back in the booth" : "Start your studio"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "in"
              ? "Pick up right where your last render left off."
              : "Free tier: 20 generations and one cloned voice."}
          </p>

          <form noValidate onSubmit={onSubmit} className="mt-8 space-y-6">
            {mode === "up" && (
              <Field
                form={form}
                type="text"
                label="Name"
                name="name"
                placeholder="Helen Kellner"
              />
            )}
            <Field
              type="email"
              label="Email"
              name="email"
              form={form}
              placeholder="you@studio.com"
            />
            <Field
              type="password"
              label="Password"
              name="password"
              form={form}
              placeholder="••••••••"
            />
            {mode === "in" && (
              <div className="-mt-3 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
            )}
            {mode === "up" && (
              <Field
                type="password"
                label="Confirm password"
                name="confirmPassword"
                form={form}
                placeholder="••••••••"
              />
            )}

            <button
              type="submit"
              disabled={isPending}
              className="group flex w-full items-center justify-between gap-3 rounded-full bg-acid px-6 py-3.5 font-display text-base font-bold text-acid-foreground transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mode === "in"
                ? signInPending
                  ? "Signing in..."
                  : "Sign in"
                : isSignUpSubmitting
                  ? "Creating account..."
                  : "Create account"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8">
            <Waveform
              seed={22}
              bars={28}
              progress={0.6}
              className="opacity-40"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
