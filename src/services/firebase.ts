import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { FirestoreJob, FirestoreEvent, UserProfileState } from '../types';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let isFirebaseConfigured = false;

/**
 * Lazy, resilient Firebase initialization.
 * Automatically inspects environment variables and prevents crashes if credentials are unset.
 */
export function getDb(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  // If no credentials supplied, remain in graceful local-persistence mode
  if (!apiKey || !projectId) {
    return null;
  }

  try {
    const config = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
    firestoreDb = getFirestore(firebaseApp);
    isFirebaseConfigured = true;
    return firestoreDb;
  } catch (error) {
    console.warn('Firebase initialization skipped or failed:', error);
    return null;
  }
}

/**
 * Check if live Firestore is actively connected
 */
export function isFirestoreActive(): boolean {
  return getDb() !== null && isFirebaseConfigured;
}

/**
 * Fetch all jobs from Firestore collection `jobs`
 */
export async function fetchJobsFromFirestore(): Promise<FirestoreJob[] | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const jobsCol = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCol);
    if (snapshot.empty) {
      return [];
    }

    const items: FirestoreJob[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        title: data.title || '',
        companyName: data.companyName || '',
        companyLogo: data.companyLogo || undefined,
        location: data.location || 'Hà Nội',
        employmentType: data.employmentType || 'Internship',
        salaryText: data.salaryText || 'Thỏa thuận',
        description: data.description || '',
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        benefits: Array.isArray(data.benefits) ? data.benefits : [],
        majorTags: Array.isArray(data.majorTags) ? data.majorTags : [],
        skillTags: Array.isArray(data.skillTags) ? data.skillTags : [],
        careerTendencies: Array.isArray(data.careerTendencies) ? data.careerTendencies : ['CR', 'AN'],
        suitableAcademicYears: Array.isArray(data.suitableAcademicYears) ? data.suitableAcademicYears : ['Năm 3', 'Năm 4'],
        careerCategory: data.careerCategory || 'Marketing',
        publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
        expiresAt: data.expiresAt || '2026-12-31',
        sourceName: data.sourceName || data.companyName || '',
        sourceUrl: data.sourceUrl || '',
        applyUrl: data.applyUrl || '',
        verified: typeof data.verified === 'boolean' ? data.verified : true,
        status: data.status || 'active',
        isDemo: !!data.isDemo,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    return items;
  } catch (err) {
    console.warn('Firestore fetch failed, falling back to local cache:', err);
    return null;
  }
}

/**
 * Save job to Firestore collection `jobs` with full required schema
 */
export async function saveJobToFirestore(job: FirestoreJob): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    const jobRef = doc(db, 'jobs', job.id);
    await setDoc(jobRef, {
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      companyLogo: job.companyLogo || null,
      location: job.location,
      employmentType: job.employmentType,
      salaryText: job.salaryText,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      majorTags: job.majorTags,
      skillTags: job.skillTags,
      careerTendencies: job.careerTendencies,
      suitableAcademicYears: job.suitableAcademicYears,
      careerCategory: job.careerCategory,
      publishedAt: job.publishedAt,
      expiresAt: job.expiresAt,
      sourceName: job.sourceName,
      sourceUrl: job.sourceUrl,
      applyUrl: job.applyUrl,
      verified: job.verified,
      status: job.status,
      isDemo: !!job.isDemo,
      createdAt: job.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Failed to save to Firestore, continuing with local persistence:', err);
    return false;
  }
}

/**
 * Delete job from Firestore collection `jobs`
 */
export async function deleteJobFromFirestore(jobId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    const jobRef = doc(db, 'jobs', jobId);
    await deleteDoc(jobRef);
    return true;
  } catch (err) {
    console.warn('Failed to delete from Firestore:', err);
    return false;
  }
}

/**
 * Fetch all events from Firestore collection `events`
 */
export async function fetchEventsFromFirestore(): Promise<FirestoreEvent[] | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const eventsCol = collection(db, 'events');
    const snapshot = await getDocs(eventsCol);
    if (snapshot.empty) return [];

    const items: FirestoreEvent[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        title: data.title || '',
        organizer: data.organizer || '',
        organizerLogo: data.organizerLogo || undefined,
        date: data.date || '',
        time: data.time || '',
        location: data.location || '',
        locationType: data.locationType || 'offline',
        category: data.category || 'workshop',
        description: data.description || '',
        agenda: Array.isArray(data.agenda) ? data.agenda : [],
        speakers: Array.isArray(data.speakers) ? data.speakers : [],
        targetAudience: data.targetAudience || '',
        benefits: Array.isArray(data.benefits) ? data.benefits : [],
        registrationUrl: data.registrationUrl || '',
        sourceUrl: data.sourceUrl || '',
        publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
        expiresAt: data.expiresAt || '',
        status: data.status || 'active',
        verified: typeof data.verified === 'boolean' ? data.verified : true,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });
    return items;
  } catch (err) {
    console.warn('Failed to fetch events from Firestore:', err);
    return null;
  }
}

/**
 * Save event to Firestore collection `events`
 */
export async function saveEventToFirestore(event: FirestoreEvent): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    const eventRef = doc(db, 'events', event.id);
    await setDoc(eventRef, {
      id: event.id,
      title: event.title,
      organizer: event.organizer,
      organizerLogo: event.organizerLogo || null,
      date: event.date,
      time: event.time,
      location: event.location,
      locationType: event.locationType,
      category: event.category,
      description: event.description,
      agenda: event.agenda || [],
      speakers: event.speakers || [],
      targetAudience: event.targetAudience || null,
      benefits: event.benefits || [],
      registrationUrl: event.registrationUrl,
      sourceUrl: event.sourceUrl || null,
      publishedAt: event.publishedAt || new Date().toISOString().split('T')[0],
      expiresAt: event.expiresAt || null,
      status: event.status,
      verified: event.verified,
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Failed to save event to Firestore:', err);
    return false;
  }
}

/**
 * Delete event from Firestore collection `events`
 */
export async function deleteEventFromFirestore(eventId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
    return true;
  } catch (err) {
    console.warn('Failed to delete event from Firestore:', err);
    return false;
  }
}

/**
 * Fetch users from Firestore collection `users` for Admin User Management
 */
export async function fetchUsersFromFirestore(): Promise<UserProfileState[] | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    if (snapshot.empty) return [];

    const items: UserProfileState[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        userId: docSnap.id,
        displayName: data.displayName || 'Sinh viên PTIT',
        email: data.email || '',
        role: data.role || 'student',
        major: data.major || 'Chưa cập nhật',
        academicYear: data.academicYear || 'Chưa cập nhật',
        careerGoal: data.careerGoal || 'Chưa có',
        careerCheckCompleted: !!data.careerCheckCompleted,
        careerDirection: data.careerDirection,
        careerInterestScores: data.careerInterestScores,
        topCareerTendencies: data.topCareerTendencies,
        completedAt: data.completedAt,
        skillGap: data.skillGap || null,
        onboardingCompleted: !!data.onboardingCompleted,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    return items;
  } catch (err) {
    console.warn('Failed to fetch users from Firestore:', err);
    return null;
  }
}

/**
 * Save or update user in Firestore collection `users`
 */
export async function saveUserToFirestore(user: UserProfileState): Promise<boolean> {
  const db = getDb();
  if (!db || !user.userId) return false;

  try {
    const userRef = doc(db, 'users', user.userId);
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save user to Firestore:', err);
    return false;
  }
}

/**
 * Log user interaction event to Firestore collection `interactions`
 */
export async function logInteractionToFirestore(
  type: string,
  meta?: Record<string, unknown>
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const interactionId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const interactionRef = doc(db, 'interactions', interactionId);
    await setDoc(interactionRef, {
      id: interactionId,
      type,
      meta: meta || {},
      timestamp: new Date().toISOString(),
    });
  } catch {
    // safe fallback
  }
}

/**
 * Fetch interaction logs from Firestore collection `interactions`
 */
export async function fetchInteractionsFromFirestore(): Promise<Array<{ id: string; type: string; meta: any; timestamp: string }> | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const col = collection(db, 'interactions');
    const snapshot = await getDocs(col);
    if (snapshot.empty) return [];
    const logs: any[] = [];
    snapshot.forEach((d) => logs.push(d.data()));
    return logs;
  } catch (err) {
    console.warn('Failed to fetch interactions from Firestore:', err);
    return null;
  }
}

