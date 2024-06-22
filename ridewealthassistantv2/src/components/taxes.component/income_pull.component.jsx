import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../utils/firebase/firebase.utils";
import TimeSelectComponent from "../time_select.component/time_select.component";

const IncomePullComponent = () => {
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const fetchIncomeEntries = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "income"));
        const entries = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        let filteredEntries = [];

        if (selectedQuarter.startsWith("Total")) {
          filteredEntries = entries.filter((entry) => {
            const date = entry.date?.toDate();
            if (!date) return false;
            const year = date.getFullYear();
            return year === Number(selectedYear);
          });
        } else {
          filteredEntries = entries.filter((entry) => {
            const date = entry.date?.toDate();
            if (!date) return false;
            const month = date.getMonth();
            const year = date.getFullYear();
            const isInSelectedQuarter =
              month >= getQuarterStartMonth(selectedQuarter) &&
              month <= getQuarterEndMonth(selectedQuarter);
            const isInSelectedYear = year === Number(selectedYear);
            return isInSelectedQuarter && isInSelectedYear;
          });
        }

        const totalIncome = calculateTotalIncome(filteredEntries);
        setTotalIncome(totalIncome);
      } catch (error) {
        console.error("Error fetching income entries:", error);
      }
    };

    fetchIncomeEntries();
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

  const calculateTotalIncome = (entries) => {
    return entries.reduce((total, entry) => total + entry.amount, 0);
  };

  const handleTimeRangeSelect = (quarter, year) => {
    setSelectedQuarter(quarter);
    setSelectedYear(year);
  };

  return (
    <div>
      <h1>
        Total Income for {selectedQuarter} {selectedYear}: {totalIncome}
      </h1>
      <TimeSelectComponent onSelect={handleTimeRangeSelect} />
    </div>
  );
};

export default IncomePullComponent;
