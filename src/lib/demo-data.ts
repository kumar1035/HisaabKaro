export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL" | "OVERDUE";
export type InvoiceItem = { description: string; hsnCode: string; quantity: number; unit: string; rate: number; gstRate: number };
export type Invoice = { id: string; number: string; customer: string; date: string; rawInput: string; items: InvoiceItem[]; status: PaymentStatus; notes?: string };

export const demoInvoices: Invoice[] = [
  { id: "seed-1", number: "HK-2026-0003", customer: "Sharma Ji", date: "2026-07-25", rawInput: "", status: "PENDING", items: [{ description: "Wheat flour", hsnCode: "1101", quantity: 50, unit: "kg", rate: 48, gstRate: 5 }, { description: "Sugar", hsnCode: "1701", quantity: 20, unit: "kg", rate: 42, gstRate: 5 }] },
  { id: "seed-2", number: "HK-2026-0002", customer: "Mehta Stores", date: "2026-07-19", rawInput: "", status: "PAID", items: [{ description: "Cooking oil", hsnCode: "1508", quantity: 15, unit: "litre", rate: 135, gstRate: 5 }] },
  { id: "seed-3", number: "HK-2026-0001", customer: "Gupta Traders", date: "2026-07-08", rawInput: "", status: "PARTIAL", items: [{ description: "Soap", hsnCode: "3401", quantity: 40, unit: "pcs", rate: 35, gstRate: 18 }] },
];

export function invoiceTotals(invoice: Pick<Invoice, "items">) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate * item.gstRate / 100, 0);
  return { subtotal, tax, total: subtotal + tax };
}
