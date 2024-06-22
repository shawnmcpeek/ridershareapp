import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase/firebase.utils";

function Profile({ user }) {
  const [userData, setUserData] = useState({
    email: "",
    fullname: "",
    address: "",
    uid: "",
    phone: "",
    DOB: "",
  });

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

  return (
    <div>
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <p>Email: {userData.email}</p>
        <label>
          Full Name:
          <input
            type="text"
            name="fullname"
            value={userData.fullname || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Address:
          <input
            type="text"
            name="address"
            value={userData.address || ""}
            onChange={handleChange}
          />
        </label>
        <p>User Id: {userData.uid}</p>
        <label>
          Phone Number:
          <input
            type="text"
            name="phone"
            value={userData.phone || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Date of Birth:
          <input
            type="text"
            name="DOB"
            value={userData.DOB || ""}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default Profile;
