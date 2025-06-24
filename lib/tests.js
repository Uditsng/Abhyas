import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const getCourses = async () => {
  const coursesCol = collection(db, 'courses');
  const courseSnapshot = await getDocs(coursesCol);
  const courseList = courseSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return courseList;
};

// This will fetch all tests under the Firestore path: courses/{courseId}/tests.
export const getTestsForCourse = async (courseId) => {
  const testsCol = collection(db, 'courses', courseId, 'tests');
  const testSnapshot = await getDocs(testsCol);
  const testList = testSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return testList;
};

export const getTestDetails = async (courseId, testId) => {
  const testRef = doc(db, 'courses', courseId, 'tests', testId);
  const testDoc = await getDoc(testRef);
  if (testDoc.exists()) {
    const questionsCol = collection(db, 'courses', courseId, 'tests', testId, 'questions');
    const questionsSnapshot = await getDocs(questionsCol);
    const questionsList = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { id: testDoc.id, ...testDoc.data(), questions: questionsList };
  } else {
    return null;
  }
};
