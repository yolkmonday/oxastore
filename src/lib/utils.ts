export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
