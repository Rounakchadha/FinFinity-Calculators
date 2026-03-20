import type {
  StepUpSipInput,
  StepUpSipOutput,
  StepUpSipScheduleRow,
} from './types'

export function calculateStepUpSip(input: StepUpSipInput): StepUpSipOutput {
  const monthlyInvestment = Number.isFinite(input.monthlyInvestment)
    ? Math.max(0, input.monthlyInvestment)
    : 0
  const annualStepUpPercent = Number.isFinite(input.annualStepUpPercent)
    ? input.annualStepUpPercent
    : 0
  const expectedAnnualReturnPercent = Number.isFinite(input.expectedAnnualReturnPercent)
    ? input.expectedAnnualReturnPercent
    : 0
  const months = Number.isFinite(input.years) ? Math.max(0, Math.floor(input.years * 12)) : 0

  const annualStepUpRate = annualStepUpPercent / 100
  const effectiveAnnualReturn = expectedAnnualReturnPercent / 100

  const nominalAnnualRate =
    12 * (Math.pow(1 + effectiveAnnualReturn, 1 / 12) - 1)
  const monthlyRate = nominalAnnualRate / 12

  if (months === 0 || monthlyInvestment === 0) {
    return {
      investedAmount: 0,
      futureValue: 0,
      wealthGained: 0,
      nominalAnnualRate,
      schedule: [],
    }
  }

  let openingBalance = 0
  let investedAmount = 0
  const schedule: StepUpSipScheduleRow[] = []

  for (let month = 1; month <= months; month += 1) {
    const currentInvestment =
      monthlyInvestment *
      Math.pow(1 + annualStepUpRate, Math.floor((month - 1) / 12))

    const interest = (openingBalance + currentInvestment) * monthlyRate
    const closingBalance = openingBalance + currentInvestment + interest

    schedule.push({
      month,
      openingBalance,
      investment: currentInvestment,
      interest,
      closingBalance,
    })

    investedAmount += currentInvestment
    openingBalance = closingBalance
  }

  const futureValue = schedule.length > 0 ? schedule[schedule.length - 1].closingBalance : 0

  return {
    investedAmount,
    futureValue,
    wealthGained: futureValue - investedAmount,
    nominalAnnualRate,
    schedule,
  }
}
