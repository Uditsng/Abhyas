import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Fetch all exams
export async function getAllExams() {
  const examsCol = collection(db, 'exams');
  const snapshot = await getDocs(examsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Create a new exam
export async function createExam({ name }) {
  const examsCol = collection(db, 'exams');
  const docRef = await addDoc(examsCol, { name });
  return docRef.id;
}

// Edit an exam
export async function editExam(examId, { name }) {
  await updateDoc(doc(db, 'exams', examId), { name });
}

// Delete an exam
export async function deleteExam(examId) {
  await deleteDoc(doc(db, 'exams', examId));
} 