import { calculateGST } from "@/lib/gst";

export type ReviewInput = { seller?: { gstin?: string | null; state?: string | null }; customer?: { gstin?: string | null; state?: string | null }; items: Array<{ description: string; hsnCode?: string | null; quantity: number; rate: number; gstRate: number; amount?: number }>; subtotal?: number; cgst?: number; sgst?: number; igst?: number; totalTax?: number; grandTotal?: number; invoiceDate?: string; dueDate?: string | null };
export type ReviewIssue = { field: string; severity: "error" | "warning"; message: string };
const gstin = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const allowedSlabs = [0, 0.25, 3, 5, 12, 18, 28];
const same = (a: number | undefined, b: number, delta = .02) => Math.abs((a ?? b) - b) <= delta;

export function reviewInvoice(input: ReviewInput) {
  const issues: ReviewIssue[] = [];
  const sellerState = input.seller?.state?.trim().toLowerCase(); const buyerState = input.customer?.state?.trim().toLowerCase();
  if (!input.seller?.gstin || !gstin.test(input.seller.gstin)) issues.push({ field: "seller.gstin", severity: "error", message: "Seller GSTIN is missing or invalid." });
  if (!sellerState) issues.push({ field: "seller.state", severity: "error", message: "Seller state is required to determine GST tax mode." });
  // GSTIN is optional for B2C/walk-in sales. When supplied, it must be valid.
  if (input.customer?.gstin && !gstin.test(input.customer.gstin)) issues.push({ field: "customer.gstin", severity: "error", message: "Customer GSTIN is invalid." });
  if (!buyerState) issues.push({ field: "customer.state", severity: "warning", message: "Customer state is missing; seller state is used for this B2C sale." });
  if (!input.items.length) issues.push({ field: "items", severity: "error", message: "At least one line item is required." });
  let subtotal = 0, tax = 0;
  input.items.forEach((item, index) => {
    if (!item.description?.trim() || item.quantity <= 0 || item.rate < 0) issues.push({ field: `items.${index}`, severity: "error", message: "Description, positive quantity, and rate are required." });
    if (!item.hsnCode || !/^\d{4}(?:\d{2})?(?:\d{2})?$/.test(item.hsnCode)) issues.push({ field: `items.${index}.hsnCode`, severity: "error", message: "HSN must contain 4, 6, or 8 digits." });
    if (!allowedSlabs.includes(item.gstRate)) issues.push({ field: `items.${index}.gstRate`, severity: "error", message: "GST rate must be a valid GST slab." });
    const calculatedAmount = item.quantity * item.rate;
    if (item.amount !== undefined && !same(item.amount, calculatedAmount)) issues.push({ field: `items.${index}.amount`, severity: "error", message: "Line amount must equal quantity × rate." });
    subtotal += calculatedAmount; tax += calculatedAmount * item.gstRate / 100;
  });
  const interstate = Boolean(sellerState && buyerState && sellerState !== buyerState); const taxes = calculateGST(tax ? subtotal : 0, tax && subtotal ? tax / subtotal * 100 : 0, interstate);
  if (input.subtotal !== undefined && !same(input.subtotal, subtotal)) issues.push({ field: "subtotal", severity: "error", message: "Subtotal does not equal the sum of line items." });
  if (interstate && ((input.cgst ?? 0) > .02 || (input.sgst ?? 0) > .02 || !same(input.igst, tax))) issues.push({ field: "tax", severity: "error", message: "Interstate supply requires IGST only." });
  if (!interstate && ((input.igst ?? 0) > .02 || !same(input.cgst, taxes.cgst) || !same(input.sgst, taxes.sgst))) issues.push({ field: "tax", severity: "error", message: "Intrastate supply requires equal CGST and SGST." });
  if (input.totalTax !== undefined && !same(input.totalTax, tax)) issues.push({ field: "totalTax", severity: "error", message: "Total tax does not match line-item GST." });
  if (input.grandTotal !== undefined && !same(input.grandTotal, subtotal + tax)) issues.push({ field: "grandTotal", severity: "error", message: "Grand total does not match subtotal plus tax." });
  if (input.dueDate && input.invoiceDate && new Date(input.dueDate) < new Date(input.invoiceDate)) issues.push({ field: "dueDate", severity: "error", message: "Due date cannot be before invoice date." });
  return { approved: !issues.some(i => i.severity === "error"), interstate, issues, totals: { ...taxes, subtotal, totalTax: tax, grandTotal: subtotal + tax } };
}
