import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from '../types/index';

const AuthContext = createContext<{
  user: User | null;
  login: () => Promise<User>; // No longer needs an email string!
  logout: () => void;
  updateUserAffiliation: (affiliation: string) => Promise<void>;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This automatically keeps the user logged in if they refresh the page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (): Promise<User> => {
    try {
      // 1. Trigger Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Optional: Force institutional emails only (uncomment if needed)
      // if (!firebaseUser.email?.endsWith('@neu.edu')) {
      //   await signOut(auth);
      //   throw new Error("Unauthorized email. Please use your @neu.edu account.");
      // }

      // 2. Check if this user exists in our Firestore 'users' collection
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let userData: User;

      if (userSnap.exists()) {
        // Returning User
        userData = { id: firebaseUser.uid, ...userSnap.data() } as User;
        if (userData.isBlocked) {
          await signOut(auth);
          throw new Error("Your account has been suspended.");
        }
      } else {
        // Brand New User! Save them to Firestore
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Unknown User',
          role: 'user', // Default role
          affiliation: null, // Needs onboarding
          isBlocked: false,
        };
        
        // Write to Firestore (excluding the ID from the actual document body to save space)
        await setDoc(userRef, {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          affiliation: userData.affiliation,
          isBlocked: userData.isBlocked
        });
      }

      setUser(userData);
      return userData;
    } catch (error: any) {
      console.error("Login Error:", error);
      throw new Error(error.message || "Failed to sign in.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUserAffiliation = async (affiliation: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.id);
    
    // Update Firestore
    await updateDoc(userRef, { affiliation });
    
    // Update local React state instantly
    setUser({ ...user, affiliation });
  };

  // Don't render the app until Firebase has checked if the user is already logged in
  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading Auth...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserAffiliation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};