import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { badRequest, settingsSchema } from "@/lib/validation";
const select = { id: true, email: true, name: true, businessName: true, gstin: true, address: true, state: true, phone: true, logoUrl: true, bankName: true, bankAccountNumber: true, bankIfsc: true, upiId: true } as const;
export async function GET() { const auth = await requireUserId(); if ("error" in auth) return auth.error; try { return NextResponse.json(await prisma.user.findUnique({ where: { id: auth.userId }, select })); } catch { return NextResponse.json({ error: "Database unavailable." }, { status: 503 }); } }
export async function PATCH(request: Request) { const auth = await requireUserId(); if ("error" in auth) return auth.error; try { const parsed = settingsSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json(badRequest(parsed.error), { status: 400 }); const data = Object.fromEntries(Object.entries(parsed.data).map(([key, value]) => [key, value || null])); return NextResponse.json(await prisma.user.update({ where: { id: auth.userId }, data, select })); } catch { return NextResponse.json({ error: "Could not save business settings." }, { status: 500 }); } }
