import { Line } from 'react-chartjs-2';

function TimelineChart({ data, title }) {
  const chartData = {
    labels: data.map(d => d.year),
    datasets: [{
      label: 'investment (million USD)',
      data: data.map(d => d.investment_million_usd),
      borderColor: '#2196f3',
      tension: 0.1
    }]
  };

  return (
    <div className="chart-container">
      <h2>{title}</h2>
      <Line data={chartData} />
    </div>
  );
}

export default TimelineChart; 