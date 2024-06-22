import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import SignInForm from "./login.component";
import SignUpForm from "./signup.component";
import Profile from "./profile.component";
import { auth, firebase } from "../../utils/firebase/firebase.utils";
import BugHelpSection from "./bug_contact.component";
import ExportDataComponent from "./exporttocsv.component";
import FAQComponent from "./faq.component";
//import DisclaimerComponent from "./disclaimer.component";
import "../../App.scss";

function UserComponent({ user }) {
  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <div>
      <div className="input-group">
        <div className="input-row">
          {user ? (
            <>
              <Link className="primary-button" to="/user/profile">
                User Profile
              </Link>
              <button className="primary-button" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link className="primary-button" to="/user/login">
                Login/Logout
              </Link>
              <Link className="primary-button" to="/user/signup">
                Sign Up
              </Link>
            </>
          )}
          <Link className="primary-button" to="/user/bug-feature">
            Submit a Bug/Feature/Get Help
          </Link>
          <Link className="primary-button" to="/user/export">
            Export Financial Data
          </Link>
          <Link className="primary-button" to="/user/about">
            About
          </Link>
          <Link className="primary-button" to="/user/legal">
            Legal
          </Link>
        </div>
      </div>
      <Routes>
        <Route path="login" element={<SignInForm />} />
        <Route path="signup" element={<SignUpForm />} />
        <Route path="profile" element={<Profile user={user} />} />
        <Route path="bug-feature" element={<BugHelpSection />} />
        <Route
          path="export"
          element={<ExportDataComponent userId={user?.uid} />}
        />
        <Route path="about" element={<FAQComponent />} />
      </Routes>
    </div>
  );
}

export default UserComponent;
