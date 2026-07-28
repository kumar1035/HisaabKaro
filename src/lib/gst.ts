export type GSTTotals = { subtotal: number; cgst: number; sgst: number; igst: number; totalTax: number; grandTotal: number };

export function calculateGST(amount: number, rate: number, isInterstate = false) {
  const totalTax = Number((amount * rate / 100).toFixed(2));
  return {
    cgst: isInterstate ? 0 : Number((totalTax / 2).toFixed(2)),
    sgst: isInterstate ? 0 : Number((totalTax / 2).toFixed(2)),
    igst: isInterstate ? totalTax : 0,
    totalTax,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

export function amountInWords(value: number) {
  if (!value) return "Zero rupees only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n: number) => n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`;
  const three = (n: number) => n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${two(n % 100)}` : ""}` : two(n);
  const n = Math.round(value);
  const parts = [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"]] as const;
  let rest = n; const words: string[] = [];
  for (const [divisor, label] of parts) { const part = Math.floor(rest / divisor); if (part) words.push(`${three(part)} ${label}`); rest %= divisor; }
  if (rest) words.push(three(rest));
  return `${words.join(" ")} rupees only`;
}
