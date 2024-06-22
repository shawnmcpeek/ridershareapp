// src/utils/firebase/firebase.utils.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";

import firebaseConfigTemplate from "./firebase.json";

const replaceEnvVariables = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = obj[key].replace(
      /\${([^}]+)}/g,
      (_, envVar) => process.env[envVar]
    );
    return acc;
  }, {});
};

const firebaseConfig = replaceEnvVariables(firebaseConfigTemplate);

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const signInWithGooglePopup = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    throw error;
  }
};

const signInWithGoogleRedirect = () => {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
};

const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    throw error;
  }
};

const signInAuthUserWithEmailAndPassword = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    throw error;
  }
};

const createAuthUserWithEmailAndPassword = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    throw error;
  }
};

// Custom hook to get the current user
export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return { user };
};

const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

export {
  app,
  analytics,
  auth,
  db,
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  handleRedirectResult,
  signInAuthUserWithEmailAndPassword,
  createAuthUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
};
