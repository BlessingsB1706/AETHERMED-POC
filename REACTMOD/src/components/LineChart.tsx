import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTheme } from '../lib/theme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

export interface Series {
  label: string;
  data: number[];
  color: string;
  dashed?: boolean;
}

function useChartColors() {
  const dark = useTheme().theme === 'dark';
  return { grid: dark ? '#1f2a40' : '#f1f5f9', tick: dark ? '#94a3b8' : '#64748b', border: dark ? '#111a2e' : '#ffffff' };
}

function useBaseOptions() {
  const c = useChartColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { intersect: false, mode: 'index' as const },
    scales: {
      y: { grid: { color: c.grid }, ticks: { color: c.tick }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: c.tick }, border: { display: false } },
    },
  };
}

export function LineChart({ labels, series, label, height = 'h-64' }: { labels: string[]; series: Series[]; label: string; height?: string }) {
  const base = useBaseOptions();
  const { tick } = useChartColors();
  return (
    <div className={`relative w-full ${height}`} role="img" aria-label={label}>
      <Line
        options={{ ...base, plugins: { legend: { display: series.length > 1, position: 'top', align: 'end', labels: { color: tick, usePointStyle: true, boxWidth: 8 } } } }}
        data={{
          labels,
          datasets: series.map((s, i) => ({
            label: s.label,
            data: s.data,
            borderColor: s.color,
            backgroundColor: `${s.color}22`,
            borderWidth: 3,
            pointRadius: labels.length > 12 ? 0 : 3,
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
  const base = useBaseOptions();
  return (
    <div className="relative h-64 w-full" role="img" aria-label={label}>
      <Bar options={{ ...base, plugins: { legend: { display: false } } }} data={{ labels, datasets: [{ label, data, backgroundColor: '#3b82f6', borderRadius: 6 }] }} />
    </div>
  );
}

export function DoughnutChart({ labels, data, colors, label }: { labels: string[]; data: number[]; colors: string[]; label: string }) {
  const { border } = useChartColors();
  return (
    <div className="relative mx-auto h-48 w-48" role="img" aria-label={label}>
      <Doughnut
        options={{ responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false } } }}
        data={{ labels, datasets: [{ data, backgroundColor: colors, borderColor: border, borderWidth: 3 }] }}
      />
    </div>
  );
}
