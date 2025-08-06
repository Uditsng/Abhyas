
'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function PerformanceChart({ testResults = [] }) {
  const chartData = testResults
    .filter(r => r.totalQuestions > 0)
    .map(r => ({
      name: r.title?.slice(0, 20) || 'Untitled',
      date: new Date(r.createdAt?.seconds * 1000).toLocaleDateString('en-US', {
  day: '2-digit',
  month: 'short',
}),
      scorePercent: Math.round((r.score / r.totalQuestions) * 100),
    }))
    .reverse();

  if (chartData.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">Not enough test data to show chart.</p>;
  }

  const data = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        label: 'Score (%)',
        data: chartData.map(item => item.scorePercent),
        fill: false,
        borderColor: '#3b82f6',
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: value => `${value}%`,
          color: '#6b7280', // Tailwind gray-500
        },
        grid: {
          color: '#e5e7eb', // Tailwind gray-200
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#374151', // gray-700
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.y}%`,
        },
      },
    },
  };

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Test Performance Over Time
      </h3>
      <div className="w-full h-[calc(100%-2rem)]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
