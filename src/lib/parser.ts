export type ParsedItem = { description: string; quantity: number; unit: string; rate: number; hsnCode: string; gstRate: number };
export type ParsedSale = { customerName: string; customerPhone?: string; customerGstin?: string; customerState?: string; items: ParsedItem[]; notes: string; confidence: number; clarification?: string; source: "openai" | "offline" };

const products = [
  { terms: ["aata", "atta", "आटा", "wheat flour", "flour"], description: "Wheat flour", hsnCode: "1101", gstRate: 5 },
  { terms: ["cheeni", "चीनी", "sugar"], description: "Sugar", hsnCode: "1701", gstRate: 5 },
  { terms: ["chawal", "चावल", "rice"], description: "Rice", hsnCode: "1006", gstRate: 5 },
  { terms: ["tel", "तेल", "oil", "cooking oil"], description: "Cooking oil", hsnCode: "1508", gstRate: 5 },
  { terms: ["sabun", "साबुन", "soap"], description: "Soap", hsnCode: "3401", gstRate: 18 },
  { terms: ["stationery", "notebook", "register"], description: "Stationery", hsnCode: "4820", gstRate: 12 },
];

export function parseSale(raw: string): ParsedSale {
  const normalized = raw.toLowerCase().replace(/₹/g, "");
  const customerMatch = raw.match(/(?:to|ko|for)\s+([A-Za-z][A-Za-z .'-]*?)(?=\s+(?:at|@|\d+\s*(?:kg|pcs|pc|litre|l|dozen|box|packet))|,|$)/i);
  const customerName = customerMatch?.[1]?.trim() || "Walk-in customer";
  const items: ParsedItem[] = [];
  for (const product of products) {
    const hit = product.terms.find((term) => normalized.includes(term));
    if (!hit) continue;
    const escaped = hit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const before = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(kg|kgs|pcs?|pieces?|litres?|l|dozen|box(?:es)?|packets?)?[^,.]{0,35}${escaped}`, "i").exec(normalized);
    const after = new RegExp(`${escaped}[^,.]{0,50}?(?:at|@|/|rate)?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:/\\s*(?:kg|pcs?|l|litre))?`, "i").exec(normalized);
    const quantity = Number(before?.[1] ?? 1); const unit = (before?.[2] ?? "pcs").replace(/kgs?/i, "kg").replace(/pieces?/i, "pcs");
    const rate = Number(after?.[1] ?? 0);
    items.push({ description: product.description, quantity, unit, rate, hsnCode: product.hsnCode, gstRate: product.gstRate });
  }
  if (!items.length) items.push({ description: "Sale item", quantity: 1, unit: "pcs", rate: 0, hsnCode: "", gstRate: 18 });
  return { customerName, items, notes: "Parsed locally (offline fallback).", confidence: items.some(i => !i.rate) ? 0.45 : 0.7, clarification: items.some(i => !i.rate) ? "Please confirm the rate for each item." : undefined, source: "offline" };
}

const saleSchema = {
  type: "object", additionalProperties: false,
  required: ["customerName", "customerPhone", "customerGstin", "customerState", "items", "notes", "confidence", "clarification"],
  properties: {
    customerName: { type: "string" }, customerPhone: { type: "string" }, customerGstin: { type: "string" }, customerState: { type: "string" }, notes: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 }, clarification: { type: "string" },
    items: { type: "array", minItems: 1, items: { type: "object", additionalProperties: false, required: ["description", "quantity", "unit", "rate", "hsnCode", "gstRate"], properties: { description: { type: "string" }, quantity: { type: "number", minimum: 0 }, unit: { type: "string" }, rate: { type: "number", minimum: 0 }, hsnCode: { type: "string" }, gstRate: { type: "number", minimum: 0, maximum: 100 } } } },
  },
} as const;

export async function parseSaleWithAI(raw: string): Promise<ParsedSale> {
  if (!process.env.OPENAI_API_KEY) return parseSale(raw);
  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({ model: process.env.OPENAI_PARSER_MODEL ?? "gpt-4.1-mini", input: [{ role: "system", content: "Extract an Indian GST sale from Hindi, Hinglish, or English. Do not invent prices, HSNs, GSTINs, or states. Use empty strings for unknown text and 0 only for truly unspecified numeric values. Combine mixed products into separate items. Set clarification to a concise question when a material value is ambiguous; otherwise empty string." }, { role: "user", content: raw }], text: { format: { type: "json_schema", name: "sale", strict: true, schema: saleSchema } } } as never);
    const parsed = JSON.parse(response.output_text) as Omit<ParsedSale, "source">;
    return { ...parsed, customerName: parsed.customerName || "Walk-in customer", source: "openai", clarification: parsed.clarification || undefined };
  } catch {
    return parseSale(raw);
  }
}
