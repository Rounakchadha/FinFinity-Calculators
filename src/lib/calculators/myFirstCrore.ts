import type { FirstCroreInput, FirstCroreOutput } from './types'

export function calculateFirstCrore(input: FirstCroreInput): FirstCroreOutput {
  const monthlyInvestment = Number.isFinite(input.monthlyInvestment)
    ? Math.max(0, input.monthlyInvestment)
    : 0
  const annualReturnPercent = Number.isFinite(input.annualReturnPercent)
    ? input.annualReturnPercent
    : 0
  const targetAmount = Number.isFinite(input.targetAmount)
    ? Math.max(0, input.targetAmount ?? 10000000)
    : 10000000

  const effectiveAnnualReturn = annualReturnPercent / 100
  const nominalAnnualRate =
    12 * (Math.pow(1 + effectiveAnnualReturn, 1 / 12) - 1)
  const monthlyRate = nominalAnnualRate / 12

  if (targetAmount === 0) {
    return {
      monthsToTarget: 0,
      yearsToTarget: 0,
      totalInvested: 0,
      wealthGained: 0,
      nominalAnnualRate,
    }
  }

  if (monthlyInvestment <= 0) {
    return {
      monthsToTarget: 0,
      yearsToTarget: 0,
      totalInvested: 0,
      wealthGained: 0,
      nominalAnnualRate,
    }
  }

  const monthsToTarget =
    monthlyRate === 0
      ? targetAmount / monthlyInvestment
      : Math.log((targetAmount * monthlyRate) / monthlyInvestment + 1) /
        Math.log(1 + monthlyRate)

  const safeMonths = Number.isFinite(monthsToTarget) && monthsToTarget > 0 ? monthsToTarget : 0
  const yearsToTarget = safeMonths / 12
  const totalInvested = monthlyInvestment * Math.ceil(safeMonths)
  const wealthGained = targetAmount - totalInvested

  return {
    monthsToTarget: safeMonths,
    yearsToTarget,
    totalInvested,
    wealthGained,
    nominalAnnualRate,
  }
}

export { calculateFirstCrore as calculateMyFirstCrore }
