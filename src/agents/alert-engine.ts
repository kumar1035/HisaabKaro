import { prisma } from "@/lib/prisma";

export type Alert = { id: string; type: string; severity: "info" | "warning" | "action"; titleHi: string; titleEn: string; descriptionHi: string; descriptionEn: string; actionLabel?: string; actionHref?: string };
const rs = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export async function generateAlerts(userId: string): Promise<Alert[]> {
  const now = new Date(); const old = new Date(now); old.setDate(old.getDate() - 30);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [overdue, high, current, previous, total, low] = await Promise.all([
    prisma.invoice.findMany({ where: { userId, paymentStatus: "PENDING", createdAt: { lt: old } }, include: { customer: true } }),
    prisma.invoice.findFirst({ where: { userId, paymentStatus: "PENDING", grandTotal: { gt: 10000 } }, include: { customer: true }, orderBy: { grandTotal: "desc" } }),
    prisma.invoice.aggregate({ where: { userId, invoiceDate: { gte: monthStart } }, _sum: { grandTotal: true } }),
    prisma.invoice.aggregate({ where: { userId, invoiceDate: { gte: prevStart, lt: monthStart } }, _sum: { grandTotal: true } }),
    prisma.invoice.aggregate({ where: { userId }, _sum: { grandTotal: true } }),
    prisma.product.findMany({ where: { userId } }),
  ]);
  const alerts: Alert[] = [];
  if (overdue.length) alerts.push({ id: "overdue", type: "OVERDUE", severity: "action", titleHi: "पुराने भुगतान pending हैं", titleEn: "Old payments are pending", descriptionHi: `आपके ${overdue.length} invoices 30 दिनों से pending हैं — reminders भेजें?`, descriptionEn: `You have ${overdue.length} invoices pending for over 30 days — send reminders?`, actionLabel: "View invoices", actionHref: "#invoices" });
  if (high) alerts.push({ id: "high-value", type: "HIGH_VALUE", severity: "action", titleHi: "बड़े payment का follow-up", titleEn: "High-value payment follow-up", descriptionHi: `${high.customer.name} से ${rs(high.grandTotal)} pending है — follow up करें?`, descriptionEn: `${rs(high.grandTotal)} is pending from ${high.customer.name} — follow up?` });
  if (now.getDate() > 5) alerts.push({ id: "gstr", type: "GSTR", severity: "warning", titleHi: "GSTR-1 reminder", titleEn: "GSTR-1 reminder", descriptionHi: "GSTR-1 11 तारीख तक भरना है — CSV डाउनलोड करें।", descriptionEn: "GSTR-1 filing is due by the 11th — download your CSV export.", actionLabel: "Download CSV", actionHref: "/api/gst-export" });
  const days = Math.max(now.getDate(), 1); const pace = (previous._sum.grandTotal ?? 0) / new Date(now.getFullYear(), now.getMonth(), 0).getDate() * days; const currentRevenue = current._sum.grandTotal ?? 0;
  if (pace > 0 && currentRevenue < pace * .8) { const drop = Math.round((1 - currentRevenue / pace) * 100); alerts.push({ id: "drop", type: "REVENUE_DROP", severity: "warning", titleHi: "Revenue कम है", titleEn: "Revenue is down", descriptionHi: `Revenue पिछले महीने की pace से ${drop}% कम है।`, descriptionEn: `Revenue is ${drop}% lower than last month's pace.` }); }
  for (const mark of [500000, 100000, 50000, 25000, 10000]) if ((total._sum.grandTotal ?? 0) >= mark) { alerts.push({ id: `milestone-${mark}`, type: "MILESTONE", severity: "info", titleHi: "बधाई हो! 🎉", titleEn: "Congratulations! 🎉", descriptionHi: `आपने कुल ${rs(mark)} revenue पार कर लिया।`, descriptionEn: `You crossed ${rs(mark)} in total revenue.` }); break; }
  low.filter(p => p.currentStock <= p.reorderLevel).forEach(p => alerts.push({ id: `stock-${p.id}`, type: "LOW_STOCK", severity: "action", titleHi: "स्टॉक कम है", titleEn: "Stock is low", descriptionHi: `⚠️ ${p.name} का stock low है (${p.currentStock} ${p.unit} बचे) — reorder करें।`, descriptionEn: `⚠️ ${p.name} is low (${p.currentStock} ${p.unit} left) — reorder it.`, actionLabel: "Inventory", actionHref: "#inventory" }));
  return alerts;
}
