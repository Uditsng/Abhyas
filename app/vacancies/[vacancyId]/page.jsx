// app/vacancies/[vacancyId]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getVacancyById } from "../../../lib/vacancyService";
import Link from "next/link";

export default function VacancyDetailPage() {
  const params = useParams();
  const vacancyId = params.vacancyId;

  const [vacancy, setVacancy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (vacancyId) {
      const fetchVacancy = async () => {
        const data = await getVacancyById(vacancyId);
        setVacancy(data);
        setIsLoading(false);
      };
      fetchVacancy();
    }
  }, [vacancyId]);

  if (isLoading)
    return <div className="p-8 text-center">Loading details...</div>;
  if (!vacancy)
    return <div className="p-8 text-center">Vacancy not found.</div>;

  return (
    <div className="p-4 pt-24 md:p-8 md:pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">
            {vacancy.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {vacancy.organization} Recruitment 2025
          </p>
        </div>

        {/* Important Dates */}
        <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg mb-6">
          <h2 className="font-bold text-xl mb-4 text-center">
            Important Dates
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="font-semibold italic underline">
                Application Begin
              </p>
              <p className="text-green-600 dark:text-green-300">
                {vacancy.postDate}
              </p>
            </div>
            <div>
              <p className="font-semibold italic underline">
                Last Date to Apply
              </p>
              <p className="text-red-600">{vacancy.lastDateToApply}</p>
            </div>
            <div>
              <p className="font-semibold italic underline">Exam Date</p>
              <p>{vacancy.examDate}</p>
            </div>
            <div>
              <p className="font-semibold italic underline">Admit Card</p>
              <p>{vacancy.admitCardDate}</p>
            </div>
          </div>
        </div>

        {/* Application Fee */}
        <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg mb-6">
          <h2 className="font-bold text-xl mb-4 text-center">
            Application Fee
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-semibold italic underline">
                General / OBC / EWS
              </p>
              <p className="text-yellow-600 dark:text-yellow-300">
                ₹ {vacancy.applicationFeeGeneral}
              </p>
            </div>
            <div>
              <p className="font-semibold italic underline">SC / ST / PH</p>
              <p className="text-yellow-600 dark:text-yellow-300">
                ₹ {vacancy.applicationFeeReserved}
              </p>
            </div>
          </div>
        </div>

        {/* Vacancy Details */}
        <div className="mb-6">
          <h2 className="font-bold text-xl mb-4 text-center">
            Vacancy Details (Total: {vacancy.totalPosts} Posts)
          </h2>
          <p className="text-center mb-4">
            <strong>Age Limit:</strong> {vacancy.ageLimit}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="p-2 border">Post Name</th>
                  <th className="p-2 border">Eligibility</th>
                  <th className="p-2 border">Total Posts</th>
                  <th className="p-2 border">Links</th>
                </tr>
              </thead>
              <tbody>
                {vacancy.vacancyDetails.map((detail, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{detail.postName}</td>
                    <td className="p-2 border">{detail.eligibility}</td>
                    <td className="p-2 border">{detail.totalPosts}</td>
                    <td className="p-2 border  whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {detail.links ? (
                        <a
                          href={detail.links}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Link
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Apply */}
        {vacancy.howToApply && (
          <div className="mb-6">
            <h2 className="font-bold text-xl mb-4 text-center">How to Apply</h2>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
              {vacancy.howToApply}
            </div>
          </div>
        )}

        {/* Important Links */}
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <h2 className="font-bold text-xl mb-4">Important Links</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {vacancy.importantLinks?.map((link, index) => (
              <Link
                key={index}
                href={link.url || "#"}
                target="_blank"
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
