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
} from 'firebase/firestore';

export async function getInvoice(orderId) {

  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    console.error(`No order found with ID: ${orderId}`);
    return null;
  }

  const orderData = orderSnap.data();
  orderData.orderId = orderSnap.id; 

  if (orderData.userId) {
    const userRef = doc(db, 'users', orderData.userId);
    const userSnap = await getDoc(userRef);
    orderData.userInfo = userSnap.exists() ? userSnap.data() : {};
  }

  // Fetch the bundle or package information.
  if (orderData.itemType === 'bundle' && orderData.bundleId) {
    const bundleRef = doc(db, 'bundles', orderData.bundleId);
    const bundleSnap = await getDoc(bundleRef);
    orderData.bundleInfo = bundleSnap.exists() ? bundleSnap.data() : {};
  } else if (orderData.itemType === 'package' && orderData.packageId) {
    const packageRef = doc(db, 'packages', orderData.packageId);
    const packageSnap = await getDoc(packageRef);
    orderData.packageInfo = packageSnap.exists() ? packageSnap.data() : {};
  }

  return orderData;
}

export async function getAllInvoices() {
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  
  // Maps over all orders and enriches them with user info.
  const invoices = await Promise.all(snapshot.docs.map(async (orderDoc) => {
    const orderData = { id: orderDoc.id, ...orderDoc.data() };
    if (orderData.userId) {
      const userSnap = await getDoc(doc(db, 'users', orderData.userId));
      orderData.userInfo = userSnap.exists() ? userSnap.data() : {};
    }

    if (orderData.itemType === 'bundle' && orderData.bundleId) {
      const bundleRef = doc(db, 'bundles', orderData.bundleId);
      const bundleSnap = await getDoc(bundleRef);
      orderData.bundleInfo = bundleSnap.exists() ? bundleSnap.data() : {};
    } else if (orderData.itemType === 'package' && orderData.packageId) {
      const packageRef = doc(db, 'packages', orderData.packageId);
      const packageSnap = await getDoc(packageRef);
      orderData.packageInfo = packageSnap.exists() ? packageSnap.data() : {};
    }

    return orderData;
  }));

  return invoices;
}

export async function getInvoiceTemplate() {
  const templateRef = doc(db, 'invoiceTemplate', 'default');
  const templateSnap = await getDoc(templateRef);
  if (templateSnap.exists()) {
    return templateSnap.data();
  }
  // Returns a fallback default template if none is set in the database.
  return {
    companyName: 'Abhyas Mock Test Pvt. Ltd.',
    logoUrl: '/images/logo.png',
    address: 'Gorakhpur, Uttar Pradesh',
    phone: '+91-1234567890',
    email: 'support@abhyas.com',
    primaryColor: '#2E86C1',
    secondaryColor: '#F1F1F1',
    font: 'Inter, sans-serif',
    footerNote: 'This is a system-generated invoice.',
  };
}

export async function updateInvoiceTemplate(templateData) {
  const templateRef = doc(db, 'invoiceTemplate', 'default');
  await setDoc(templateRef, templateData, { merge: true });
}

export async function createInvoice(invoiceData) {
  const invoiceRef = doc(db, 'invoices', invoiceData.orderId);
  await setDoc(invoiceRef, invoiceData);
  return invoiceData;
}