// components/VacancyAlerts.jsx
'use client';

import { useState, useEffect } from 'react';
import { getVacancies } from '../lib/vacancyService';
import Link from 'next/link';

export default function VacancyAlerts() {
  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVacancies = async () => {
      const data = await getVacancies();
      setVacancies(data.slice(0, 10)); 
      setIsLoading(false);
    };
    fetchVacancies();
  }, []);

  if (isLoading) {
    return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"><p>Loading latest jobs...</p></div>;
  }

  if (vacancies.length === 0) {
    return null; 
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-12">
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Latest Vacancies & Exam Notifications</h3>
      <ul className="space-y-3">
        {vacancies.map(vacancy => (
          <li key={vacancy.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors">
            <Link href={`/vacancies/${vacancy.id}`} className="block">
              <p className="font-semibold text-blue-700 dark:text-blue-400">{vacancy.title}</p>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>{vacancy.organization}</span>
                <span className="font-medium text-red-500">Last Date: {vacancy.lastDateToApply}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}