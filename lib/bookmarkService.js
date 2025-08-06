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
    // Check if we have a recent cache
    const now = Date.now();
    if (bookmarksCache[userId] && (now - lastFetchTime < CACHE_TTL)) {
      return bookmarksCache[userId];
    }

    // Try to get from localStorage first
    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    const parsedLocalBookmarks = localBookmarks ? JSON.parse(localBookmarks) : {};

    // Then fetch from Firestore
    const bookmarksRef = doc(db, 'bookmarks', userId);
    const bookmarksSnap = await getDoc(bookmarksRef);

    let result = {};
    if (bookmarksSnap.exists()) {
      result = bookmarksSnap.data().items || {};

      // Update cache
      bookmarksCache[userId] = result;
      lastFetchTime = now;

      // Update localStorage
      localStorage.setItem('bookmarkedQuestions', JSON.stringify(result));
    } else {
      // No bookmarks document exists yet
      result = parsedLocalBookmarks;
    }

    return result;
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    // Return local bookmarks as fallback
    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    return localBookmarks ? JSON.parse(localBookmarks) : {};
  }
}

// Add or update a bookmark
export async function saveBookmark(userId, bookmarkKey, bookmarkData) {
    const bookmarkItem = {
    testId: bookmarkData.testId,
    questionId: bookmarkData.questionId,
    date: bookmarkData.date,
  };
  
  try {
    const bookmarksRef = doc(db, 'bookmarks', userId);
    const bookmarksSnap = await getDoc(bookmarksRef);

    if (bookmarksSnap.exists()) {
      // Update existing document
      await updateDoc(bookmarksRef, {
        [`items.${bookmarkKey}`]: bookmarkItem,
      });
    } else {
      // Create new document
      await setDoc(bookmarksRef, {
        items: {
          [bookmarkKey]: bookmarkItem,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Update local storage as backup
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

    await updateDoc(bookmarksRef, {
      [`items.${bookmarkKey}`]: deleteField(),
      updatedAt: serverTimestamp()
    });

    // Update local storage as backup
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

    await updateDoc(bookmarksRef, {
      items: {},
      updatedAt: serverTimestamp()
    });

    // Clear local storage bookmarks
    localStorage.setItem('bookmarkedQuestions', JSON.stringify({}));

    return true;
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return false;
  }
}

// Track if sync is in progress to prevent multiple simultaneous syncs
let syncInProgress = false;

// Sync local bookmarks with Firebase (useful after login)
export async function syncBookmarks(userId) {
  // Prevent multiple simultaneous syncs
  if (syncInProgress) {
    console.log('Sync already in progress, skipping');
    return null;
  }

  syncInProgress = true;

  try {
    // Get local bookmarks first (faster)
    const localBookmarksStr = localStorage.getItem('bookmarkedQuestions');
    const localBookmarks = localBookmarksStr ? JSON.parse(localBookmarksStr) : {};

    // Check if we need to sync at all
    const lastSyncTime = localStorage.getItem('lastBookmarkSyncTime');
    const now = Date.now();

    // If we've synced in the last hour and have local bookmarks, just return those
    if (lastSyncTime && (now - parseInt(lastSyncTime) < 60 * 60 * 1000) && Object.keys(localBookmarks).length > 0) {
      syncInProgress = false;
      return localBookmarks;
    }

    // Get remote bookmarks
    const remoteBookmarks = await getUserBookmarks(userId);

    // Merge bookmarks (remote takes precedence for same keys)
    const mergedBookmarks = { ...localBookmarks, ...remoteBookmarks };

    // Only update Firestore if there are actual changes
    if (JSON.stringify(mergedBookmarks) !== JSON.stringify(remoteBookmarks)) {
      const bookmarksRef = doc(db, 'bookmarks', userId);
      await setDoc(bookmarksRef, {
        items: mergedBookmarks,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // Update local storage
    localStorage.setItem('bookmarkedQuestions', JSON.stringify(mergedBookmarks));
    localStorage.setItem('lastBookmarkSyncTime', now.toString());

    // Update cache
    bookmarksCache[userId] = mergedBookmarks;
    lastFetchTime = now;

    syncInProgress = false;
    return mergedBookmarks;
  } catch (error) {
    console.error('Error syncing bookmarks:', error);
    syncInProgress = false;

    // Return local bookmarks as fallback
    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    return localBookmarks ? JSON.parse(localBookmarks) : {};
  }
}