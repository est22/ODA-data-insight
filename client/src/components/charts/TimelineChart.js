import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function TimelineChart({ data, title }) {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map(d => d.year),
    datasets: [{
      label: 'investment (million USD)',
      data: data.map(d => d.investment_million_usd),
      borderColor: '#2196f3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      tension: 0.1,
      fill: true
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>{title}</h2>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default TimelineChart; 