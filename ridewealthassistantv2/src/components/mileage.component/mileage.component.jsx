import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../utils/firebase/firebase.utils";
import "../../App.scss";

function MileageComponent({ uid }) {
  const [startMileage, setStartMileage] = useState("");
  const [savedStartMileage, setSavedStartMileage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endMileage, setEndMileage] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStartMileageChange = (e) => {
    setStartMileage(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndMileageChange = (e) => {
    setEndMileage(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleSaveStartMileage = () => {
    // Save start mileage locally
    setSavedStartMileage(startMileage);
  };

  const handleSubmit = async () => {
    try {
      // Format the data for Firestore database entry
      const startMileageEntry = {
        date: new Date(startDate),
        mileage: parseInt(startMileage),
        start_end: "start",
        userId: uid,
      };

      const endMileageEntry = {
        date: new Date(endDate),
        mileage: parseInt(endMileage),
        start_end: "end",
        userId: uid,
      };

      // Save startMileageEntry and endMileageEntry to Firestore database
      const startMileageDocRef = await addDoc(
        collection(db, "drivermileage"),
        startMileageEntry
      );

      const endMileageDocRef = await addDoc(
        collection(db, "drivermileage"),
        endMileageEntry
      );

      console.log(
        "Start Mileage Document added with ID: ",
        startMileageDocRef.id
      );
      console.log("End Mileage Document added with ID: ", endMileageDocRef.id);

      // Reset input fields after submission
      setStartMileage("");
      setStartDate("");
      setEndMileage("");
      setEndDate("");
      setSavedStartMileage(""); // Clear saved start mileage
    } catch (error) {
      console.error("Error adding mileage entry: ", error);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <h2>Enter Mileage</h2>
        <div className="input-group">
          <div className="input-row">
            <label>
              <span>Start Mileage:</span>
              <input
                className="input"
                type="number"
                name="startMileage"
                value={startMileage}
                onChange={handleStartMileageChange}
                placeholder={
                  savedStartMileage ? savedStartMileage : "Enter Start Mileage"
                }
              />
            </label>
            <label>
              <span>Start Date:</span>
              <input
                className="input"
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </label>
          </div>
          <button className="primary-button" onClick={handleSaveStartMileage}>
            Save Start Mileage
          </button>
        </div>

        <div className="input-group">
          <div className="input-row">
            <label>
              <span>End Mileage:</span>
              <input
                className="input"
                type="number"
                name="endMileage"
                value={endMileage}
                onChange={handleEndMileageChange}
                placeholder="End Mileage"
              />
            </label>
            <label>
              <span>End Date:</span>
              <input
                className="input"
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </label>
          </div>
          <button className="primary-button" onClick={handleSubmit}>
            Submit Mileage Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default MileageComponent;
