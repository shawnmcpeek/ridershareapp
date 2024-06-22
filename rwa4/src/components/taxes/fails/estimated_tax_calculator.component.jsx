import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../../utils/firebase/firebase.utils";
import TimeSelectComponent from "../time_select.component/time_select.component";
import mileageRates from "../mileagerates";

function EstimatedTaxCalculator() {
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [taxData, setTaxData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedQuarter && selectedYear && currentUser) {
      fetchData();
    } else {
      setTaxData(null);
    }
  }, [selectedQuarter, selectedYear, currentUser]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = currentUser.uid;
      const quarterStartMonth = getQuarterStartMonth(selectedQuarter);
      const quarterEndMonth = getQuarterEndMonth(selectedQuarter);
      const startDate = new Date(selectedYear, quarterStartMonth, 1);
      const endDate = new Date(selectedYear, quarterEndMonth + 1, 0);

      const [incomeSnapshot, expenseSnapshot, mileageSnapshot] =
        await Promise.all([
          getDocs(
            query(
              collection(db, "income"),
              where("userId", "==", userId),
              where("date", ">=", startDate),
              where("date", "<=", endDate)
            )
          ),
          getDocs(
            query(
              collection(db, "expenses"),
              where("userId", "==", userId),
              where("date", ">=", startDate),
              where("date", "<=", endDate)
            )
          ),
          getDocs(
            query(
              collection(db, "drivermileage"),
              where("userId", "==", userId),
              where("date", ">=", startDate),
              where("date", "<=", endDate)
            )
          ),
        ]);

      const incomeTotal = incomeSnapshot.docs.reduce(
        (total, doc) => total + doc.data().amount,
        0
      );
      const expenseTotal = expenseSnapshot.docs.reduce(
        (total, doc) => total + parseFloat(doc.data().amount),
        0
      );
      const mileageTotal = calculateTotalMileage(mileageSnapshot.docs);
      const mileageRate = getMileageRate(selectedYear);

      const grossProfit = incomeTotal;
      const netProfit = incomeTotal - expenseTotal - mileageTotal * mileageRate;
      const netProfitNoMileage = incomeTotal - expenseTotal;

      const taxData = {
        grossData: {
          incomeTotal: grossProfit,
          irsPayment: grossProfit * 0.15,
          statePayment: grossProfit * 0.05,
        },
        netData: {
          incomeTotal,
          expenseTotal,
          mileageExpense: mileageTotal * mileageRate,
          profit: netProfit,
          irsPayment: netProfit * 0.15,
          statePayment: netProfit * 0.05,
        },
        netNoMileageData: {
          incomeTotal,
          expenseTotal,
          profit: netProfitNoMileage,
          irsPayment: netProfitNoMileage * 0.15,
          statePayment: netProfitNoMileage * 0.05,
        },
      };

      setTaxData(taxData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching data.");
    }

    setIsLoading(false);
  };

  const calculateTotalMileage = (mileageEntries) => {
    let totalMileage = 0;
    const entriesByDate = mileageEntries.reduce((acc, entry) => {
      const data = entry.data();
      const dateStr = data.date.toDate().toDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(data);
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

  const getMileageRate = (year) => {
    const entry = mileageRates.find((rate) => {
      const startDate = new Date(rate.startDate);
      const endDate = new Date(rate.endDate);
      const selectedDate = new Date(`${year}-01-01`);
      return selectedDate >= startDate && selectedDate <= endDate;
    });
    return entry ? entry.rate : 0;
  };

  const getQuarterStartMonth = (quarter) => {
    switch (quarter) {
      case "Q1":
        return 0;
      case "Q2":
        return 3;
      case "Q3":
        return 6;
      case "Q4":
        return 9;
      default:
        return 0;
    }
  };

  const getQuarterEndMonth = (quarter) => {
    switch (quarter) {
      case "Q1":
        return 2;
      case "Q2":
        return 5;
      case "Q3":
        return 8;
      case "Q4":
        return 11;
      default:
        return 0;
    }
  };

  const handleTimeRangeSelect = (quarter, year) => {
    setSelectedQuarter(quarter);
    setSelectedYear(year);
  };

  return (
    <div className="app-container">
      <h2>Estimated Tax Calculator</h2>
      <TimeSelectComponent onSelect={handleTimeRangeSelect} />

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : taxData ? (
        <div className="tax-data-container">
          <div className="tax-data-column">
            <h3>Gross Estimated Tax</h3>
            <p>Total Income: ${taxData.grossData.incomeTotal.toFixed(2)}</p>
            <p>IRS Payment: ${taxData.grossData.irsPayment.toFixed(2)}</p>
            <p>
              State Income Tax Payment: $
              {taxData.grossData.statePayment.toFixed(2)}
            </p>
          </div>
          <div className="tax-data-column">
            <h3>Net Estimated Tax</h3>
            <p>Total Income: ${taxData.netData.incomeTotal.toFixed(2)}</p>
            <p>Expenses: ${taxData.netData.expenseTotal.toFixed(2)}</p>
            <p>Mileage Expense: ${taxData.netData.mileageExpense.toFixed(2)}</p>
            <p>Total Profit: ${taxData.netData.profit.toFixed(2)}</p>
            <p>IRS Payment: ${taxData.netData.irsPayment.toFixed(2)}</p>
            <p>
              State Income Tax Payment: $
              {taxData.netData.statePayment.toFixed(2)}
            </p>
          </div>
          <div className="tax-data-column">
            <h3>Net, no mileage, Estimated Tax</h3>
            <p>
              Total Income: ${taxData.netNoMileageData.incomeTotal.toFixed(2)}
            </p>
            <p>Expenses: ${taxData.netNoMileageData.expenseTotal.toFixed(2)}</p>
            <p>Total Profit: ${taxData.netNoMileageData.profit.toFixed(2)}</p>
            <p>
              IRS Payment: ${taxData.netNoMileageData.irsPayment.toFixed(2)}
            </p>
            <p>
              State Income Tax Payment: $
              {taxData.netNoMileageData.statePayment.toFixed(2)}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default EstimatedTaxCalculator;
