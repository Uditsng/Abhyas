import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Fetch all expenses
export async function getAllExpenses() {
  const expensesCol = collection(db, 'expenses');
  const snapshot = await getDocs(expensesCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Create a new expense
export async function createExpense({ description, amount, date }) {
  const expensesCol = collection(db, 'expenses');
  const docRef = await addDoc(expensesCol, { description, amount, date });
  return docRef.id;
}

// Edit an expense
export async function editExpense(expenseId, { description, amount, date }) {
  await updateDoc(doc(db, 'expenses', expenseId), { description, amount, date });
}

// Delete an expense
export async function deleteExpense(expenseId) {
  await deleteDoc(doc(db, 'expenses', expenseId));
} 