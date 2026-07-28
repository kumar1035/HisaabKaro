import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { badRequest, productSchema } from "@/lib/validation";
export async function GET() { const auth = await requireUserId(); if ("error" in auth) return auth.error; try { return NextResponse.json(await prisma.product.findMany({ where: { userId: auth.userId }, orderBy: { name: "asc" } })); } catch { return NextResponse.json({ error: "Could not load products." }, { status: 500 }); } }
export async function POST(request: Request) { const auth = await requireUserId(); if ("error" in auth) return auth.error; const parsed = productSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json(badRequest(parsed.error), { status: 400 }); try { const p = parsed.data; return NextResponse.json(await prisma.product.create({ data: { ...p, hsn: p.hsn || null, userId: auth.userId } }), { status: 201 }); } catch { return NextResponse.json({ error: "Could not create product. It may already exist." }, { status: 400 }); } }
