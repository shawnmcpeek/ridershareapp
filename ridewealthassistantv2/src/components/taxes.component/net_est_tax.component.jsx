import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase/firebase.utils";
import TimeSelectComponent from "../time_select.component/time_select.component";
import mileageRates from "./mileagerates";

function TaxEstimationComponent() {
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [irsPayment, setIrsPayment] = useState(0);
  const [statePayment, setStatePayment] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalMileage, setTotalMileage] = useState(0);
  const [mileageExpense, setMileageExpense] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    const fetchIncomeEntries = async () => {
      try {
        const incomeSnapshot = await getDocs(collection(db, "income"));
        const incomeEntries = incomeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        let incomeTotal = 0;
        if (selectedQuarter && selectedYear) {
          const filteredIncomeEntries = incomeEntries.filter((entry) => {
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
          incomeTotal = calculateTotalIncome(filteredIncomeEntries);
          setTotalIncome(incomeTotal);
          calculateEstimatedTaxPayments(
            incomeTotal,
            totalExpenses,
            mileageExpense
          );
        }
      } catch (error) {
        console.error("Error fetching income entries:", error);
      }
    };

    const fetchExpenseEntries = async () => {
      try {
        const expenseSnapshot = await getDocs(collection(db, "expenses"));
        const expenseEntries = expenseSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        let totalExpenses = 0;
        if (selectedQuarter && selectedYear) {
          const filteredExpenseEntries = expenseEntries.filter((entry) => {
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
          totalExpenses = calculateTotalExpenses(filteredExpenseEntries);
          setTotalExpenses(totalExpenses);
        }
      } catch (error) {
        console.error("Error fetching expense entries:", error);
      }
    };

    const fetchMileageEntries = async () => {
      try {
        const mileageSnapshot = await getDocs(collection(db, "drivermileage"));
        const mileageEntries = mileageSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        let totalMileage = 0;
        let mileageExpense = 0;
        if (selectedQuarter && selectedYear) {
          const filteredMileageEntries = mileageEntries.filter((entry) => {
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
          totalMileage = calculateTotalMileage(filteredMileageEntries);
          setTotalMileage(totalMileage);
          mileageExpense = calculateMileageExpense(totalMileage);
          setMileageExpense(mileageExpense);
        }
      } catch (error) {
        console.error("Error fetching mileage entries:", error);
      }
    };

    fetchIncomeEntries();
    fetchExpenseEntries();
    fetchMileageEntries();
  }, [selectedQuarter, selectedYear]);

  useEffect(() => {
    // Calculate total profit whenever total income, total expenses, or mileage expense changes
    const profit = totalIncome - totalExpenses - mileageExpense;
    setTotalProfit(profit);
  }, [totalIncome, totalExpenses, mileageExpense]);

  useEffect(() => {
    // Calculate estimated tax payments whenever total income, total expenses, or mileage expense changes
    calculateEstimatedTaxPayments(totalIncome, totalExpenses, mileageExpense);
  }, [totalIncome, totalExpenses, mileageExpense]);

  const calculateEstimatedTaxPayments = (
    totalIncome,
    totalExpenses,
    mileageExpense
  ) => {
    const totalProfit = totalIncome - totalExpenses - mileageExpense;
    const irsPayment = totalProfit * 0.15;
    const statePayment = totalProfit * 0.05;
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

  const calculateTotalExpenses = (entries) => {
    return entries.reduce(
      (total, entry) => total + parseFloat(entry.amount),
      0
    );
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
    <div className="app-container">
      <div>
        <h2>Net Estimated Tax Calculator</h2>
        <TimeSelectComponent onSelect={handleTimeRangeSelect} />

        {selectedQuarter && selectedYear && (
          <div>
            <h3>Selected Quarter: {selectedQuarter}</h3>
            <h3>Selected Year: {selectedYear}</h3>
            <h3>Financial Data:</h3>
            <p>Total Income: ${totalIncome.toFixed(2)}</p>
            <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>
            <p>Total Mileage: {totalMileage} miles</p>
            <p>Mileage Expense: ${mileageExpense.toFixed(2)}</p>
            <p>Total Profit: ${totalProfit.toFixed(2)}</p>
            <p>IRS Payment: ${irsPayment.toFixed(2)}</p>
            <p>State Income Tax Payment: ${statePayment.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaxEstimationComponent;
