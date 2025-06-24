import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, limit } from 'firebase/firestore';

/**
 * Check if there are any users in the database
 * @returns {Promise<boolean>} - True if no users exist
 */
async function isFirstUser() {
  try {
    const usersQuery = query(collection(db, "users"), limit(1));
    const snapshot = await getDocs(usersQuery);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking if first user:', error);
    return false;
  }
}

/**
 * Create or update user profile
 * @param {string} userId - Firebase Auth user ID
 * @param {object} userData - User data to save
 * @returns {Promise<boolean>} - Success status
 */
export async function saveUserProfile(userId, userData) {
  try {
    // Check if this is the first user in the system
    const firstUser = await isFirstUser();

    // If this is the first user, make them a superAdmin
    if (firstUser) {
      userData.role = "superAdmin";
      console.log("First user created as superAdmin");
    }

    await setDoc(doc(db, "users", userId), {
      ...userData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

/**
 * Get user profile data
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<object|null>} - User data or null
 */
export async function getUserProfile(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Check if a user has admin role
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<boolean>} - True if user is admin
 */
export async function isUserAdmin(userId) {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile && userProfile.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Update user role
 * @param {string} userId - Firebase Auth user ID
 * @param {string} role - New role (e.g., 'admin', 'user')
 * @returns {Promise<boolean>} - Success status
 */
export async function updateUserRole(userId, role) {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: role,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error(`Error updating user role to ${role}:`, error);
    return false;
  }
}

