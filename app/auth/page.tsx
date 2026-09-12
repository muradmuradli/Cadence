import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { AuthForm } from "./auth-form";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const { data: session } = await auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
