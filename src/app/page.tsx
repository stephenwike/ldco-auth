import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const cookieStore = await cookies();
    const returnTo = cookieStore.get("oauth_return_to")?.value;
    if (returnTo) {
      redirect(returnTo);
    }
  }

  redirect("/login");
}
