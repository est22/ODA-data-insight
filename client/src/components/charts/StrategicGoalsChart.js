import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StrategicGoalsChart({ data, title }) {
  const chartData = {
    labels: data?.map(d => d.strategic_goal) || [],
    datasets: [
      {
        label: 'project count',
        data: data?.map(d => d.project_count) || [],
        backgroundColor: '#2196f3',
      },
      {
        label: 'execution rate (%)',
        data: data?.map(d => d.execution_rate) || [],
        backgroundColor: '#4caf50',
      }
    ]
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
    }
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default StrategicGoalsChart; 