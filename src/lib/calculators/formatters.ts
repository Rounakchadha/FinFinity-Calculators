const inrCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatCurrencyINR(value: number): string {
  if (!Number.isFinite(value)) {
    return '₹0'
  }

  return inrCurrencyFormatter.format(Math.round(value))
}
