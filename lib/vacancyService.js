// lib/vacancyService.js

import { db } from './firebaseConfig';
import { collection, addDoc, getDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const vacanciesCollection = collection(db, 'vacancies');

// Function to create a new vacancy
export const createVacancy = async (vacancyData) => {
  try {
    await addDoc(vacanciesCollection, {
      ...vacancyData,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating vacancy:", error);
    return { success: false, error: error.message };
  }
};

// Function to get all vacancies, ordered by creation date
export const getVacancies = async () => {
  try {
    const q = query(vacanciesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching vacancies:", error);
    return [];
  }
};

// Function to update an existing vacancy
export const updateVacancy = async (id, updatedData) => {
  try {
    const vacancyDoc = doc(db, 'vacancies', id);
    await updateDoc(vacancyDoc, updatedData);
    return { success: true };
  } catch (error) {
    console.error("Error updating vacancy:", error);
    return { success: false, error: error.message };
  }
};

// Function to delete a vacancy
export const deleteVacancy = async (id) => {
  try {
    const vacancyDoc = doc(db, 'vacancies', id);
    await deleteDoc(vacancyDoc);
    return { success: true };
  } catch (error) {
    console.error("Error deleting vacancy:", error);
    return { success: false, error: error.message };
  }
};

// function to get a single vacancy by its ID
export const getVacancyById = async (id) => {
  try {
    const vacancyDoc = doc(db, 'vacancies', id);
    const docSnap = await getDoc(vacancyDoc);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching single vacancy:", error);
    return null;
  }
};