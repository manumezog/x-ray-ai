'use server';

// This file is meant to be run on the server
import { initializeServerSideFirebase } from '@/firebase/server-init';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Checks if a user can generate a new report and increments their count.
 * @param userId The ID of the user.
 * @param dailyLimit The maximum number of reports allowed per day.
 * @returns True if the user can generate a report, false otherwise.
 */
export async function checkAndIncrementReportCount(userId: string, dailyLimit: number): Promise<boolean> {
  const { firestore } = initializeServerSideFirebase();
  const userDocRef = doc(firestore, 'users', userId);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error(`User document not found for userId: ${userId}`);
      return false;
    }

    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];

    const lastReportDate = userData.lastReportDate;
    
    // Defensively get the report count. If it's not a number or doesn't exist, it's 0.
    const reportCount = typeof userData.reportCount === 'number' ? userData.reportCount : 0;

    if (lastReportDate === today) {
      if (reportCount >= dailyLimit) {
        return false;
      }
      await setDoc(userDocRef, { reportCount: reportCount + 1 }, { merge: true });
    } else {
      await setDoc(userDocRef, { reportCount: 1, lastReportDate: today }, { merge: true });
    }

    return true;
  } catch (error) {
    console.error("Error in checkAndIncrementReportCount:", error);
    return false;
  }
}
