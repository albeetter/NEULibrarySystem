import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace this object with your actual config from the Firebase Console!
const firebaseConfig = {
  apiKey: "AIzaSyALJRIXGOSNG9Ovtuy7flSFOhOWCXs7Bek",
  authDomain: "neu-library-check-in.firebaseapp.com",
  databaseURL: "https://neu-library-check-in-default-rtdb.firebaseio.com",
  projectId: "neu-library-check-in",
  storageBucket: "neu-library-check-in.firebasestorage.app",
  messagingSenderId: "434495167129",
  appId: "1:434495167129:web:23cebabdedf5831695f608",
  measurementId: "G-3GB37RH4QW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);