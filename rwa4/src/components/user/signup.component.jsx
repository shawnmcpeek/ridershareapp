import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithGoogleRedirect } from "../../utils/firebase/firebase.utils";
import { auth, db } from "../../utils/firebase/firebase.utils";
import { doc, setDoc, getDoc } from "firebase/firestore";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Check if the password and confirm password fields match
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);

      // Check if the user already exists in the database
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        throw new Error("User already exists. Please sign in instead.");
      }

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        fullname: fullName,
        address: "",
        phone: "",
        DOB: "",
      });

      // Clear the form fields
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
    } catch (error) {
      console.error("Error signing up", error);
      // Display an error message to the user
      alert(error.message);
    }
  };

  const handleGoogleSignUp = () => {
    signInWithGoogleRedirect();
  };

  return (
    <div className="sign-up-container">
      <h2>Sign Up</h2>
      <button onClick={handleGoogleSignUp} className="secondary-button">
        <img
          src="/google-icon-logo-svgrepo-com.svg"
          alt="Google Logo"
          style={{ marginRight: "8px", height: "10px" }}
          
        />
        Sign up with Google
      </button>
      <form onSubmit={handleSignUp} className="secondary-button">
        <input
          type="email"
          placeholder="Email"
          id="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <button type="submit" className="primary-button">
          Sign Up with Email/Password
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;
