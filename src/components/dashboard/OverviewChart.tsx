import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OverviewChartProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function OverviewChart({ className, ...props }: OverviewChartProps) {
  const labels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Organizations',
        data: [12, 15, 18, 16, 20, 22, 24, 26, 28, 26, 24, 24],
        borderColor: 'hsl(221.2 83.2% 53.3%)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Active Users',
        data: [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1250, 1234],
        borderColor: 'hsl(142.1 76.2% 36.3%)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'API Requests (K)',
        data: [200, 300, 400, 350, 500, 600, 700, 800, 750, 850, 900, 950],
        borderColor: 'hsl(262.1 83.3% 57.8%)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <Line data={data} options={options} />
    </div>
  );
}
