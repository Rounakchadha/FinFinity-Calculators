export type TabType = 'EMI' | 'SIP' | 'Loan Saver' | 'My 1st Crore';

export interface SliderConfig {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  isCurrency?: boolean;
}

export interface ResultConfig {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ChartSegment {
  name: string;
  value: number;
}

export interface CalculatorConfig {
  title: string;
  sliders: SliderConfig[];
  results: ResultConfig[];
  chart: ChartSegment[];
}

export const CALCULATOR_DATA: Record<TabType, CalculatorConfig> = {
  EMI: {
    title: "Calculate Loan EMI",
    sliders: [
      { label: "Loan Amount", min: 100000, max: 50000000, step: 100000, defaultValue: 3500000, unit: "₹", isCurrency: true },
      { label: "Interest Rate", min: 5, max: 20, step: 0.25, defaultValue: 9.25, unit: "%" },
      { label: "Loan Tenure", min: 1, max: 30, step: 1, defaultValue: 20, unit: "yrs" },
    ],
    results: [
      { label: "Loan EMI", value: "₹32,065" },
      { label: "Total Interest", value: "₹41,95,511" },
      { label: "Total Payment", value: "₹76,95,511", highlight: true },
    ],
    chart: [
      { name: "Principal", value: 3500000 },
      { name: "Total Interest", value: 4195511 },
    ],
  },
  SIP: {
    title: "Calculate Step-Up SIP",
    sliders: [
      { label: "Monthly Investment", min: 500, max: 500000, step: 500, defaultValue: 5000, unit: "₹", isCurrency: true },
      { label: "Annual Step-Up", min: 1, max: 25, step: 1, defaultValue: 10, unit: "%" },
      { label: "Expected Annual Return", min: 1, max: 30, step: 0.5, defaultValue: 12, unit: "%" },
      { label: "Time Period", min: 1, max: 40, step: 1, defaultValue: 20, unit: "yrs" },
    ],
    results: [
      { label: "Future Value", value: "₹49,42,185" },
      { label: "Invested Amount", value: "₹12,00,000" },
      { label: "Wealth Gained", value: "₹37,42,185", highlight: true },
    ],
    chart: [
      { name: "Invested Amount", value: 1200000 },
      { name: "Wealth Gained", value: 3742185 },
    ],
  },
  "Loan Saver": {
    title: "Loan Saver Calculator",
    sliders: [
      { label: "Loan Amount", min: 1000000, max: 200000000, step: 250000, defaultValue: 25000000, unit: "₹", isCurrency: true },
      { label: "Current Interest Rate", min: 5, max: 15, step: 0.1, defaultValue: 8.0, unit: "%" },
      { label: "Loan Tenure", min: 1, max: 30, step: 0.5, defaultValue: 20, unit: "yrs" },
      { label: "Transfer Interest Rate", min: 5, max: 15, step: 0.1, defaultValue: 7.0, unit: "%" },
      { label: "Processing Fee", min: 0, max: 1000000, step: 10000, defaultValue: 50000, unit: "₹", isCurrency: true },
    ],
    results: [
      { label: "Current EMI", value: "₹2,09,110" },
      { label: "New EMI", value: "₹1,93,825" },
      { label: "Monthly Savings", value: "₹15,285", highlight: true },
    ],
    chart: [
      { name: "Current Payment", value: 209110 },
      { name: "New Payment", value: 193825 },
    ],
  },
  "My 1st Crore": {
    title: "My 1st Crore Calculator",
    sliders: [
      { label: "Monthly Investment", min: 1000, max: 1000000, step: 1000, defaultValue: 10000, unit: "₹", isCurrency: true },
      { label: "Target Amount", min: 10000000, max: 1000000000, step: 5000000, defaultValue: 10000000, unit: "₹", isCurrency: true },
      { label: "Expected Annual Return", min: 1, max: 30, step: 0.5, defaultValue: 12, unit: "%" },
    ],
    results: [
      { label: "Time Period", value: "18.5 yrs" },
      { label: "Invested Amount", value: "₹22,20,000" },
      { label: "Wealth Gained", value: "₹77,80,000", highlight: true },
    ],
    chart: [
      { name: "Invested Amount", value: 2220000 },
      { name: "Wealth Gained", value: 7780000 },
    ],
  },
};
