import { useState, useEffect } from 'react';
import SummaryCards from '../components/SummaryCards';
import TimelineChart from '../components/charts/TimelineChart';
import StrategicGoalsChart from '../components/charts/StrategicGoalsChart';
import TopRecipientsTable from '../components/tables/TopRecipientsTable';
import SDGContributionChart from '../components/charts/SDGContributionChart';

function Dashboard() {
  const [techInvestment, setTechInvestment] = useState(null);
  const [sdgPerformance, setSDGPerformance] = useState(null);
  const [strategicGoals, setStrategicGoals] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const fetchWithErrorHandling = async (url) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log(`Data from ${url}:`, data); // 디버깅용
          return data;
        };

        const [techData, sdgData, goalsData, timelineData] = await Promise.all([
          fetchWithErrorHandling('http://localhost:8000/tech-investment-impact'),
          fetchWithErrorHandling('http://localhost:8000/sdg-performance'),
          fetchWithErrorHandling('http://localhost:8000/strategic-goals'),
          fetchWithErrorHandling('http://localhost:8000/performance-timeline')
        ]);

        console.log('Tech Data:', techData); // debugging
        setTechInvestment(techData);
        setSDGPerformance(sdgData);
        setStrategicGoals(goalsData);
        setTimeline(timelineData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // add error status
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading">
        <h2>fetching data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error occurred</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  }

  if (isLoading || !techInvestment?.summary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>KOICA Tech Innovation ODA Performance Dashboard</h1>
      
      {techInvestment?.summary && (
        <SummaryCards data={techInvestment.summary} />
      )}

      <div className="main-charts">
        {timeline && (
          <TimelineChart 
            data={timeline} 
            title="Yearly Tech Innovation ODA Investment Trend"
          />
        )}
        {strategicGoals && (
          <StrategicGoalsChart 
            data={strategicGoals}
            title="Strategic Goals Project Status"
          />
        )}
      </div>

      <div className="detail-analysis">
        {techInvestment?.summary?.top_recipients && (
          <TopRecipientsTable data={techInvestment.summary.top_recipients} />
        )}
        {sdgPerformance && (
          <SDGContributionChart data={sdgPerformance} />
        )}
      </div>
    </div>
  );
}

export default Dashboard; 