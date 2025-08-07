import { db } from './firebaseConfig';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField,
  serverTimestamp
} from 'firebase/firestore';

// Cache for bookmarks to reduce Firestore reads
let bookmarksCache = {};
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get all bookmarks for a user
export async function getUserBookmarks(userId) {
  try {
    const now = Date.now();
    if (bookmarksCache[userId] && (now - lastFetchTime < CACHE_TTL)) {
      return bookmarksCache[userId];
    }

    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    const parsedLocalBookmarks = localBookmarks ? JSON.parse(localBookmarks) : {};

    const bookmarksRef = doc(db, 'bookmarks', userId);
    const bookmarksSnap = await getDoc(bookmarksRef);

    let result = {};
    if (bookmarksSnap.exists()) {
      result = bookmarksSnap.data().items || {};
      bookmarksCache[userId] = result;
      lastFetchTime = now;
      localStorage.setItem('bookmarkedQuestions', JSON.stringify(result));
    } else {
      result = parsedLocalBookmarks;
    }
    return result;
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    return localBookmarks ? JSON.parse(localBookmarks) : {};
  }
}

// Add or update a bookmark
export async function saveBookmark(userId, bookmarkKey, bookmarkData) {
  try {
    const bookmarksRef = doc(db, 'bookmarks', userId);
    
    // ✅ **THE FIX IS HERE**: The `bookmarkItem` constant was removed.
    // We are now saving the complete `bookmarkData` object as intended.
    await setDoc(bookmarksRef, {
      items: {
        [bookmarkKey]: bookmarkData, // Save the whole object
      },
      updatedAt: serverTimestamp()
    }, { merge: true });

    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    const bookmarks = localBookmarks ? JSON.parse(localBookmarks) : {};
    bookmarks[bookmarkKey] = bookmarkData;
    localStorage.setItem('bookmarkedQuestions', JSON.stringify(bookmarks));

    return true;
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return false;
  }
}

// Remove a bookmark
export async function removeBookmark(userId, bookmarkKey) {
  try {
    const bookmarksRef = doc(db, 'bookmarks', userId);
    const bookmarksSnap = await getDoc(bookmarksRef);

    if (bookmarksSnap.exists()) {
        await updateDoc(bookmarksRef, {
        [`items.${bookmarkKey}`]: deleteField(),
        updatedAt: serverTimestamp()
      });
    }

    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    if (localBookmarks) {
      const bookmarks = JSON.parse(localBookmarks);
      delete bookmarks[bookmarkKey];
      localStorage.setItem('bookmarkedQuestions', JSON.stringify(bookmarks));
    }
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
}

// Clear all bookmarks
export async function clearAllBookmarks(userId) {
  try {
    const bookmarksRef = doc(db, 'bookmarks', userId);
    await setDoc(bookmarksRef, { items: {} }, { merge: true });
    localStorage.setItem('bookmarkedQuestions', JSON.stringify({}));
    return true;
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return false;
  }
}

let syncInProgress = false;

export async function syncBookmarks(userId) {
  if (syncInProgress) {
    return null;
  }
  syncInProgress = true;
  try {
    const localBookmarksStr = localStorage.getItem('bookmarkedQuestions');
    const localBookmarks = localBookmarksStr ? JSON.parse(localBookmarksStr) : {};
    const remoteBookmarks = await getUserBookmarks(userId);
    const mergedBookmarks = { ...localBookmarks, ...remoteBookmarks };

    if (JSON.stringify(mergedBookmarks) !== JSON.stringify(remoteBookmarks)) {
      const bookmarksRef = doc(db, 'bookmarks', userId);
      await setDoc(bookmarksRef, {
        items: mergedBookmarks,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    localStorage.setItem('bookmarkedQuestions', JSON.stringify(mergedBookmarks));
    bookmarksCache[userId] = mergedBookmarks;
    lastFetchTime = Date.now();
    return mergedBookmarks;
  } catch (error) {
    console.error('Error syncing bookmarks:', error);
    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    return localBookmarks ? JSON.parse(localBookmarks) : {};
  } finally {
    syncInProgress = false;
  }
}
