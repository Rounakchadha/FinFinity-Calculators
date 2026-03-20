import type { LoanSaverInput, LoanSaverOutput } from './types'

function calculateMonthlyEmi(loanAmount: number, monthlyRate: number, tenureMonths: number): number {
  if (tenureMonths <= 0 || loanAmount <= 0) {
    return 0
  }

  if (monthlyRate === 0) {
    return loanAmount / tenureMonths
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths)

  if (!Number.isFinite(factor) || factor === 1) {
    return loanAmount / tenureMonths
  }

  return (loanAmount * monthlyRate * factor) / (factor - 1)
}

export function calculateLoanSaver(input: LoanSaverInput): LoanSaverOutput {
  const loanAmount = Number.isFinite(input.loanAmount) ? Math.max(0, input.loanAmount) : 0
  const currentInterestRatePercent = Number.isFinite(input.currentInterestRatePercent)
    ? input.currentInterestRatePercent
    : 0
  const newInterestRatePercent = Number.isFinite(input.newInterestRatePercent)
    ? input.newInterestRatePercent
    : 0
  const tenureMonths = Number.isFinite(input.tenureMonths) ? Math.max(0, Math.floor(input.tenureMonths)) : 0
  const processingFee = Number.isFinite(input.processingFee) ? Math.max(0, input.processingFee) : 0

  if (loanAmount === 0 || tenureMonths === 0) {
    return {
      currentEmi: 0,
      newEmi: 0,
      monthlySavings: 0,
      totalSavings: 0,
      currentTotalPayment: 0,
      newTotalPayment: processingFee,
    }
  }

  const currentRate = currentInterestRatePercent / 100 / 12
  const newRate = newInterestRatePercent / 100 / 12

  const currentEmi = calculateMonthlyEmi(loanAmount, currentRate, tenureMonths)
  const newEmi = calculateMonthlyEmi(loanAmount, newRate, tenureMonths)

  const monthlySavings = currentEmi - newEmi
  const currentTotalPayment = currentEmi * tenureMonths
  const newTotalPayment = newEmi * tenureMonths + processingFee
  const totalSavings = currentTotalPayment - newTotalPayment

  return {
    currentEmi,
    newEmi,
    monthlySavings,
    totalSavings,
    currentTotalPayment,
    newTotalPayment,
  }
}
