import type { StepUpSipOutput, StepUpSipScheduleRow } from './types'

type NormalSipInput = {
  monthlyInvestment: number
  expectedAnnualReturnPercent: number
  years: number
}

type LumpsumInput = {
  investmentAmount: number
  expectedAnnualReturnPercent: number
  years: number
}

function getNominalAnnualRate(expectedAnnualReturnPercent: number): number {
  const effectiveAnnualReturn = expectedAnnualReturnPercent / 100
  return 12 * (Math.pow(1 + effectiveAnnualReturn, 1 / 12) - 1)
}

export function calculateNormalSip(input: NormalSipInput): StepUpSipOutput {
  const monthlyInvestment = Number.isFinite(input.monthlyInvestment)
    ? Math.max(0, input.monthlyInvestment)
    : 0
  const expectedAnnualReturnPercent = Number.isFinite(input.expectedAnnualReturnPercent)
    ? input.expectedAnnualReturnPercent
    : 0
  const months = Number.isFinite(input.years) ? Math.max(0, Math.floor(input.years * 12)) : 0

  const nominalAnnualRate = getNominalAnnualRate(expectedAnnualReturnPercent)
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
    const investment = monthlyInvestment
    const interest = (openingBalance + investment) * monthlyRate
    const closingBalance = openingBalance + investment + interest

    schedule.push({
      month,
      openingBalance,
      investment,
      interest,
      closingBalance,
    })

    investedAmount += investment
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

export function calculateLumpsum(input: LumpsumInput): StepUpSipOutput {
  const investmentAmount = Number.isFinite(input.investmentAmount)
    ? Math.max(0, input.investmentAmount)
    : 0
  const expectedAnnualReturnPercent = Number.isFinite(input.expectedAnnualReturnPercent)
    ? input.expectedAnnualReturnPercent
    : 0
  const months = Number.isFinite(input.years) ? Math.max(0, Math.floor(input.years * 12)) : 0

  const nominalAnnualRate = getNominalAnnualRate(expectedAnnualReturnPercent)
  const monthlyRate = nominalAnnualRate / 12

  if (months === 0 || investmentAmount === 0) {
    return {
      investedAmount: 0,
      futureValue: 0,
      wealthGained: 0,
      nominalAnnualRate,
      schedule: [],
    }
  }

  let openingBalance = 0
  const schedule: StepUpSipScheduleRow[] = []

  for (let month = 1; month <= months; month += 1) {
    const investment = month === 1 ? investmentAmount : 0
    const interest = (openingBalance + investment) * monthlyRate
    const closingBalance = openingBalance + investment + interest

    schedule.push({
      month,
      openingBalance,
      investment,
      interest,
      closingBalance,
    })

    openingBalance = closingBalance
  }

  const futureValue = schedule[schedule.length - 1].closingBalance

  return {
    investedAmount: investmentAmount,
    futureValue,
    wealthGained: futureValue - investmentAmount,
    nominalAnnualRate,
    schedule,
  }
}
