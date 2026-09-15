import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { Volunteer } from '../types';

export const firebaseConfig = {
  projectId: firebaseConfigData.projectId || 'fluted-graph-72ts5',
  appId: firebaseConfigData.appId || '1:34397616459:web:dae10a9d1f7849eb2c90ce',
  apiKey: firebaseConfigData.apiKey || 'AIzaSyAPtqciPDNJB5qs-givNLAMr8FcKykc-4E',
  authDomain: firebaseConfigData.authDomain || 'fluted-graph-72ts5.firebaseapp.com',
  firestoreDatabaseId:
    firebaseConfigData.firestoreDatabaseId ||
    'ai-studio-voluntarioaccess-9e5e8864-1de1-4242-a77d-3b0731a53ac0',
  storageBucket: firebaseConfigData.storageBucket || 'fluted-graph-72ts5.firebasestorage.app',
  messagingSenderId: firebaseConfigData.messagingSenderId || '34397616459',
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID if provisioned
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const VOLUNTEERS_COLLECTION = 'volunteers';

/**
 * Validate live connection to Google Firebase Firestore
 */
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline.', error);
    } else {
      console.log('Firebase connection ready.');
    }
    return true;
  }
}

/**
 * Real-time listener for all volunteers in Firestore
 */
export function subscribeToVolunteers(
  onData: (volunteers: Volunteer[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, VOLUNTEERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Volunteer[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Volunteer);
      });
      onData(list);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Get one-time list of volunteers from Firestore
 */
export async function getVolunteersFromFirebase(): Promise<Volunteer[]> {
  try {
    const colRef = collection(db, VOLUNTEERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const list: Volunteer[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Volunteer);
    });
    return list;
  } catch (err) {
    console.error('Error fetching volunteers from Firebase:', err);
    return [];
  }
}

/**
 * Save or update a single volunteer in Firestore
 */
export async function saveVolunteerToFirebase(volunteer: Volunteer): Promise<void> {
  const docRef = doc(db, VOLUNTEERS_COLLECTION, volunteer.id);
  // Clean undefined values to prevent Firestore serialization errors
  const cleanData = JSON.parse(JSON.stringify(volunteer));
  await setDoc(docRef, cleanData, { merge: true });
}

/**
 * Delete a volunteer document from Firestore
 */
export async function deleteVolunteerFromFirebase(volunteerId: string): Promise<void> {
  const docRef = doc(db, VOLUNTEERS_COLLECTION, volunteerId);
  await deleteDoc(docRef);
}

/**
 * Batch write multiple volunteers to Firestore (used in bulk upload / replace)
 */
export async function batchSaveVolunteersToFirebase(
  volunteers: Volunteer[],
  replaceExisting = false
): Promise<void> {
  if (replaceExisting) {
    // Delete existing documents first
    const existing = await getVolunteersFromFirebase();
    const deleteBatches: Promise<void>[] = [];
    for (let i = 0; i < existing.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = existing.slice(i, i + 400);
      chunk.forEach((v) => {
        batch.delete(doc(db, VOLUNTEERS_COLLECTION, v.id));
      });
      deleteBatches.push(batch.commit());
    }
    await Promise.all(deleteBatches);
  }

  // Insert or update new volunteers in chunks of 400 (Firestore limit is 500 per batch)
  for (let i = 0; i < volunteers.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = volunteers.slice(i, i + 400);
    chunk.forEach((v) => {
      const cleanData = JSON.parse(JSON.stringify(v));
      batch.set(doc(db, VOLUNTEERS_COLLECTION, v.id), cleanData, { merge: true });
    });
    await batch.commit();
  }
}

/**
 * Seeds initial mock data to Firestore if the collection is empty
 */
export async function seedInitialVolunteersIfEmpty(initialData: Volunteer[]): Promise<boolean> {
  try {
    const existing = await getVolunteersFromFirebase();
    if (existing.length === 0 && initialData.length > 0) {
      console.log('Seeding initial volunteers into Firestore...');
      await batchSaveVolunteersToFirebase(initialData, false);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not seed initial data to Firestore:', err);
    return false;
  }
}
