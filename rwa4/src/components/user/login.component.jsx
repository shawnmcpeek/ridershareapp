import React, { useState, useEffect } from "react";
import {
  signInWithGoogleRedirect,
  handleRedirectResult,
  signInWithEmailAndPassword,
  signOut,
  auth,
} from "../../utils/firebase/firebase.utils";
import { sendPasswordResetEmail } from "firebase/auth";
import "../../App.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          console.log("User signed in through redirect:", result.user);
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };

    checkRedirectResult();
  }, []);

  const handleGoogleSignIn = () => {
    signInWithGoogleRedirect();
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error signing in with email and password", error);
      showToast("Error signing in. Please try again.", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast("You have been logged out", "success");
    } catch (error) {
      console.error("Error signing out", error);
      showToast("Error signing out. Please try again.", "error");
    }
  };

  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, recoveryEmail);
      console.log("Password recovery email sent to:", recoveryEmail);
      setRecoveryEmail("");
      showToast(
        "Password recovery email sent. Please check your inbox.",
        "success"
      );
    } catch (error) {
      console.error("Error sending password recovery email", error);
      showToast("Error sending recovery email. Please try again.", "error");
    }
  };

  const showToast = (message, type) => {
    setToastMessage(message);
    if (type === "success") {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } else if (type === "error") {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } else if (type === "logout") {
      setShowLogoutToast(true);
      setTimeout(() => setShowLogoutToast(false), 3000);
    }
  };

  return (
    <div>
      {showLogoutToast && (
        <div className="toast logout-toast">You have been logged out</div>
      )}
      {showSuccessToast && (
        <div className="toast success-toast">{toastMessage}</div>
      )}
      {showErrorToast && (
        <div className="toast error-toast">{toastMessage}</div>
      )}
      <h2>Login</h2>
      <button onClick={handleGoogleSignIn} className="secondary-button">
        <img
          src="/google-icon-logo-svgrepo-com.svg"
          alt="Google Logo"
          style={{ marginRight: "8px", height: "10px" }}
        />
        Sign in with Google
      </button>
      <form onSubmit={handleEmailSignIn}>
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
        <button type="submit" className="secondary-button">
          Sign in with Email/Password
        </button>
      </form>
      <button onClick={handleLogout} className="secondary-button">
        Logout
      </button>
      <form onSubmit={handlePasswordRecovery}>
        <input
          type="email"
          placeholder="Recovery Email"
          id="recoveryEmail"
          value={recoveryEmail}
          onChange={(e) => setRecoveryEmail(e.target.value)}
          required
        />
        <button type="submit" className="secondary-button">
          Recover Password
        </button>
      </form>
    </div>
  );
};

export default Login;
