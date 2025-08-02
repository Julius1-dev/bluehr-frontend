// Payroll calculation utility functions

// Calculate PAYE based on the provided tax bands
export const calculatePAYE = (grossSalary: number, nssfContribution: number): number => {
  // Taxable income is gross salary minus NSSF
  const taxableIncome = grossSalary - nssfContribution;
  
  let tax = 0;
  
  // Apply tax bands
  if (taxableIncome <= 24000) {
    tax = taxableIncome * 0.1;
  } else if (taxableIncome <= 32333) {
    tax = 24000 * 0.1 + (taxableIncome - 24000) * 0.25;
  } else if (taxableIncome <= 500000) {
    tax = 24000 * 0.1 + (32333 - 24000) * 0.25 + (taxableIncome - 32333) * 0.3;
  } else if (taxableIncome <= 800000) {
    tax = 24000 * 0.1 + (32333 - 24000) * 0.25 + (500000 - 32333) * 0.3 + (taxableIncome - 500000) * 0.325;
  } else {
    tax = 24000 * 0.1 + (32333 - 24000) * 0.25 + (500000 - 32333) * 0.3 + (800000 - 500000) * 0.325 + (taxableIncome - 800000) * 0.35;
  }
  
  // Apply personal relief (2,400 per month)
  const personalRelief = 2400;
  tax = Math.max(0, tax - personalRelief);
  
  return Math.round(tax);
};

// Calculate SHIF (Social Health Insurance Fund)
export const calculateSHIF = (grossSalary: number): number => {
  // 2.75% of gross salary, minimum 300
  return Math.max(300, grossSalary * 0.0275);
};

// Calculate Housing Levy
export const calculateHousingLevy = (grossSalary: number): number => {
  // 1.5% of gross salary
  return grossSalary * 0.015;
};

// Calculate NSSF (National Social Security Fund)
export const calculateNSSF = (grossSalary: number): number => {
  // Tier I: 6% of first 8,000
  const tier1 = Math.min(8000, grossSalary) * 0.06;
  
  // Tier II: 6% of next 64,000 (up to 72,000)
  const tier2Amount = Math.max(0, Math.min(72000, grossSalary) - 8000);
  const tier2 = tier2Amount * 0.06;
  
  // Maximum contribution is 4,320
  return Math.min(4320, tier1 + tier2);
};

// Calculate total statutory deductions
export const calculateTotalStatutoryDeductions = (grossSalary: number): number => {
  const nssfContribution = calculateNSSF(grossSalary);
  const shif = calculateSHIF(grossSalary);
  const housingLevy = calculateHousingLevy(grossSalary);
  const paye = calculatePAYE(grossSalary, nssfContribution);
  
  return paye + shif + nssfContribution + housingLevy;
};

// Calculate net pay
export const calculateNetPay = (grossSalary: number, customDeductions: number = 0): number => {
  const statutoryDeductions = calculateTotalStatutoryDeductions(grossSalary);
  return grossSalary - statutoryDeductions - customDeductions;
};
