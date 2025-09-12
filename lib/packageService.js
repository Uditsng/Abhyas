

// lib/packageService.js
import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getTestsByIds } from './adminTestsService'; 

const enrichPackage = async (pkg) => {
  if (!pkg.bundleIds || pkg.bundleIds.length === 0) {
    pkg.bundles = [];
    pkg.totalTests = 0;
    pkg.totalQuestions = 0;
    return pkg;
  }

  // Fetch all bundle documents at once
  const bundlePromises = pkg.bundleIds.map(id => getDoc(doc(db, 'bundles', id)));
  const bundleDocs = await Promise.all(bundlePromises);

  const rawBundles = bundleDocs
    .filter(d => d.exists())
    .map(d => ({ id: d.id, ...d.data() }));

  // Collect all unique test IDs from all bundles to fetch them efficiently
  const allTestIds = [...new Set(rawBundles.flatMap(bundle => bundle.testIds || []))];
  const allTests = allTestIds.length > 0 ? await getTestsByIds(allTestIds) : [];
  
  //  Create a map for quick lookup of test objects by their ID
  const testsMap = new Map(allTests.map(test => [test.id, test]));

  // Enrich each bundle with its own question count
  pkg.bundles = rawBundles.map(bundle => {
    const totalQuestionsInBundle = (bundle.testIds || []).reduce((sum, testId) => {
      const test = testsMap.get(testId);
      return sum + (test?.questions?.length || 0);
    }, 0);
    return { ...bundle, totalQuestionsInBundle };
  });

  // Also calculate and attach the totals for the entire package
  pkg.totalTests = allTestIds.length;
  pkg.totalQuestions = allTests.reduce((sum, test) => sum + (test?.questions?.length || 0), 0);

  return pkg;
};


// Get all packages from Firestore, now enriched with aggregated data
export const getAllPackages = async () => {
  const packagesCol = collection(db, 'packages');
  const snapshot = await getDocs(packagesCol);
  const packages = [];

  for (const docSnap of snapshot.docs) {
    const pkgData = { id: docSnap.id, ...docSnap.data() };
    // Enrich each package with the necessary counts
    const enrichedPkg = await enrichPackage(pkgData);
    packages.push(enrichedPkg);
  }
  
  return packages;
};

// Get a single package by its ID, now enriched with aggregated data
export const getPackageById = async (packageId) => {
  const packageRef = doc(db, 'packages', packageId);
  const packageSnap = await getDoc(packageRef);

  if (!packageSnap.exists()) {
    return null;
  }

  const pkgData = { id: packageSnap.id, ...packageSnap.data() };
  // Enrich the package with the necessary counts
  const enrichedPkg = await enrichPackage(pkgData);
  return enrichedPkg;
};