import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase/firebase.utils";
import TimeSelectComponent from "../time_select.component/time_select.component";

function GrossEstimatedTaxPaymentComponent() {
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [irsPayment, setIrsPayment] = useState(0);
  const [statePayment, setStatePayment] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const fetchIncomeEntries = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "income"));
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

        if (selectedQuarter && selectedYear) {
          calculateEstimatedTaxPayments(totalIncome);
        }
      } catch (error) {
        console.error("Error fetching income entries:", error);
      }
    };

    fetchIncomeEntries();
  }, [selectedQuarter, selectedYear]);

  const calculateEstimatedTaxPayments = (incomeTotal) => {
    // Calculate IRS payment (15%)
    const irsPayment = incomeTotal * 0.15;

    // Calculate state income tax payment (5%)
    const statePayment = incomeTotal * 0.05;

    setIrsPayment(irsPayment);
    setStatePayment(statePayment);
  };

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
      <h2>Gross Estimated Tax Payment Component</h2>
      <TimeSelectComponent onSelect={handleTimeRangeSelect} />

      {selectedQuarter && selectedYear && (
        <div>
          <h3>Selected Quarter: {selectedQuarter}</h3>
          <h3>Selected Year: {selectedYear}</h3>
          <h3>Estimated Tax Payments:</h3>
          <p>IRS Payment: ${irsPayment.toFixed(2)}</p>
          <p>State Income Tax Payment: ${statePayment.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default GrossEstimatedTaxPaymentComponent;
