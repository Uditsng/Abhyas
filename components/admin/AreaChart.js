//AreaChart
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
  Filler
} from 'chart.js';

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

export default function AreaChart({ data, options }) {
  const mergedOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    elements: {
      line: { tension: 0.4 }, // Smooth curves (spline)
      point: { radius: 3 }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: {stepSize:1} }
    },
    ...options,
  };
  return <Line data={data} options={mergedOptions} />;
}