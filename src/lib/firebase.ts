import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  CropListing,
  Order,
  MachineItem,
  RentalRequest,
  AIRecommendationRecord
} from '../types';
import { INITIAL_MARKETPLACE_CROPS } from '../data/marketplaceData';
import { INITIAL_ORDERS } from '../data/ordersData';
import { INITIAL_MACHINERY, INITIAL_RENTAL_REQUESTS } from '../data/machineryData';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper to format phone into auth email if phone is used
export const formatAuthEmail = (identifier: string, role: 'farmer' | 'buyer'): string => {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes('@')) {
    return clean;
  }
  // Convert digits-only phone to domain-backed email
  const digits = clean.replace(/\D/g, '');
  return `${role}_${digits || 'user'}@krishisetu.farm`;
};

// ==========================================
// AUTHENTICATION SERVICES
// ==========================================

export const registerWithFirebase = async (
  identifier: string,
  password: string,
  profileData: Omit<UserProfile, 'uid'>
): Promise<UserProfile> => {
  const email = formatAuthEmail(identifier, profileData.role);
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  const fullProfile: UserProfile = {
    ...profileData,
    uid: firebaseUser.uid,
    email: profileData.email || email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Persist user profile to Firestore 'users' collection
  try {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, fullProfile);
  } catch (err) {
    console.warn('Firestore user profile write notice:', err);
  }

  return fullProfile;
};

export const loginWithFirebase = async (
  identifier: string,
  password: string,
  role: 'farmer' | 'buyer'
): Promise<UserProfile> => {
  const email = formatAuthEmail(identifier, role);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Retrieve existing user profile from Firestore 'users'
  try {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return { ...userDocSnap.data(), uid: firebaseUser.uid } as UserProfile;
    }
  } catch (err) {
    console.warn('Could not read user profile from firestore:', err);
  }

  // Fallback profile if record not found in firestore
  const fallbackProfile: UserProfile = {
    uid: firebaseUser.uid,
    name: role === 'farmer' ? 'Kisan Member' : 'Buyer Enterprise',
    phone: identifier.replace(/\D/g, '') || '9876543210',
    email: firebaseUser.email || email,
    role,
    location: role === 'farmer' ? 'Ujjain, Madhya Pradesh' : 'Azadpur Mandi, Delhi',
    specializationOrBusiness: role === 'farmer' ? 'Wheat & Soybean' : 'Bulk Procurement',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', firebaseUser.uid), fallbackProfile);
  } catch (e) {
    console.warn('Fallback profile creation notice:', e);
  }

  return fallbackProfile;
};

// Demo 1-Click login helper ensuring real Firebase Auth session
export const loginDemoUser = async (role: 'farmer' | 'buyer'): Promise<UserProfile> => {
  const demoEmail = role === 'farmer' ? 'farmer.demo@krishisetu.farm' : 'buyer.demo@krishisetu.farm';
  const demoPass = 'KrishiSetu@2026';

  let firebaseUser: FirebaseUser | null = null;

  try {
    // Attempt sign in
    const cred = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
    firebaseUser = cred.user;
  } catch (err: any) {
    // If account doesn't exist yet, create it
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        firebaseUser = cred.user;
      } catch (createErr) {
        // As a resilient fallback, anonymous sign-in
        const anonCred = await signInAnonymously(auth);
        firebaseUser = anonCred.user;
      }
    } else {
      const anonCred = await signInAnonymously(auth);
      firebaseUser = anonCred.user;
    }
  }

  const profile: UserProfile = role === 'farmer'
    ? {
        uid: firebaseUser?.uid || 'demo-farmer-ramesh',
        name: 'Ramesh Patel',
        phone: '9826012345',
        email: 'ramesh.patel@krishisetu.farm',
        role: 'farmer',
        location: 'Ujjain, Madhya Pradesh',
        specializationOrBusiness: 'Wheat, Mustard & Chickpea',
        createdAt: new Date().toISOString(),
      }
    : {
        uid: firebaseUser?.uid || 'demo-buyer-agrofoods',
        name: 'AgroFoods Traders & Co.',
        phone: '9811099887',
        email: 'procurement@agrofoods.in',
        role: 'buyer',
        location: 'Azadpur Mandi, Delhi NCR',
        specializationOrBusiness: 'Wholesale Grain & Pulse Buyer',
        createdAt: new Date().toISOString(),
      };

  if (firebaseUser?.uid) {
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
    } catch (e) {
      console.warn('Demo user profile set notice:', e);
    }
  }

  return profile;
};

export const logoutFirebase = async (): Promise<void> => {
  await signOut(auth);
};

// ==========================================
// FIRESTORE SEEDING (One-time initial sync)
// ==========================================

export const seedInitialFirestoreData = async () => {
  try {
    // 1. Seed crops if empty
    const cropsSnap = await getDocs(collection(db, 'cropListings'));
    if (cropsSnap.empty) {
      console.log('Seeding initial crop listings to Firestore...');
      for (const crop of INITIAL_MARKETPLACE_CROPS) {
        await setDoc(doc(db, 'cropListings', crop.id), {
          ...crop,
          farmerUid: 'demo-farmer-ramesh',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 2. Seed machinery if empty
    const machinerySnap = await getDocs(collection(db, 'machinery'));
    if (machinerySnap.empty) {
      console.log('Seeding initial machinery to Firestore...');
      for (const machine of INITIAL_MACHINERY) {
        await setDoc(doc(db, 'machinery', machine.id), {
          ...machine,
          ownerUid: 'demo-farmer-ramesh',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 3. Seed orders if empty
    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (ordersSnap.empty) {
      console.log('Seeding initial orders to Firestore...');
      for (const order of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', order.id), {
          ...order,
          farmerUid: 'demo-farmer-ramesh',
          buyerUid: 'demo-buyer-agrofoods',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 4. Seed rental requests if empty
    const rentalsSnap = await getDocs(collection(db, 'rentalRequests'));
    if (rentalsSnap.empty) {
      console.log('Seeding initial rental requests to Firestore...');
      for (const rental of INITIAL_RENTAL_REQUESTS) {
        await setDoc(doc(db, 'rentalRequests', rental.id), {
          ...rental,
          farmerUid: 'demo-farmer-ramesh',
          ownerUid: 'demo-farmer-ramesh',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Seeding initial data notice (offline/initialization):', err);
  }
};

// ==========================================
// CROP LISTINGS CRUD (Firestore)
// ==========================================

export const subscribeToCropListings = (
  onData: (crops: CropListing[]) => void,
  onError?: (err: any) => void
) => {
  const cropsRef = collection(db, 'cropListings');
  return onSnapshot(
    cropsRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_MARKETPLACE_CROPS);
        return;
      }
      const list: CropListing[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as CropListing);
      });
      onData(list);
    },
    (error) => {
      console.error('Firestore crop listings subscription error:', error);
      if (onError) onError(error);
      onData(INITIAL_MARKETPLACE_CROPS);
    }
  );
};

export const createCropListing = async (crop: CropListing, userUid?: string): Promise<void> => {
  const cropId = crop.id || `KS-CROP-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = doc(db, 'cropListings', cropId);
  const data = {
    ...crop,
    id: cropId,
    farmerUid: userUid || auth.currentUser?.uid || 'demo-farmer-ramesh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, data);
};

export const updateCropListing = async (cropId: string, updates: Partial<CropListing>): Promise<void> => {
  const docRef = doc(db, 'cropListings', cropId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCropListing = async (cropId: string): Promise<void> => {
  const docRef = doc(db, 'cropListings', cropId);
  await deleteDoc(docRef);
};

// ==========================================
// ORDERS CRUD (Firestore)
// ==========================================

export const subscribeToOrders = (
  onData: (orders: Order[]) => void,
  onError?: (err: any) => void
) => {
  const ordersRef = collection(db, 'orders');
  return onSnapshot(
    ordersRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_ORDERS);
        return;
      }
      const list: Order[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Order);
      });
      onData(list);
    },
    (error) => {
      console.error('Firestore orders subscription error:', error);
      if (onError) onError(error);
      onData(INITIAL_ORDERS);
    }
  );
};

export const createOrderInFirestore = async (order: Order, buyerUid?: string): Promise<void> => {
  const orderId = order.id || `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = doc(db, 'orders', orderId);
  const data = {
    ...order,
    id: orderId,
    buyerUid: buyerUid || auth.currentUser?.uid || 'demo-buyer-agrofoods',
    farmerUid: order.farmerUid || 'demo-farmer-ramesh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, data);
};

export const updateOrderInFirestore = async (orderId: string, updates: Partial<Order>): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteOrderInFirestore = async (orderId: string): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await deleteDoc(docRef);
};

// ==========================================
// MACHINERY & RENTALS CRUD (Firestore)
// ==========================================

export const subscribeToMachinery = (
  onData: (machinery: MachineItem[]) => void,
  onError?: (err: any) => void
) => {
  const machineryRef = collection(db, 'machinery');
  return onSnapshot(
    machineryRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_MACHINERY);
        return;
      }
      const list: MachineItem[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as MachineItem);
      });
      onData(list);
    },
    (error) => {
      console.error('Firestore machinery subscription error:', error);
      if (onError) onError(error);
      onData(INITIAL_MACHINERY);
    }
  );
};

export const createMachineryInFirestore = async (machine: MachineItem, ownerUid?: string): Promise<void> => {
  const id = machine.id || `MC-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = doc(db, 'machinery', id);
  await setDoc(docRef, {
    ...machine,
    id,
    ownerUid: ownerUid || auth.currentUser?.uid || 'demo-farmer-ramesh',
    createdAt: new Date().toISOString(),
  });
};

export const updateMachineryInFirestore = async (machineId: string, updates: Partial<MachineItem>): Promise<void> => {
  const docRef = doc(db, 'machinery', machineId);
  await updateDoc(docRef, updates);
};

export const deleteMachineryInFirestore = async (machineId: string): Promise<void> => {
  const docRef = doc(db, 'machinery', machineId);
  await deleteDoc(docRef);
};

export const subscribeToRentalRequests = (
  onData: (rentals: RentalRequest[]) => void,
  onError?: (err: any) => void
) => {
  const rentalsRef = collection(db, 'rentalRequests');
  return onSnapshot(
    rentalsRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_RENTAL_REQUESTS);
        return;
      }
      const list: RentalRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as RentalRequest);
      });
      onData(list);
    },
    (error) => {
      console.error('Firestore rental requests subscription error:', error);
      if (onError) onError(error);
      onData(INITIAL_RENTAL_REQUESTS);
    }
  );
};

export const createRentalRequestInFirestore = async (rental: RentalRequest, farmerUid?: string): Promise<void> => {
  const id = rental.id || `RR-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = doc(db, 'rentalRequests', id);
  await setDoc(docRef, {
    ...rental,
    id,
    farmerUid: farmerUid || auth.currentUser?.uid || 'demo-farmer-ramesh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateRentalRequestInFirestore = async (rentalId: string, updates: Partial<RentalRequest>): Promise<void> => {
  const docRef = doc(db, 'rentalRequests', rentalId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteRentalRequestInFirestore = async (rentalId: string): Promise<void> => {
  const docRef = doc(db, 'rentalRequests', rentalId);
  await deleteDoc(docRef);
};

// ==========================================
// AI RECOMMENDATIONS CRUD (Firestore)
// ==========================================

export const subscribeToUserAIRecommendations = (
  userUid: string,
  onData: (recs: AIRecommendationRecord[]) => void,
  onError?: (err: any) => void
) => {
  const recsRef = collection(db, 'aiRecommendations');
  const q = query(recsRef, where('userUid', '==', userUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: AIRecommendationRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as AIRecommendationRecord);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error) => {
      console.error('Firestore AI recommendations subscription error:', error);
      if (onError) onError(error);
    }
  );
};

export const saveAIRecommendationToFirestore = async (record: Partial<AIRecommendationRecord> & Record<string, any>): Promise<string> => {
  const id = record.id || `REC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const docRef = doc(db, 'aiRecommendations', id);
  await setDoc(docRef, {
    ...record,
    id,
    userUid: record.userUid || auth.currentUser?.uid || 'guest-farmer',
    createdAt: record.createdAt || new Date().toISOString(),
  });
  return id;
};

export const saveAIRecommendation = saveAIRecommendationToFirestore;

export const deleteAIRecommendationFromFirestore = async (recId: string): Promise<void> => {
  const docRef = doc(db, 'aiRecommendations', recId);
  await deleteDoc(docRef);
};

export const updateUserProfileInFirestore = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};
