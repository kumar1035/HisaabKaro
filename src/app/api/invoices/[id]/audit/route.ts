import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireUserId(); if ("error" in auth) return auth.error;
  const invoice = await prisma.invoice.findFirst({ where: { id: params.id, userId: auth.userId }, select: { id: true } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(await prisma.auditLog.findMany({ where: { userId: auth.userId, invoiceId: params.id }, orderBy: { createdAt: "desc" } }));
}
