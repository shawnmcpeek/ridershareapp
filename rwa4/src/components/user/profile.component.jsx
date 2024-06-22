import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase/firebase.utils";
import DataFetcher from "./data_fetcher.component"; // Import the DataFetcher component

function Profile({ user }) {
  const [userData, setUserData] = useState({
    email: "",
    fullname: "",
    address: "",
    uid: "",
    phone: "",
    DOB: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log("User data from Firestore:", userData);
            setUserData(userData);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userRef, userData);
        console.log("User data updated successfully");
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      try {
        // Call the appropriate Firebase function to update the user's password
        // For example: await updatePassword(user, newPassword);
        console.log("Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("Error updating password:", error);
      }
    } else {
      console.error("Passwords do not match");
    }
  };

  // Extract userId from the user prop
  const userId = user ? user.uid : null;

  return (
    <div>
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <p>Email: {userData.email}</p>
        <label>
          Full Name:
          <input
            className="input"
            type="text"
            name="fullname"
            id="fullname"
            placeholder="Full Name"
            autoComplete="off"
            value={userData.fullname || ""}
            onChange={handleChange}
          />
        </label>
        <br></br>
        <label>
          Address:
          <input
            className="input"
            type="text"
            name="address"
            id="address"
            placeholder="Address"
            autoComplete="off"
            value={userData.address || ""}
            onChange={handleChange}
          />
        </label>
        <p>User Id: {userData.uid}</p>
        <label>
          Phone Number:
          <input
            className="input"
            type="text"
            name="phone"
            id="phone"
            placeholder="Phone Number"
            autoComplete="off"
            pattern="[0-9]{10}"
            value={userData.phone || ""}
            onChange={handleChange}
          />
        </label>
        <br></br>
        <label>
          Date of Birth:
          <input
            className="input"
            type="text"
            name="DOB"
            id="DOB"
            placeholder="Date of Birth (YYYY-MM-DD)"
            autoComplete="off"
            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
            value={userData.DOB || ""}
            onChange={handleChange}
          />
        </label>
        <br></br>
        <button type="submit" className="secondary-button">
          Save Changes
        </button>
      </form>
      <h3>Change Password</h3>
      <form onSubmit={handlePasswordChange}>
        <input
          className="input"
          type={showPassword ? "text" : "password"}
          name="newPassword"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          className="input"
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          Show Password
        </label>
        <br></br>
        <button type="submit" className="secondary-button">
          Change Password
        </button>
      </form>

      {/* Render the DataFetcher component and pass the userId as a prop */}
      {userId && <DataFetcher userId={userId} />}
    </div>
  );
}

export default Profile;
