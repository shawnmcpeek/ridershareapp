import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../utils/firebase/firebase.utils";
import TimeSelectComponent from "../time_select.component/time_select.component";
import mileageRates from "./mileagerates";

const MileagePullComponent = () => {
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [selectedYear, setSelectedYear] = useState("2024"); // Changed to string
  const [totalMileage, setTotalMileage] = useState(0);
  const [mileageExpense, setMileageExpense] = useState(0);

  useEffect(() => {
    const fetchMileageEntries = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "drivermileage")
        );
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

        const totalMileage = calculateTotalMileage(filteredEntries);
        setTotalMileage(totalMileage);

        const mileageExpense = calculateMileageExpense(totalMileage);
        setMileageExpense(mileageExpense);
      } catch (error) {
        console.error("Error fetching mileage entries:", error);
      }
    };

    fetchMileageEntries();
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

  const calculateTotalMileage = (entries) => {
    let totalMileage = 0;

    const entriesByDate = entries.reduce((acc, entry) => {
      const dateStr = entry.date.toDate().toDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(entry);
      return acc;
    }, {});

    Object.values(entriesByDate).forEach((dailyEntries) => {
      let dailyMileage = 0;
      const startEntry = dailyEntries.find(
        (entry) => entry.start_end === "start"
      );
      const endEntry = dailyEntries.find((entry) => entry.start_end === "end");
      if (startEntry && endEntry) {
        dailyMileage = endEntry.mileage - startEntry.mileage;
      }
      totalMileage += dailyMileage;
    });

    return totalMileage;
  };

  const calculateMileageExpense = (totalMileage) => {
    const rate = getMileageRate(selectedYear);
    return totalMileage * rate;
  };

  const getMileageRate = (year) => {
    const entry = mileageRates.find((rate) => {
      const startDate = new Date(rate.startDate);
      const endDate = new Date(rate.endDate);
      const selectedDate = new Date(`${year}-01-01`);
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    return entry ? entry.rate : 0;
  };

  const handleTimeRangeSelect = (quarter, year) => {
    setSelectedQuarter(quarter);
    setSelectedYear(year);
  };

  return (
    <div>
      <h1>
        Total Mileage for {selectedQuarter} {selectedYear}: {totalMileage}
      </h1>
      <h2>
        Mileage Expense for {selectedQuarter} {selectedYear}: $
        {mileageExpense.toFixed(2)}
      </h2>
      <TimeSelectComponent onSelect={handleTimeRangeSelect} />
    </div>
  );
};

export default MileagePullComponent;
