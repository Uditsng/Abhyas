import { useMemo } from 'react';

export default function useUserDashboardStats(testResults = []) {
  return useMemo(() => {
    if (!Array.isArray(testResults) || testResults.length === 0) {
      return {
        testsTaken: 0,
        avgScore: 0,
        bestScore: 0,
        totalStudyTime: 0,
      };
    }

    let totalScore = 0;
    let totalQuestions = 0;
    let bestScore = 0;
    let totalTimeTaken = 0;

    testResults.forEach(result => {
      const { score = 0, totalQuestions: tq = 0, timeTaken = 0 } = result;

      totalScore += score;
      totalQuestions += tq;
      totalTimeTaken += timeTaken;

      if (tq > 0) {
        const percent = (score / tq) * 100;
        if (percent > bestScore) bestScore = percent;
      }
    });

    const avgScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    const totalStudyTime = Math.round(totalTimeTaken / 3600); // convert seconds → hours

    return {
      testsTaken: testResults.length,
      avgScore: Math.round(avgScore),
      bestScore: Math.round(bestScore),
      totalStudyTime,
    };
  }, [testResults]);
}
