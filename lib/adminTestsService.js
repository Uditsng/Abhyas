// FILE: lib/adminTestsService.js
import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';

// Fetch all tests from 'tests' collection, filtered by createdBy
export const getAllTests = async (createdBy = null, sortBy = 'createdAt', sortOrder = 'desc') => {
  const testsCol = collection(db, 'tests');

  let q = query(testsCol);

  if (createdBy) {
    q = query(q, where('createdBy', '==', createdBy));
  }

  if (sortBy) {
    q = query(q, orderBy(sortBy, sortOrder));
  }

  const snapshot = await getDocs(q);
  let tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return tests;
};

// Fetch full details of a specific test, including its questions subcollection
export const getTestDetails = async (testId) => {
  const testRef = doc(db, 'tests', testId);
  const testDoc = await getDoc(testRef);

  if (!testDoc.exists()) return null;

  const questionsCol = collection(db, 'tests', testId, 'questions');
  const questionsSnapshot = await getDocs(questionsCol);
  const questionsList = questionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    id: testDoc.id,
    ...testDoc.data(),
    questions: questionsList,
  };
};

// Get multiple tests by an array of IDs (with question counts)
export const getTestsByIds = async (testIds = []) => {
  try {
    if (!testIds || testIds.length === 0) return [];

    const tests = [];
    const chunkSize = 10; // Firestore limit

    for (let i = 0; i < testIds.length; i += chunkSize) {
      const chunk = testIds.slice(i, i + chunkSize);
      const q = query(collection(db, 'tests'), where('__name__', 'in', chunk));
      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {
        // Optionally fetch questions count
        const questionsCol = collection(db, 'tests', docSnap.id, 'questions');
        const questionsSnapshot = await getDocs(questionsCol);

        tests.push({
          id: docSnap.id,
          ...docSnap.data(),
          questions: questionsSnapshot.docs.map(qd => ({ id: qd.id, ...qd.data() }))
        });
      }
    }

    return tests;
  } catch (error) {
    console.error('Error fetching tests by IDs:', error);
    throw error;
  }
};