import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth(redirectTo = "/auth/sign-in") {
  const cookieStore = await cookies(); // ✅ await because cookies() returns Promise now
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect(redirectTo);
  }

  return token;
}
