import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../utils/firebase/firebase.utils";
import TimeSelectComponent from "../time_select.component/time_select.component";

const ExpensePullComponent = () => {
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const fetchExpenseEntries = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "expenses"));
        const entries = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched entries:", entries);

        let filteredEntries = [];

        if (selectedQuarter.startsWith("Total")) {
          filteredEntries = entries.filter((entry) => {
            const date = entry.date; // Assuming 'date' is stored as a Firestore Timestamp
            if (!date) return false;
            const year = date.toDate().getFullYear(); // Convert Firestore Timestamp to JavaScript Date
            return year === Number(selectedYear);
          });
        } else {
          filteredEntries = entries.filter((entry) => {
            const date = entry.date; // Assuming 'date' is stored as a Firestore Timestamp
            if (!date) return false;
            const month = date.toDate().getMonth();
            const year = date.toDate().getFullYear();
            const isInSelectedQuarter =
              month >= getQuarterStartMonth(selectedQuarter) &&
              month <= getQuarterEndMonth(selectedQuarter);
            const isInSelectedYear = year === Number(selectedYear);
            return isInSelectedQuarter && isInSelectedYear;
          });
        }

        console.log("Filtered entries:", filteredEntries);

        const totalExpenses = calculateTotalExpenses(filteredEntries);
        console.log("Total Expenses:", totalExpenses);
        setTotalExpenses(totalExpenses);
      } catch (error) {
        console.error("Error fetching expense entries:", error);
      }
    };

    fetchExpenseEntries();
  }, [selectedQuarter, selectedYear]);

  const getQuarterStartMonth = (quarter) => {
    switch (quarter) {
      case "Q1":
        return 0; // January
      case "Q2":
        return 3; // April
      case "Q3":
        return 6; // July
      case "Q4":
        return 9; // October
      default:
        return 0;
    }
  };

  const getQuarterEndMonth = (quarter) => {
    switch (quarter) {
      case "Q1":
        return 2; // March
      case "Q2":
        return 5; // June
      case "Q3":
        return 8; // September
      case "Q4":
        return 11; // December
      default:
        return 0;
    }
  };

  const calculateTotalExpenses = (entries) => {
    let totalExpenses = 0;

    entries.forEach((entry) => {
      totalExpenses += parseFloat(entry.amount);
    });

    return totalExpenses;
  };

  const handleTimeRangeSelect = (quarter, year) => {
    setSelectedQuarter(quarter);
    setSelectedYear(year);
  };

  return (
    <div>
      <h1>
        Total Expenses for {selectedQuarter} {selectedYear}: {totalExpenses}
      </h1>
      <TimeSelectComponent onSelect={handleTimeRangeSelect} />
    </div>
  );
};

export default ExpensePullComponent;
