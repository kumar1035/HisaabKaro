import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { badRequest, productSchema } from "@/lib/validation";
export async function PATCH(request: Request, { params }: { params: { id: string } }) { const auth = await requireUserId(); if ("error" in auth) return auth.error; const parsed = productSchema.partial().safeParse(await request.json()); if (!parsed.success) return NextResponse.json(badRequest(parsed.error), { status: 400 }); const result = await prisma.product.updateMany({ where: { id: params.id, userId: auth.userId }, data: parsed.data }); return result.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Product not found." }, { status: 404 }); }
export async function DELETE(_: Request, { params }: { params: { id: string } }) { const auth = await requireUserId(); if ("error" in auth) return auth.error; await prisma.product.deleteMany({ where: { id: params.id, userId: auth.userId } }); return new NextResponse(null, { status: 204 }); }
