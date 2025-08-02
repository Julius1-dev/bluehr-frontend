import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardsProps {
  totalAdvances: number;
  totalFees: number;
  activeCompanies: number;
  outstandingBalance: number;
}

export function SummaryCards({
  totalAdvances,
  totalFees,
  activeCompanies,
  outstandingBalance,
}: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Advances',
      value: totalAdvances,
      icon: DollarSign,
      description: 'Across all companies',
    },
    {
      title: 'Fees Generated',
      value: totalFees,
      icon: TrendingUp,
      description: 'From all transactions',
    },
    {
      title: 'Active Companies',
      value: activeCompanies,
      icon: Users,
      description: 'Using advance features',
    },
    {
      title: 'Outstanding Balance',
      value: outstandingBalance,
      icon: AlertCircle,
      description: 'Across all companies',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof card.value === 'number' 
                ? `KSh ${card.value.toLocaleString()}` 
                : card.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
