// src/components/User.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./login.component";
import SignUp from "./signup.component";
import Profile from "./profile.component";
import "../../App.scss";
import { useAuth } from "../../utils/firebase/firebase.utils"; // Import the useAuth hook
import ExportData from "./export-data.component"; // Import the ExportData component
import BugHelpSection from "./bug_contact.component";
import DisclaimerComponent from "./disclaimer.component";
import AboutComponent from "./faq.component";

const User = () => {
  const { user } = useAuth(); // Get the user object from the useAuth hook

  return (
    <div className="app-container">
      <div className="main-content">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "2rem",
          }}
        >
          <button className="primary-button">
            <Link to="login">Login/Logout</Link>
          </button>
          <button className="primary-button">
            <Link to="signup">Sign Up</Link>
          </button>
          <button className="primary-button">
            <Link to="profile">Profile</Link>
          </button>
          <button className="primary-button">
            <Link to="export">Export Annual Data</Link>
          </button>
          <button className="primary-button">
            <Link to="disclaimer">Disclaimer</Link>
          </button>
          <button className="primary-button">
            <Link to="about">About</Link>
          </button>
          <button className="primary-button">
            <Link to="bug_contact">Bug/Help</Link>
          </button>
        </div>
      </div>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="profile" element={<Profile user={user} />} />
        <Route path="export" element={<ExportData user={user} />} />
        <Route path="disclaimer" element={<DisclaimerComponent />} />
        <Route path="about" element={<AboutComponent />} />
        <Route path="bug_contact" element={<BugHelpSection />} />
      </Routes>
    </div>
  );
};

export default User;
