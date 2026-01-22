import React, { useState } from 'react';

export default function AdminDashboard() {
  const [chartUrl, setChartUrl] = useState(null);

  const refreshAnalytics = async () => {
    const res = await fetch("http://localhost:8000/api/analytics/refresh");
    const data = await res.json();
    setChartUrl(data.chart_url);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10 text-slate-900">
      <h1 className="text-3xl font-bold mb-6">Business Intelligence Dashboard</h1>
      <p className="mb-4">Analysis of Team Decision Efficiency vs. Performance.</p>
      
      <button 
        onClick={refreshAnalytics}
        className="bg-indigo-600 text-white px-4 py-2 rounded shadow mb-8">
        Generate New Report (Python/Pandas)
      </button>

      {chartUrl ? (
        <div className="bg-white p-4 shadow-lg rounded-xl inline-block">
          <img src={chartUrl} alt="Analytics Chart" className="max-w-2xl" />
        </div>
      ) : (
        <div className="text-gray-500">No data generated yet. Play a game first!</div>
      )}
    </div>
  );
}