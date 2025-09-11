// lib/packageService.js
import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Get all packages from Firestore and enrich with bundle details
export const getAllPackages = async () => {
  const packagesCol = collection(db, 'packages');
  const snapshot = await getDocs(packagesCol);
  const packages = [];

  for (const docSnap of snapshot.docs) {
    const pkg = { id: docSnap.id, ...docSnap.data() };
    
    // Fetch details for each bundle within the package
    if (pkg.bundleIds && pkg.bundleIds.length > 0) {
      const bundlePromises = pkg.bundleIds.map(id => getDoc(doc(db, 'bundles', id)));
      const bundleDocs = await Promise.all(bundlePromises);
      
      pkg.bundles = bundleDocs
        .filter(d => d.exists())
        .map(d => ({ id: d.id, ...d.data() }));
    } else {
      pkg.bundles = [];
    }
    packages.push(pkg);
  }
  
  return packages;
};
// Get a single package by its ID, enriched with bundle details
export const getPackageById = async (packageId) => {
  const packageRef = doc(db, 'packages', packageId);
  const packageSnap = await getDoc(packageRef);

  if (!packageSnap.exists()) {
    return null;
  }

  const pkg = { id: packageSnap.id, ...packageSnap.data() };

  // Fetch details for each bundle within the package
  if (pkg.bundleIds && pkg.bundleIds.length > 0) {
    const bundlePromises = pkg.bundleIds.map(id => getDoc(doc(db, 'bundles', id)));
    const bundleDocs = await Promise.all(bundlePromises);
    
    pkg.bundles = bundleDocs
      .filter(d => d.exists())
      .map(d => ({ id: d.id, ...d.data() }));
  } else {
    pkg.bundles = [];
  }

  return pkg;
};

