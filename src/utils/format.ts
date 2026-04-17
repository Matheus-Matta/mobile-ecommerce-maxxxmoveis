import type { Money } from "@/types/shopify";

export function formatMoney(money: Money): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: money.currencyCode === "BRL" ? "BRL" : money.currencyCode,
  }).format(amount);
}
