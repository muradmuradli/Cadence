"use server";

import { auth } from "@/lib/auth/server";
import { signInSchema } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
};

export async function signIn(prevState: AuthState, formData: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await auth.signIn.email({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) return { error: error.message };
  redirect("/dashboard");
}
