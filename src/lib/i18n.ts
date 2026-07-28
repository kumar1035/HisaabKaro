export type AppLanguage = "en" | "hi";

export const ui = {
  en: {
    dashboard: "Dashboard", create: "Create invoice", invoices: "Invoices", customers: "Customers", analytics: "Analytics", settings: "Business settings",
    privateAccount: "Private account", privateCopy: "Your invoices are visible only to you.", greeting: "Good morning", newInvoice: "New invoice", language: "हिंदी में देखें", signIn: "Sign in to HisaabKaro", signInCopy: "Your business data stays private to your account.", continueGoogle: "Continue with Google",
    revenue: "This month revenue", invoicesCreated: "Invoices created", pending: "Pending payments", gst: "GST collected", thisMonth: "This month", ready: "Ready for filing", createTitle: "Create an invoice", createCopy: "Describe a sale in Hindi, English, or Hinglish.",
  },
  hi: {
    dashboard: "डैशबोर्ड", create: "बिल बनाएं", invoices: "मेरे बिल", customers: "ग्राहक", analytics: "हिसाब", settings: "दुकान की जानकारी",
    privateAccount: "आपका निजी खाता", privateCopy: "आपके बिल केवल आपको दिखाई देते हैं।", greeting: "नमस्ते", newInvoice: "नया बिल बनाएं", language: "View in English", signIn: "HisaabKaro में साइन इन करें", signInCopy: "आपकी दुकान की जानकारी सिर्फ आपके खाते में सुरक्षित रहती है।", continueGoogle: "Google से आगे बढ़ें",
    revenue: "इस महीने की बिक्री", invoicesCreated: "बनाए गए बिल", pending: "बाकी भुगतान", gst: "GST जमा", thisMonth: "इस महीने", ready: "फाइलिंग के लिए तैयार", createTitle: "नया बिल बनाएं", createCopy: "हिंदी, अंग्रेज़ी या हिंग्लिश में बिक्री लिखें।",
  },
} as const;
