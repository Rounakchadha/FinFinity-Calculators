export type AmortizationRow = {
  month: number
  openingBalance: number
  interest: number
  principal: number
  emi: number
  closingBalance: number
}

export type EmiInput = {
  loanAmount: number
  annualInterestRatePercent: number
  tenureMonths: number
}

export type EmiOutput = {
  emi: number
  totalInterest: number
  totalPayment: number
  schedule: AmortizationRow[]
}

export type StepUpSipScheduleRow = {
  month: number
  openingBalance: number
  investment: number
  interest: number
  closingBalance: number
}

export type StepUpSipInput = {
  monthlyInvestment: number
  annualStepUpPercent: number
  expectedAnnualReturnPercent: number
  years: number
}

export type StepUpSipOutput = {
  investedAmount: number
  futureValue: number
  wealthGained: number
  nominalAnnualRate: number
  schedule: StepUpSipScheduleRow[]
}

export type LoanSaverInput = {
  loanAmount: number
  currentInterestRatePercent: number
  newInterestRatePercent: number
  tenureMonths: number
  processingFee: number
}

export type LoanSaverOutput = {
  currentEmi: number
  newEmi: number
  monthlySavings: number
  totalSavings: number
  currentTotalPayment: number
  newTotalPayment: number
}

export type FirstCroreInput = {
  monthlyInvestment: number
  annualReturnPercent: number
  targetAmount?: number
}

export type FirstCroreOutput = {
  monthsToTarget: number
  yearsToTarget: number
  totalInvested: number
  wealthGained: number
  nominalAnnualRate: number
}
