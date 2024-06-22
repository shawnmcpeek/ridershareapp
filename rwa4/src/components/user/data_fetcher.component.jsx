import { useEffect, useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../utils/firebase/firebase.utils";
import mileageRates from "../taxes/mileagerates";
import { useAuth } from "../../utils/firebase/firebase.utils";

const DataFetcher = ({ selectedQuarter, selectedYear, onSuccess }) => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;

  // Memoize helper functions
  const calculateTotalExpenses = useCallback((entries) => {
    return entries.reduce(
      (total, entry) => total + parseFloat(entry.amount),
      0
    );
  }, []);

  const calculateTotalMileage = useCallback((entries) => {
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
  }, []);

  const getMileageRate = useCallback((year) => {
    const entry = mileageRates.find((rate) => {
      const startDate = new Date(rate.startDate);
      const endDate = new Date(rate.endDate);
      const selectedDate = new Date(`${year}-01-01`);
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    return entry ? entry.rate : 0;
  }, []);

  const calculateMileageExpense = useCallback(
    (totalMileage, year) => {
      const rate = getMileageRate(year);
      return totalMileage * rate;
    },
    [getMileageRate]
  );

  const calculateTotalByCategory = useCallback((entries) => {
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
  }, []);

  const calculateTotalIncome = useCallback((entries) => {
    return entries.reduce(
      (total, entry) => total + parseFloat(entry.amount),
      0
    );
  }, []);

  useEffect(() => {
    console.log("DataFetcher useEffect triggered");
    console.log("Selected Quarter:", selectedQuarter);
    console.log("Selected Year:", selectedYear);
    console.log("User ID:", userId);

    if (!selectedYear || !userId) {
      console.log(
        "Selected year or user ID is not defined, skipping data fetch"
      );
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching data for selected year:", selectedYear);
        console.log("Fetching data for selected quarter:", selectedQuarter);
        console.log("Fetching data for user ID:", userId);

        // Fetch expense entries
        const expenseQuery = query(
          collection(db, "expenses"),
          where("userId", "==", userId),
          where("year", "==", selectedYear),
          where("quarter", "==", selectedQuarter)
        );
        const expenseSnapshot = await getDocs(expenseQuery);
        const expenseEntries = expenseSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched expense entries:", expenseEntries);

        // Fetch mileage entries
        const mileageQuery = query(
          collection(db, "drivermileage"),
          where("userId", "==", userId),
          where("year", "==", selectedYear),
          where("quarter", "==", selectedQuarter)
        );
        const mileageSnapshot = await getDocs(mileageQuery);
        const mileageEntries = mileageSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched mileage entries:", mileageEntries);

        // Fetch income entries
        const incomeQuery = query(
          collection(db, "income"),
          where("userId", "==", userId),
          where("year", "==", selectedYear),
          where("quarter", "==", selectedQuarter)
        );
        const incomeSnapshot = await getDocs(incomeQuery);
        const incomeEntries = incomeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched income entries:", incomeEntries);

        // Check if any entries exist
        if (
          expenseEntries.length === 0 &&
          mileageEntries.length === 0 &&
          incomeEntries.length === 0
        ) {
          console.log("No entries found for the selected quarter and year");
          onSuccess(null);
          return;
        }

        const totalExpenses = calculateTotalExpenses(expenseEntries);
        const totalMileage = calculateTotalMileage(mileageEntries);
        const mileageExpense = calculateMileageExpense(
          totalMileage,
          selectedYear
        );
        const totalByCategory = calculateTotalByCategory(expenseEntries);
        const totalIncome = calculateTotalIncome(incomeEntries);

        console.log("Total expenses:", totalExpenses);
        console.log("Total mileage:", totalMileage);
        console.log("Mileage expense:", mileageExpense);
        console.log("Total by category:", totalByCategory);
        console.log("Total income:", totalIncome);

        onSuccess({
          totalExpenses,
          totalMileage,
          mileageExpense,
          totalByCategory,
          totalIncome,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    selectedQuarter,
    selectedYear,
    userId,
    calculateTotalExpenses,
    calculateTotalMileage,
    calculateMileageExpense,
    calculateTotalByCategory,
    calculateTotalIncome,
    onSuccess,
  ]);

  return null;
};

export default DataFetcher;
