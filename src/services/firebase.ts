import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';

export { onAuthStateChanged, type FirebaseUser };
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { getDatabase, ref, set, onValue, remove } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';
import { Partner, EventShoot, CrewMember } from '../types';

// Custom credentials storage key
const CUSTOM_FIREBASE_CONFIG_KEY = 'tmc_custom_firebase_credentials';

export function getEffectiveFirebaseConfig() {
  try {
    const custom = localStorage.getItem(CUSTOM_FIREBASE_CONFIG_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.apiKey) {
        return { ...firebaseConfig, ...parsed };
      }
    }
  } catch {
    // fallback
  }
  return firebaseConfig;
}

export function saveCustomFirebaseCredentials(customConfig: Record<string, string>) {
  localStorage.setItem(CUSTOM_FIREBASE_CONFIG_KEY, JSON.stringify(customConfig));
  window.location.reload();
}

export function clearCustomFirebaseCredentials() {
  localStorage.removeItem(CUSTOM_FIREBASE_CONFIG_KEY);
  window.location.reload();
}

const activeConfig = getEffectiveFirebaseConfig();

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Database & Firestore
export const db = getFirestore(
  app,
  (activeConfig as any).firestoreDatabaseId || undefined
);

// Realtime Database instance
export const rtdb = (() => {
  try {
    const dbUrl = (activeConfig as any).databaseURL || `https://${activeConfig.projectId}-default-rtdb.firebaseio.com`;
    return getDatabase(app, dbUrl);
  } catch (err) {
    try {
      return getDatabase(app);
    } catch {
      return null;
    }
  }
})();

// Error Handling conforming to firebase-integration-rpc skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline check:', error.message);
    }
  }
}
testFirebaseConnection();

// --- FIRESTORE PARTNERS & EVENTS SYNC HELPERS ---

export async function savePartnerToFirestore(partner: Partner): Promise<void> {
  const path = `partners/${partner.id}`;
  try {
    await setDoc(doc(db, 'partners', partner.id), partner);
    if (rtdb) {
      await set(ref(rtdb, `partners/${partner.id}`), partner);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePartnerFromFirestore(partnerId: string): Promise<void> {
  const path = `partners/${partnerId}`;
  try {
    await deleteDoc(doc(db, 'partners', partnerId));
    if (rtdb) {
      await remove(ref(rtdb, `partners/${partnerId}`));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveEventToFirestore(event: EventShoot): Promise<void> {
  const path = `events/${event.id}`;
  try {
    await setDoc(doc(db, 'events', event.id), event);
    if (rtdb) {
      await set(ref(rtdb, `events/${event.id}`), event);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEventFromFirestore(eventId: string): Promise<void> {
  const path = `events/${eventId}`;
  try {
    await deleteDoc(doc(db, 'events', eventId));
    if (rtdb) {
      await remove(ref(rtdb, `events/${eventId}`));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToFirestorePartners(onUpdate: (partners: Partner[]) => void): Unsubscribe {
  const path = 'partners';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const partners: Partner[] = [];
      snapshot.forEach((doc) => {
        partners.push(doc.data() as Partner);
      });
      onUpdate(partners);
    },
    (error) => {
      console.warn('Partners listener notice (sign in to sync live with Cloud Firestore):', error.message);
    }
  );
}

export function subscribeToFirestoreEvents(onUpdate: (events: EventShoot[]) => void): Unsubscribe {
  const path = 'events';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const events: EventShoot[] = [];
      snapshot.forEach((doc) => {
        events.push(doc.data() as EventShoot);
      });
      onUpdate(events);
    },
    (error) => {
      console.warn('Events listener notice (sign in to sync live with Cloud Firestore):', error.message);
    }
  );
}

// --- FIRESTORE CREW ROSTER & FIREBASE AUTH HELPERS ---

/**
 * Provisions a user into Firebase Auth without signing out the currently active admin session.
 * Utilizes an ephemeral secondary Firebase App instance.
 */
export async function createCrewFirebaseAuthUser(
  email: string, 
  password: string, 
  displayName?: string
): Promise<{ success: boolean; uid?: string; error?: string }> {
  const config = getEffectiveFirebaseConfig();
  const secondaryAppName = `SecondaryAuth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let secondaryApp: any = null;

  try {
    secondaryApp = initializeApp(config, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    const userCred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);

    if (displayName && userCred.user) {
      try {
        await updateProfile(userCred.user, { displayName: displayName.trim() });
      } catch {
        // non-blocking
      }
    }

    const uid = userCred.user.uid;
    await signOut(secondaryAuth);
    return { success: true, uid };
  } catch (err: any) {
    console.error('Firebase Auth crew provisioning error:', err);
    let errorMessage = err.message || 'Failed to create user in Firebase Auth';
    if (err.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered in Firebase Auth.';
    } else if (err.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use at least 6 characters.';
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address provided.';
    }
    return { success: false, error: errorMessage };
  } finally {
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch {
        // ignore secondary app deletion error
      }
    }
  }
}

export async function saveCrewToFirestore(crewMember: CrewMember): Promise<void> {
  const path = `crew/${crewMember.id}`;
  try {
    await setDoc(doc(db, 'crew', crewMember.id), crewMember);
    if (rtdb) {
      await set(ref(rtdb, `crew/${crewMember.id}`), crewMember);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCrewFromFirestore(crewMemberId: string): Promise<void> {
  const path = `crew/${crewMemberId}`;
  try {
    await deleteDoc(doc(db, 'crew', crewMemberId));
    if (rtdb) {
      await remove(ref(rtdb, `crew/${crewMemberId}`));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToFirestoreCrew(onUpdate: (crew: CrewMember[]) => void): Unsubscribe {
  const path = 'crew';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const crewList: CrewMember[] = [];
      snapshot.forEach((doc) => {
        crewList.push(doc.data() as CrewMember);
      });
      onUpdate(crewList);
    },
    (error) => {
      console.warn('Crew listener notice (sign in to sync live with Cloud Firestore):', error.message);
    }
  );
}

export function subscribeToRealtimeCrew(onUpdate: (crew: CrewMember[]) => void): (() => void) | null {
  if (!rtdb) return null;
  try {
    const crewRef = ref(rtdb, 'crew');
    return onValue(crewRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const list: CrewMember[] = Object.values(val);
        onUpdate(list);
      }
    });
  } catch (err) {
    console.warn('Realtime Database crew listener error:', err);
    return null;
  }
}

export default app;
