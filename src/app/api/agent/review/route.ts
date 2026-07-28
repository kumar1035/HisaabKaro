import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api-auth";
import { reviewInvoice } from "@/agents/compliance-reviewer";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const auth = await requireUserId(); if ("error" in auth) return auth.error;
  if (!rateLimit(`review:${auth.userId}`)) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  try { return NextResponse.json(reviewInvoice(await request.json())); }
  catch { return NextResponse.json({ error: "Invalid invoice review request." }, { status: 400 }); }
}
