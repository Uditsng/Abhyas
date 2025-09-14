// lib/packageService.js

import { db } from './firebaseConfig';

import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { getTestsByIds } from './adminTestsService';

const enrichPackage = async (pkg) => {
  if (!pkg.bundleIds || pkg.bundleIds.length === 0) {
    pkg.bundles = [];
    pkg.totalTests = 0;
    pkg.totalQuestions = 0;
    return pkg;
  }

  const bundlePromises = pkg.bundleIds.map(id => getDoc(doc(db, 'bundles', id)));
  const bundleDocs = await Promise.all(bundlePromises);

  const rawBundles = bundleDocs
    .filter(d => d.exists())
    .map(d => ({ id: d.id, ...d.data() }));

  const allTestIds = [...new Set(rawBundles.flatMap(bundle => bundle.testIds || []))];
  const allTests = allTestIds.length > 0 ? await getTestsByIds(allTestIds) : [];

  const testsMap = new Map(allTests.map(test => [test.id, test]));

  pkg.bundles = rawBundles.map(bundle => {
    const testsInBundle = (bundle.testIds || []).map(testId => testsMap.get(testId)).filter(Boolean);
    const totalQuestionsInBundle = testsInBundle.reduce((sum, test) => sum + (test?.questions?.length || 0), 0);
    return { ...bundle, tests: testsInBundle, totalQuestionsInBundle };
  });

  pkg.totalTests = allTestIds.length;
  pkg.totalQuestions = allTests.reduce((sum, test) => sum + (test?.questions?.length || 0), 0);

  return pkg;
};


export const getAllPackages = async () => {
  const packagesCol = collection(db, 'packages');
  const snapshot = await getDocs(packagesCol);
  const packages = [];

  for (const docSnap of snapshot.docs) {
    const pkgData = { id: docSnap.id, ...docSnap.data() };
    const enrichedPkg = await enrichPackage(pkgData);
    packages.push(enrichedPkg);
  }

  return packages;
};

export const getPackageById = async (packageId) => {
  const packageRef = doc(db, 'packages', packageId);
  const packageSnap = await getDoc(packageRef);

  if (!packageSnap.exists()) {
    return null;
  }
  const pkgData = { id: packageSnap.id, ...packageSnap.data() };
  const enrichedPkg = await enrichPackage(pkgData);
  return enrichedPkg;
};


export const getPackagesBySubExamCategory = async (subCategory) => {
  if (!subCategory) return [];
  try {
    const packagesCol = collection(db, 'packages');
    // FIX: Changed 'exam' to 'subExamCategory' to match your new requirement.
    const q = query(packagesCol, where('subExamCategory', '==', subCategory));
    const snapshot = await getDocs(q);
    const packages = [];
    for (const docSnap of snapshot.docs) {
      const pkgData = { id: docSnap.id, ...docSnap.data() };
      const enrichedPkg = await enrichPackage(pkgData);
      packages.push(enrichedPkg);
    }
    return packages;
  } catch (error) {
    console.error('Error fetching packages by sub-exam category:', error);
    throw error;
  }
};