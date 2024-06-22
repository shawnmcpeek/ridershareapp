import React, { useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../utils/firebase/firebase.utils";
import { doc, setDoc, getDoc } from "firebase/firestore";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);

      // Check if the user already exists in the database
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        // User doesn't exist, create a new user document
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          fullname: user.displayName,
          address: "",
          phone: "",
          DOB: "",
        });
      }
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };
  const signInWithEmail = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);

      // Check if the user already exists in the database
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        // User doesn't exist, create a new user document
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          fullname: "",
          address: "",
          phone: "",
          DOB: "",
        });
      }

      // Clear the form fields
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Email/password sign-in failed", error);
    }
  };

  return (
    <div className="sign-in-container">
      <h2>Sign In with Google</h2>
      <button className="primary-button" onClick={signInWithGoogle}>
        <img
          src="/google-icon-logo-svgrepo-com.svg"
          alt="Google Logo"
          height="14"
          style={{ paddingRight: "5px" }}
        />
        Sign In With Google
      </button>

      <h2>Sign In with Email/Password</h2>
      <form onSubmit={signInWithEmail}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="primary-button">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default SignInForm;
