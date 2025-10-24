// lib/ratingService.js
import { db } from './firebaseConfig';
import { doc, runTransaction, getDoc } from 'firebase/firestore';

export const submitRating = async ({ userId, itemId, itemType, rating }) => {
  if (!userId || !itemId || !itemType || rating < 0 || rating > 5) {
    throw new Error('Invalid rating data provided.');
  }

  const itemRef = doc(db, `${itemType}s`, itemId); // "bundles" or "packages"
  const ratingRef = doc(db, `${itemType}s`, itemId, 'ratings', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists()) {
        throw new Error(`${itemType} not found!`);
      }

      // Set the user's individual rating
      transaction.set(ratingRef, {
        userId,
        rating,
        createdAt: new Date(),
      });

      const itemData = itemDoc.data();
      const currentRating = itemData.averageRating || 0;
      const ratingCount = itemData.ratingCount || 0;

      // Calculate new average rating
      const newRatingCount = ratingCount + 1;
      const newAverageRating =
        (currentRating * ratingCount + rating) / newRatingCount;

      // Update the main bundle/package document
      transaction.update(itemRef, {
        averageRating: newAverageRating,
        ratingCount: newRatingCount,
      });
    });
    return { success: true };
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
};

// FUNCTION TO FIX THE REFRESH ISSUE 
export const getUserRating = async ({ userId, itemId, itemType }) => {
  if (!userId || !itemId || !itemType) {
    return null;
  }
  const ratingRef = doc(db, `${itemType}s`, itemId, 'ratings', userId);
  const ratingSnap = await getDoc(ratingRef);

  if (ratingSnap.exists()) {
    return ratingSnap.data().rating;
  }
  return null;
};