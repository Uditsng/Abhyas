// lib/invoiceService.js
import { db } from './firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';

// Get a single invoice by its orderId
export async function getInvoice(orderId) {
  const invoiceRef = doc(db, 'invoices', orderId);
  const invoiceSnap = await getDoc(invoiceRef);
  return invoiceSnap.exists() ? invoiceSnap.data() : null;
}

// Create a new invoice snapshot
export async function createInvoice(invoiceData) {
  const invoiceRef = doc(db, 'invoices', invoiceData.orderId);
  await setDoc(invoiceRef, invoiceData);
  return invoiceData;
}

// Get all invoices for SuperAdmin
export async function getAllInvoices() {
  const invoicesCol = collection(db, 'invoices');
  const q = query(invoicesCol, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get the invoice template
export async function getInvoiceTemplate() {
  const templateRef = doc(db, 'invoiceTemplate', 'default');
  const templateSnap = await getDoc(templateRef);
  if (templateSnap.exists()) {
    return templateSnap.data();
  }
  // Return a default template if one doesn't exist
  return {
    companyName: 'Abhyas Mock Test Pvt. Ltd.',
    logoUrl: '/images/logo.png', // A default logo
    address: 'Gorakhpur, Uttar Pradesh',
    phone: '+91-1234567890',
    email: 'support@abhyas.com',
    primaryColor: '#2E86C1',
    secondaryColor: '#F1F1F1',
    font: 'Inter, sans-serif',
    footerNote: 'This is a system-generated invoice.',
  };
}

// Update the invoice template
export async function updateInvoiceTemplate(templateData) {
  const templateRef = doc(db, 'invoiceTemplate', 'default');
  await setDoc(templateRef, templateData, { merge: true });
}