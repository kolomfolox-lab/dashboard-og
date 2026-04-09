import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255,255,255,0.72)',
      },
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.42)' },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.42)' },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
  },
};

export function LineChartBlock({ data }: { data: any }) {
  return <Line data={data} options={baseOptions} />;
}

export function BarChartBlock({ data, stacked = false }: { data: any; stacked?: boolean }) {
  return <Bar data={data} options={{ ...baseOptions, scales: { ...baseOptions.scales, x: { ...baseOptions.scales.x, stacked }, y: { ...baseOptions.scales.y, stacked } } }} />;
}

export function DoughnutChartBlock({ data }: { data: any }) {
  return (
    <Doughnut
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255,255,255,0.72)',
              padding: 18,
            },
          },
        },
      }}
    />
  );
}
