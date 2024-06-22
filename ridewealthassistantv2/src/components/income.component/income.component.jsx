import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../utils/firebase/firebase.utils";
import "../../App.scss";

function IncomeComponent({ userId }) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentDate = new Date(date);
    const incomeValue = parseFloat(amount);

    if (isNaN(incomeValue) || !currentDate || !source) {
      console.error("Invalid income input.");
      return;
    }

    const incomeData = {
      date: currentDate,
      amount: incomeValue,
      source: source,
      userId: userId,
    };

    console.log("Income data to be saved:", incomeData);

    try {
      const docRef = await addDoc(
        collection(getFirestore(app), "income"),
        incomeData
      );
      console.log("Income document written with ID:", docRef.id);
      setDate("");
      setAmount("");
      setSource("");
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <h2>Enter Income</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-row">
              <label>
                <span>Date of Income:</span>
                <input
                  className="input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>
              <label>
                <span>Income Amount:</span>
                <input
                  className="input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="input-row">
              <label>
                <span>Income Source:</span>
                <input
                  className="input"
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>
          <button className="primary-button" type="submit">
            Save Income
          </button>
        </form>
      </div>
    </div>
  );
}

export default IncomeComponent;
