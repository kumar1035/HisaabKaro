import { z } from "zod";

export const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const hsnRegex = /^\d{4}(?:\d{2})?(?:\d{2})?$/;
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required.").max(120),
  phone: optionalText(20), email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")).nullable(),
  gstin: z.string().trim().toUpperCase().regex(gstinRegex, "Enter a valid GSTIN.").optional().or(z.literal("")).nullable(),
  address: optionalText(500), state: optionalText(80),
});
export const settingsSchema = z.object({
  businessName: optionalText(160), gstin: z.string().trim().toUpperCase().regex(gstinRegex, "Enter a valid GSTIN.").optional().or(z.literal("")).nullable(),
  address: optionalText(500), state: optionalText(80), phone: optionalText(20), logoUrl: z.string().url("Enter a valid logo URL.").optional().or(z.literal("")).nullable(),
  bankName: optionalText(120), bankAccountNumber: optionalText(40), bankIfsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC.").optional().or(z.literal("")).nullable(), upiId: optionalText(120),
});
export const lineItemSchema = z.object({ description: z.string().trim().min(1), hsnCode: z.string().regex(hsnRegex, "HSN must be 4, 6, or 8 digits."), quantity: z.coerce.number().positive(), unit: z.string().trim().min(1), rate: z.coerce.number().nonnegative(), gstRate: z.coerce.number() });
export const invoiceSchema = z.object({ customerId: z.string().cuid().optional(), customer: z.string().trim().min(1), customerState: optionalText(80), customerGstin: z.string().trim().toUpperCase().regex(gstinRegex).optional().or(z.literal("")).nullable(), rawInput: z.string().max(5000).optional(), date: z.string().date().optional(), dueDate: z.string().date().optional().nullable(), items: z.array(lineItemSchema).min(1) });
export const statusSchema = z.object({ status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]) });
export const productSchema = z.object({ name: z.string().trim().min(1).max(120), hsn: z.string().trim().regex(hsnRegex).optional().or(z.literal("")), gstRate: z.coerce.number().min(0).max(100).default(0), unit: z.string().trim().min(1).max(20).default("pcs"), currentStock: z.coerce.number().min(0).default(0), reorderLevel: z.coerce.number().min(0).default(10) });
export const restockSchema = z.object({ productId: z.string().cuid(), quantity: z.coerce.number().positive() });

export function badRequest(error: z.ZodError) { return { error: "Validation failed.", fields: error.flatten().fieldErrors }; }
