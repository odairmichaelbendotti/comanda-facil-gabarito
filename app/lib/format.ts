export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Decimal(10,2) columns round-trip through Prisma as decimal.js instances,
// whose default toString() drops trailing zeros ("40" instead of "40.00").
// API responses need the fixed 2-decimal form so the front never has to
// guess whether a price is missing cents.
export function decimalToString(value: { toFixed: (digits: number) => string }) {
  return value.toFixed(2);
}
