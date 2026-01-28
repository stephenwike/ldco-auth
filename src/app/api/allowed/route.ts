import { NextResponse } from "next/server";
import { isAlphaAllowed } from "@/lib/alphaAllowList";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  const allowed = isAlphaAllowed(email);
  return NextResponse.json({ allowed });
}
