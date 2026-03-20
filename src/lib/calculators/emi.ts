import type { AmortizationRow, EmiInput, EmiOutput } from './types'

export function calculateEmi(input: EmiInput): EmiOutput {
  const loanAmount = Number.isFinite(input.loanAmount) ? Math.max(0, input.loanAmount) : 0
  const tenureMonths = Number.isFinite(input.tenureMonths) ? Math.max(0, Math.floor(input.tenureMonths)) : 0
  const annualRate = Number.isFinite(input.annualInterestRatePercent)
    ? input.annualInterestRatePercent
    : 0

  if (loanAmount === 0 || tenureMonths === 0) {
    return {
      emi: 0,
      totalInterest: 0,
      totalPayment: 0,
      schedule: [],
    }
  }

  const monthlyRate = annualRate / 100 / 12
  const emi =
    monthlyRate === 0
      ? loanAmount / tenureMonths
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)

  let openingBalance = loanAmount
  const schedule: AmortizationRow[] = []

  for (let month = 1; month <= tenureMonths; month += 1) {
    const interest = openingBalance * monthlyRate
    let principal = emi - interest
    let currentEmi = emi
    let closingBalance = openingBalance - principal

    if (month === tenureMonths || closingBalance < 0) {
      principal = openingBalance
      currentEmi = principal + interest
      closingBalance = 0
    }

    schedule.push({
      month,
      openingBalance,
      interest,
      principal,
      emi: currentEmi,
      closingBalance,
    })

    openingBalance = closingBalance
  }

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0)
  const totalPayment = schedule.reduce((sum, row) => sum + row.emi, 0)

  return {
    emi,
    totalInterest,
    totalPayment,
    schedule,
  }
}
