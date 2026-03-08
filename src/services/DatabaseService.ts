import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, doc, updateDoc, where, setDoc } from 'firebase/firestore';


export const DatabaseService = {
  
  // 1. Log a new visit to Firestore
  logVisit: async (userId: string, userName: string, userAffiliation: string, purpose: string) => {
    const visitsRef = collection(db, 'visits');
    
    const newVisit = {
      userId,
      userName, // We save the name and affiliation directly with the visit so the admin table loads super fast!
      userAffiliation,
      purpose,
      timestamp: new Date().toISOString()
    };
    
    // addDoc auto-generates a unique ID for this visit document
    const docRef = await addDoc(visitsRef, newVisit);
    return { id: docRef.id, ...newVisit };
  },

  // 2. Fetch all visits for the Admin Dashboard
  getAllVisits: async () => {
    const visitsRef = collection(db, 'visits');
    // Fetch them ordered by newest first
    const q = query(visitsRef, orderBy('timestamp', 'desc')); 
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // 3. Listen to all visits in REAL-TIME
  subscribeToVisits: (callback: (visits: any[]) => void) => {
    const visitsRef = collection(db, 'visits');
    const q = query(visitsRef, orderBy('timestamp', 'desc')); 
    
    // onSnapshot opens a live connection to this query
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liveVisits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Send the live data back to the React component
      callback(liveVisits); 
    });

    // We return 'unsubscribe' so React can close the connection if the admin leaves the page
    return unsubscribe; 
  },

  // 4. Listen to all users in REAL-TIME for the Admin User Management
  subscribeToUsers: (callback: (users: any[]) => void) => {
    const usersRef = collection(db, 'users');
    // Fetch users, you can also add orderBy('name') if desired
    const q = query(usersRef); 
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liveUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(liveUsers);
    });

    return unsubscribe;
  },

  // 5. Update a user's block status
  updateUserBlockStatus: async (userId: string, isBlocked: boolean, blockReason: string = "") => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      isBlocked,
      blockReason: isBlocked ? blockReason : null // Clear reason if unblocking
    });
  },

  // 6. Listen to a specific user's visits in REAL-TIME
  subscribeToUserVisits: (userId: string, callback: (visits: any[]) => void) => {
    const visitsRef = collection(db, 'visits');
    // We query by userId. 
    const q = query(visitsRef, where('userId', '==', userId));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userVisits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side by newest first to avoid needing a Firestore composite index setup
      userVisits.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      callback(userVisits);
    });

    return unsubscribe;
  },

  // 7. Listen to Library Status (Overcrowded Alert)
  subscribeToLibraryStatus: (callback: (status: any) => void) => {
    const statusRef = doc(db, 'settings', 'libraryStatus');
    const unsubscribe = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback({ isOvercrowded: false }); // Default fallback
      }
    });
    return unsubscribe;
  },

  // 8. Admin Override: Trigger Overcrowded Alert
  updateLibraryStatus: async (isOvercrowded: boolean) => {
    const statusRef = doc(db, 'settings', 'libraryStatus');
    // setDoc with merge creates the document if it's missing!
    await setDoc(statusRef, { isOvercrowded }, { merge: true }); 
  }


};