import React, { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  or,
  and,
} from "firebase/firestore";
import { db } from "../../utils/firebase/firebase.utils";
import mileageRates from "../taxes/mileagerates";
import { saveAs } from "file-saver";
import "../../App.scss";

const ExportData = ({ user }) => {
  const [fetchingData, setFetchingData] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");

  const exportToCsv = async () => {
    setFetchingData(true);

    try {
      const userId = user?.uid;
      console.log("Fetching data for selected year:", selectedYear);

      if (!userId) {
        throw new Error("User ID is undefined");
      }

      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

      const fetchCollectionData = async (collectionName) => {
        const collectionQuery = query(
          collection(db, collectionName),
          and(
            or(where("uid", "==", userId), where("userId", "==", userId)),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
          ),
          orderBy("date", "asc")
        );
        const snapshot = await getDocs(collectionQuery);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      };

      const incomeEntries = await fetchCollectionData("income");
      const expenseEntries = await fetchCollectionData("expenses");
      const mileageEntries = await fetchCollectionData("drivermileage");

      console.log("Fetched income entries:", incomeEntries);
      console.log("Fetched expense entries:", expenseEntries);
      console.log("Fetched mileage entries:", mileageEntries);

      const totalIncome = calculateTotalIncome(incomeEntries);
      const totalExpenses = calculateTotalExpenses(expenseEntries);
      const totalMileage = calculateTotalMileage(mileageEntries);
      const mileageExpense = calculateMileageExpense(
        totalMileage,
        selectedYear
      );
      const totalByCategory = calculateTotalByCategory(expenseEntries);

      console.log("Total income:", totalIncome);
      console.log("Total expenses:", totalExpenses);
      console.log("Total mileage:", totalMileage);
      console.log("Mileage expense:", mileageExpense);
      console.log("Total by category:", totalByCategory);

      let csvContent = `,${selectedYear},Total YTD\n`;
      csvContent += `Total Income,${totalIncome.toFixed(2)}\n`;
      csvContent += `Expenses\n`;

      Object.entries(totalByCategory).forEach(([category, amount]) => {
        csvContent += `${category},${amount.toFixed(2)}\n`;
      });

      csvContent += `Mileage Expense,${mileageExpense.toFixed(2)}\n`;
      csvContent += `Total Expenses,${(totalExpenses + mileageExpense).toFixed(
        2
      )}`;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `financial_data_${selectedYear}.csv`);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  // Helper functions
  const calculateTotalIncome = (entries) => {
    return entries.reduce(
      (total, entry) => total + parseFloat(entry.amount),
      0
    );
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
      const startEntry = dailyEntries.find(
        (entry) => entry.start_end === "start"
      );
      const endEntry = dailyEntries.find((entry) => entry.start_end === "end");
      if (startEntry && endEntry) {
        totalMileage += endEntry.mileage - startEntry.mileage;
      }
    });

    return totalMileage;
  };

  const calculateMileageExpense = (totalMileage, year) => {
    const rate = getMileageRate(year);
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

  const calculateTotalByCategory = (entries) => {
    const totalsByCategory = {};

    entries.forEach((entry) => {
      const category = entry.category;
      const amount = parseFloat(entry.amount);

      if (category && !isNaN(amount)) {
        if (!totalsByCategory[category]) {
          totalsByCategory[category] = 0;
        }
        totalsByCategory[category] += amount;
      }
    });

    return totalsByCategory;
  };

  // Rest of the component remains the same
  return (
    <div>
      <h3>Export Data</h3>
      <select
        className="selector"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        <option value="">Select Year</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
        <option value="2027">2027</option>
        <option value="2028">2028</option>
        <option value="2029">2029</option>
        <option value="2030">2030</option>
      </select>
      <button
        name="export"
        className="secondary-button"
        onClick={exportToCsv}
        disabled={fetchingData || !selectedYear}
      >
        {fetchingData ? "Fetching data..." : "Export to CSV"}
      </button>
    </div>
  );
};

export default ExportData;
