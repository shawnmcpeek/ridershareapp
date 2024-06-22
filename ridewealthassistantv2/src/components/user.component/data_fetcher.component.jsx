import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../utils/firebase/firebase.utils";
import mileageRates from "../taxes.component/mileagerates";
import { useEffect } from "react";

const DataFetcher = ({ selectedQuarter, selectedYear, onSuccess, userId }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for selected year:", selectedYear);

        // Fetch expense entries for the logged-in user
        const expenseQuery = query(
          collection(db, "expenses"),
          where("userId", "==", userId)
        );
        const expenseSnapshot = await getDocs(expenseQuery);
        const expenseEntries = expenseSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch mileage entries for the logged-in user
        const mileageQuery = query(
          collection(db, "drivermileage"),
          where("userId", "==", userId)
        );
        const mileageSnapshot = await getDocs(mileageQuery);
        const mileageEntries = mileageSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch income entries for the logged-in user
        const incomeQuery = query(
          collection(db, "income"),
          where("userId", "==", userId)
        );
        const incomeSnapshot = await getDocs(incomeQuery);
        const incomeEntries = incomeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched expense entries:", expenseEntries);
        console.log("Fetched mileage entries:", mileageEntries);
        console.log("Fetched income entries:", incomeEntries);

        let totalExpenses = 0;
        let totalMileage = 0;
        let mileageExpense = 0;
        let totalByCategory = {};
        let totalIncome = 0;

        if (selectedYear) {
          const filteredExpenseEntries = expenseEntries.filter((entry) => {
            const date = entry.date?.toDate();
            if (!date) return false;
            const year = date.getFullYear();
            return year === Number(selectedYear);
          });

          const filteredMileageEntries = mileageEntries.filter((entry) => {
            const date = entry.date?.toDate();
            if (!date) return false;
            const year = date.getFullYear();
            return year === Number(selectedYear);
          });

          const filteredIncomeEntries = incomeEntries.filter((entry) => {
            const date = entry.date?.toDate();
            if (!date) return false;
            const year = date.getFullYear();
            return year === Number(selectedYear);
          });

          totalExpenses = calculateTotalExpenses(filteredExpenseEntries);
          totalMileage = calculateTotalMileage(filteredMileageEntries);
          mileageExpense = calculateMileageExpense(totalMileage, selectedYear);
          totalByCategory = calculateTotalByCategory(filteredExpenseEntries);
          totalIncome = calculateTotalIncome(filteredIncomeEntries);
        }

        console.log("Total expenses:", totalExpenses);
        console.log("Total mileage:", totalMileage);
        console.log("Mileage expense:", mileageExpense);
        console.log("Total by category:", totalByCategory);
        console.log("Total income:", totalIncome);

        // Invoke onSuccess callback with fetched data
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

    if (selectedYear && userId) {
      fetchData();
    }
  }, [selectedQuarter, selectedYear, userId]);

  // Helper functions
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

  const calculateTotalIncome = (entries) => {
    return entries.reduce(
      (total, entry) => total + parseFloat(entry.amount),
      0
    );
  };

  return null;
};

export default DataFetcher;
