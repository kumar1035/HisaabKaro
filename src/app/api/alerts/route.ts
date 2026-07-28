import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api-auth";
import { generateAlerts } from "@/agents/alert-engine";
export async function GET() { const auth = await requireUserId(); if ("error" in auth) return auth.error; try { return NextResponse.json(await generateAlerts(auth.userId)); } catch { return NextResponse.json({ error: "Could not generate alerts." }, { status: 500 }); } }
