export function validateRequiredNumber(value: number): string | null {
  if (Number.isNaN(value)) {
    return 'Value is required.'
  }

  if (!Number.isFinite(value)) {
    return 'Value must be a valid number.'
  }

  return null
}

export function validateGreaterThan(value: number, minExclusive: number): string | null {
  if (value <= minExclusive) {
    return `Value must be greater than ${minExclusive}.`
  }

  return null
}
