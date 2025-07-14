import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

type TaxBracket = {
  min: number;
  max: number | null;
  rate: number;
};

const PAYE_BRACKETS: TaxBracket[] = [
  { min: 0, max: 24000, rate: 0.1 },
  { min: 24001, max: 32333, rate: 0.25 },
  { min: 32334, max: 500000, rate: 0.3 },
  { min: 500001, max: 800000, rate: 0.325 },
  { min: 800001, max: null, rate: 0.35 },
];

const PERSONAL_RELIEF = 2400;
const SHIF_RATE = 0.0275;
const MIN_SHIF = 300;
const HOUSING_LEVY_RATE = 0.015;
const NSSF_TIER1_MAX = 8000;
const NSSF_TIER2_MAX = 72000;
const NSSF_RATE = 0.06;

export function TaxCalculator() {
  const [grossSalary, setGrossSalary] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);

  const calculateDeductions = (salary: number) => {
    // Calculate NSSF
    const nssfTier1 = Math.min(salary, NSSF_TIER1_MAX) * NSSF_RATE;
    const nssfTier2 = Math.max(0, Math.min(salary, NSSF_TIER2_MAX) - NSSF_TIER1_MAX) * NSSF_RATE;
    const totalNSSF = Math.min(nssfTier1 + nssfTier2, 4320);

    // Calculate PAYE
    const taxableIncome = salary - totalNSSF;
    let paye = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of PAYE_BRACKETS) {
      if (remainingIncome <= 0) break;
      
      const bracketAmount = bracket.max === null 
        ? remainingIncome 
        : Math.min(remainingIncome, bracket.max - bracket.min + 1);
      
      if (bracketAmount > 0) {
        paye += bracketAmount * bracket.rate;
        remainingIncome -= bracketAmount;
      }
    }

    // Apply personal relief
    const payeAfterRelief = Math.max(0, paye - PERSONAL_RELIEF);

    // Calculate SHIF (minimum Ksh 300)
    const shif = Math.max(MIN_SHIF, salary * SHIF_RATE);

    // Calculate Housing Levy
    const housingLevy = salary * HOUSING_LEVY_RATE;

    // Calculate total deductions and net pay
    const totalDeductions = payeAfterRelief + shif + housingLevy + totalNSSF;
    const netPay = salary - totalDeductions;

    return {
      nssf: totalNSSF,
      paye: payeAfterRelief,
      shif,
      housingLevy,
      totalDeductions,
      netPay,
      taxableIncome
    };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const results = calculateDeductions(grossSalary);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M5 12h14" />
            <path d="M4 6h16" />
            <path d="M4 18h16" />
          </svg>
          Tax Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Kenya Payroll Tax Calculator</DialogTitle>
          <DialogDescription>
            Calculate your net pay and deductions based on Kenyan tax regulations
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCalculate} className="flex-1 flex flex-col">
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grossSalary">Gross Monthly Salary (KES)</Label>
              <Input
                id="grossSalary"
                type="number"
                value={grossSalary || ''}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                placeholder="Enter your gross salary"
                className="text-base py-6 px-4"
                min="0"
                step="100"
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Calculate
          </Button>
          
          </div>
          
          {showResults && (
            <div className="mt-6 space-y-4 overflow-y-auto max-h-[50vh] pr-2">
              <h3 className="text-lg font-semibold">Results</h3>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Gross Salary</CardTitle>
                    <span className="text-xl font-bold">{formatCurrency(grossSalary)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">NSSF (6%)</span>
                    <span className="text-sm">{formatCurrency(results.nssf)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">PAYE</span>
                    <span className="text-sm">{formatCurrency(results.paye)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">SHIF (2.75%)</span>
                    <span className="text-sm">{formatCurrency(results.shif)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Housing Levy (1.5%)</span>
                    <span className="text-sm">{formatCurrency(results.housingLevy)}</span>
                  </div>
                  <div className="flex justify-between pt-2 font-semibold">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(results.totalDeductions)}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 rounded-b-lg">
                  <div className="flex justify-between w-full items-center">
                    <span className="font-semibold">Net Pay</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(results.netPay)}
                    </span>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">PAYE Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {PAYE_BRACKETS.map((bracket, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{
                            bracket.max 
                              ? `${formatCurrency(bracket.min)} - ${formatCurrency(bracket.max)}`
                              : `${formatCurrency(bracket.min)}+`
                          }</span>
                          <span className="font-medium">{bracket.rate * 100}%</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t">
                        <div className="flex justify-between">
                          <span>Personal Relief</span>
                          <span className="text-green-600">-{formatCurrency(PERSONAL_RELIEF)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Other Contributions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>NSSF (Tier I & II)</span>
                      <span>6% of first {formatCurrency(72000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Cap</span>
                      <span>{formatCurrency(4320)}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t">
                      <div className="flex justify-between">
                        <span>SHIF</span>
                        <span>2.75% of gross (min {formatCurrency(300)})</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Housing Levy</span>
                      <span>1.5% of gross</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
