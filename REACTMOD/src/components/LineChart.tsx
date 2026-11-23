import { CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip, BarElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

export interface Series {
  label: string;
  data: number[];
  color: string;
  dashed?: boolean;
}

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' as const },
  scales: {
    y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
    x: { grid: { display: false }, ticks: { color: '#64748b' } },
  },
};

export function LineChart({ labels, series, label }: { labels: string[]; series: Series[]; label: string }) {
  return (
    <div className="relative h-64 w-full" role="img" aria-label={label}>
      <Line
        options={{ ...baseOptions, plugins: { legend: { display: series.length > 1, position: 'top', align: 'end' } } }}
        data={{
          labels,
          datasets: series.map((s, i) => ({
            label: s.label,
            data: s.data,
            borderColor: s.color,
            backgroundColor: `${s.color}1a`,
            borderWidth: 3,
            borderDash: s.dashed ? [5, 5] : undefined,
            fill: i === 0,
            tension: 0.4,
          })),
        }}
      />
    </div>
  );
}

export function BarChart({ labels, data, label }: { labels: string[]; data: number[]; label: string }) {
  return (
    <div className="relative h-64 w-full" role="img" aria-label={label}>
      <Bar
        options={{ ...baseOptions, plugins: { legend: { display: false } } }}
        data={{ labels, datasets: [{ label, data, backgroundColor: '#3b82f6', borderRadius: 6 }] }}
      />
    </div>
  );
}
