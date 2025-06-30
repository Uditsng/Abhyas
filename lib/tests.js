// FILE: lib/tests.js
import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Fetch all tests from 'tests' collection
export const getAllTests = async () => {
  const testsCol = collection(db, 'tests');
  const snapshot = await getDocs(testsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
