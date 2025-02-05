import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function SDGContributionChart({ data }) {
  const chartData = {
    labels: data?.map(d => `SDG ${d.sdg_focus}`) || [],
    datasets: [
      {
        data: data?.map(d => d.total_investment_million) || [],
        backgroundColor: [
          '#E5243B', '#DDA63A', '#4C9F38', '#C5192D',
          '#FF3A21', '#26BDE2', '#FCC30B', '#A21942',
          '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
          '#3F7E44', '#0A97D9', '#56C02B', '#00689D',
          '#19486A'
        ]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'SDG focus investment share'
      }
    }
  };

  return (
    <div className="chart-container">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export default SDGContributionChart; 