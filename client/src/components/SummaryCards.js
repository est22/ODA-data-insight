function SummaryCards({ data }) {
  if (!data) return null;

  return (
    <div className="summary-cards">
      <div className="card">
        <h3>total projects</h3>
        <p>{data.total_projects || 0}개</p>
      </div>
      <div className="card">
        <h3>total investment</h3>
        <p>${Math.round((data.total_investment || 0) / 1000000)}M</p>
      </div>
      <div className="card">
        <h3>recipient countries</h3>
        <p>{data.top_recipients?.length || 0} countries</p>
      </div>
    </div>
  );
}

export default SummaryCards; 