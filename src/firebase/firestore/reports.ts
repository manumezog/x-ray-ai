// This file is meant to be run on the server
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

/**
 * Checks if a user can generate a new report and increments their count.
 * @param userId The ID of the user.
 * @param dailyLimit The maximum number of reports allowed per day.
 * @returns True if the user can generate a report, false otherwise.
 */
export async function checkAndIncrementReportCount(userId: string, dailyLimit: number): Promise<boolean> {
  // Initialize Firebase within the function to ensure it runs only when called
  const { firestore } = initializeFirebase();
  const userDocRef = doc(firestore, 'users', userId);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // If the user document doesn't exist, we can't proceed.
      // This case should ideally not happen for an authenticated user.
      console.error(`User document not found for userId: ${userId}`);
      return false;
    }

    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const lastReportDate = userData.lastReportDate;
    const reportCount = userData.reportCount || 0;

    if (lastReportDate === today) {
      // Same day, check the count
      if (reportCount >= dailyLimit) {
        return false; // Limit reached
      }
      // Increment count
      await setDoc(userDocRef, { reportCount: reportCount + 1 }, { merge: true });
    } else {
      // Different day, reset count
      await setDoc(userDocRef, { reportCount: 1, lastReportDate: today }, { merge: true });
    }

    return true;
  } catch (error) {
    console.error("Error in checkAndIncrementReportCount:", error);
    // In case of an error, deny generation to be safe.
    return false;
  }
}
