import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

// Guards a Server Component route: redirects to /auth if there's no
// session, otherwise returns it. Pages using this must also export
// `dynamic = "force-dynamic"` - see the @neondatabase/auth docs.
export async function requireSession() {
  const { data: session } = await auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return session;
}
