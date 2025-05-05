import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteField,
  serverTimestamp 
} from 'firebase/firestore';

// Get all bookmarks for a user
export async function getUserBookmarks(userId) {
  try {
    const bookmarksRef = doc(db, 'bookmarks', userId);
    const bookmarksSnap = await getDoc(bookmarksRef);
    
    if (bookmarksSnap.exists()) {
      return bookmarksSnap.data().items || {};
    } else {
      // No bookmarks document exists yet
      return {};
    }
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    // Return local bookmarks as fallback
    const localBookmarks = localStorage.getItem('bookmarkedQuestions');
    return localBookmarks ? JSON.parse(localBookmarks) : {};
  }
}

// Add or update a bookmark
export async function saveBookmark(userId, bookmarkKey, bookmarkData) {
  try {
    const bookmarksRef = doc(db, 'bookmarks', userId);
    const bookmarksSnap = await getDoc(bookmarksRef);
    
    if (bookmarksSnap.exists()) {
      // Update existing document
      await updateDoc(bookmarksRef, {
        [`items.${bookmarkKey}`]: {
          ...bookmarkData,
          updatedAt: serverTimestamp()
        }
      });
    } else {
      // Create new document
      await setDoc(bookmarksRef, {
        items: {
          [bookmarkKey]: {
            ...bookmarkData,
            updatedAt: serverTimestamp()
          }
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

// Sync local bookmarks with Firebase (useful after login)
export async function syncBookmarks(userId) {
  try {
    // Get remote bookmarks
    const remoteBookmarks = await getUserBookmarks(userId);
    
    // Get local bookmarks
    const localBookmarksStr = localStorage.getItem('bookmarkedQuestions');
    const localBookmarks = localBookmarksStr ? JSON.parse(localBookmarksStr) : {};
    
    // Merge bookmarks (remote takes precedence for same keys)
    const mergedBookmarks = { ...localBookmarks, ...remoteBookmarks };
    
    // Save merged bookmarks to Firebase
    const bookmarksRef = doc(db, 'bookmarks', userId);
    await setDoc(bookmarksRef, {
      items: mergedBookmarks,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update local storage
    localStorage.setItem('bookmarkedQuestions', JSON.stringify(mergedBookmarks));
    
    return mergedBookmarks;
  } catch (error) {
    console.error('Error syncing bookmarks:', error);
    return null;
  }
}