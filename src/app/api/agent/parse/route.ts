import { NextResponse } from "next/server";
import { parseSaleWithAI } from "@/lib/parser";
import { requireUserId } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const auth = await requireUserId(); if ("error" in auth) return auth.error;
    if (!rateLimit(`parse:${auth.userId}`)) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
    const { input } = await request.json();
    if (typeof input !== "string" || input.trim().length < 3) return NextResponse.json({ error: "Describe the sale in a little more detail." }, { status: 400 });
    return NextResponse.json(await parseSaleWithAI(input));
  } catch { return NextResponse.json({ error: "Unable to parse this sale." }, { status: 400 }); }
}
