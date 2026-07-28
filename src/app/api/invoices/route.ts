import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { reviewInvoice } from "@/agents/compliance-reviewer";
import { badRequest, invoiceSchema } from "@/lib/validation";

function present(invoice: any) {
  return { id: invoice.id, number: invoice.invoiceNumber, customer: invoice.customer.name, customerId: invoice.customerId, date: invoice.invoiceDate.toISOString().slice(0, 10), dueDate: invoice.dueDate?.toISOString().slice(0, 10) ?? null, rawInput: invoice.rawInput, status: invoice.paymentStatus, subtotal: invoice.subtotal, cgst: invoice.cgst, sgst: invoice.sgst, igst: invoice.igst, totalTax: invoice.totalTax, grandTotal: invoice.grandTotal, items: invoice.lineItems.map((item: any) => ({ description: item.description, hsnCode: item.hsnCode ?? "", quantity: item.quantity, unit: item.unit, rate: item.rate, gstRate: item.gstRate })) };
}

export async function GET() {
  const auth = await requireUserId(); if ("error" in auth) return auth.error;
  try { const invoices = await prisma.invoice.findMany({ where: { userId: auth.userId }, include: { customer: true, lineItems: true }, orderBy: { invoiceDate: "desc" } }); return NextResponse.json(invoices.map(present)); }
  catch { return NextResponse.json({ error: "Database unavailable" }, { status: 503 }); }
}

export async function POST(request: Request) {
  const auth = await requireUserId(); if ("error" in auth) return auth.error;
  try {
    const parsed = invoiceSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json(badRequest(parsed.error), { status: 400 });
    const body = parsed.data;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: auth.userId } });
    const existing = body.customerId ? await prisma.customer.findFirst({ where: { id: body.customerId, userId: auth.userId } }) : null;
    if (body.customerId && !existing) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    const customer = existing ?? await prisma.customer.upsert({ where: { userId_name: { userId: auth.userId, name: body.customer } }, update: { state: body.customerState || user.state || undefined, gstin: body.customerGstin || undefined }, create: { userId: auth.userId, name: body.customer, state: body.customerState || user.state || null, gstin: body.customerGstin || null } });
    const review = reviewInvoice({ seller: user, customer, items: body.items, invoiceDate: body.date, dueDate: body.dueDate });
    if (!review.approved) return NextResponse.json({ error: "Compliance review failed.", review }, { status: 422 });
    const count = await prisma.invoice.count({ where: { userId: auth.userId } });
    const totals = review.totals;
    const invoice = await prisma.invoice.create({ data: { invoiceNumber: `HK-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`, customerId: customer.id, userId: auth.userId, rawInput: body.rawInput ?? "", subtotal: totals.subtotal, cgst: totals.cgst, sgst: totals.sgst, igst: totals.igst, totalTax: totals.totalTax, grandTotal: totals.grandTotal, paymentStatus: "PENDING", dueDate: body.dueDate ? new Date(body.dueDate) : null, lineItems: { create: body.items.map((item: any) => { const amount = Number(item.quantity) * Number(item.rate); const gstAmount = amount * Number(item.gstRate) / 100; return { description: item.description, hsnCode: item.hsnCode || null, quantity: Number(item.quantity), unit: item.unit, rate: Number(item.rate), amount, gstRate: Number(item.gstRate), gstAmount, totalAmount: amount + gstAmount }; }) } }, include: { customer: true, lineItems: true } });
    await prisma.auditLog.create({ data: { userId: auth.userId, invoiceId: invoice.id, action: "INVOICE_CREATED", metadata: { invoiceNumber: invoice.invoiceNumber, grandTotal: invoice.grandTotal } } });
    const products = await prisma.product.findMany({ where: { userId: auth.userId } });
    for (const item of invoice.lineItems) { const match = products.find(p => p.name.toLowerCase() === item.description.toLowerCase() || p.name.toLowerCase().includes(item.description.toLowerCase()) || item.description.toLowerCase().includes(p.name.toLowerCase())); if (match) { await prisma.product.update({ where: { id: match.id }, data: { currentStock: { decrement: item.quantity } } }); await prisma.auditLog.create({ data: { userId: auth.userId, invoiceId: invoice.id, action: "STOCK_DEDUCTED", metadata: { product: match.name, quantity: item.quantity } } }); } }
    return NextResponse.json(present(invoice), { status: 201 });
  } catch { return NextResponse.json({ error: "Could not save invoice." }, { status: 500 }); }
}
