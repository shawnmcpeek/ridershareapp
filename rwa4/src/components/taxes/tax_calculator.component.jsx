// TaxCalculatorNew.js
import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../utils/firebase/firebase.utils";
import mileageRates from "../taxes/mileagerates";
import TimeSelectComponent from "../time_select/time_select.component";
import "../../App.scss";

const TaxCalculator = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState({
    quarter: "",
    year: "",
  });
  const [taxData, setTaxData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log("useEffect triggered. Selected time range:", selectedTimeRange);
    console.log("Current user:", user);

    const fetchData = async () => {
      if (selectedTimeRange.quarter && selectedTimeRange.year && user) {
        const { quarter, year } = selectedTimeRange;
        const userId = user.uid;

        console.log("Selected time range:", { quarter, year, userId });

        const yearNum = parseInt(year, 10);
        let startDate, endDate;

        if (quarter === "Total") {
          startDate = new Date(yearNum, 0, 1);
          endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
        } else {
          const quarterNum = parseInt(quarter.substr(1), 10);
          startDate = new Date(yearNum, (quarterNum - 1) * 3, 1);
          endDate = new Date(yearNum, quarterNum * 3, 0, 23, 59, 59, 999);
        }

        console.log("Fetching data for:", { startDate, endDate, userId });

        const fetchCollectionData = async (collectionName) => {
          try {
            console.log(`Fetching ${collectionName} data...`);
            console.log(`User ID: ${userId}`);
            console.log(
              `Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
            );

            // Query for both uid and userId without date filter
            const userQuery = query(
              collection(db, collectionName),
              or(where("uid", "==", userId), where("userId", "==", userId))
            );
            const userSnapshot = await getDocs(userQuery);
            console.log(
              `${collectionName} data for user (no date filter):`,
              userSnapshot.size
            );

            // Query with date filter
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
            console.log(
              `${collectionName} query snapshot size (with date filter):`,
              snapshot.size
            );

            const data = snapshot.docs.map((doc) => {
              const docData = doc.data();
              console.log(`${collectionName} document:`, {
                id: doc.id,
                userId: docData.userId || docData.uid,
                date:
                  docData.date instanceof Date
                    ? docData.date.toISOString()
                    : docData.date,
                ...docData,
              });
              return {
                id: doc.id,
                ...docData,
              };
            });

            // Query all documents in the collection
            const allDocsQuery = query(collection(db, collectionName));
            const allDocsSnapshot = await getDocs(allDocsQuery);
            console.log(
              `All documents in ${collectionName}:`,
              allDocsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );

            return data;
          } catch (error) {
            console.error(`Error fetching ${collectionName} data:`, error);
            console.error(`Error details:`, error.code, error.message);
            return [];
          }
        };

        try {
          const incomeData = await fetchCollectionData("income");
          const expenseData = await fetchCollectionData("expenses");
          const mileageData = await fetchCollectionData("drivermileage");

          const incomeTotal = incomeData.reduce(
            (total, entry) => total + entry.amount,
            0
          );
          const expenseTotal = expenseData.reduce(
            (total, entry) => total + entry.amount,
            0
          );
          const mileageTotal = calculateTotalMileage(mileageData);
          const mileageRate = getMileageRate(yearNum);
          const mileageExpense = mileageTotal * mileageRate;

          const grossProfit = incomeTotal;
          const netProfit = incomeTotal - expenseTotal - mileageExpense;
          const netProfitNoMileage = incomeTotal - expenseTotal;

          const processedData = {
            incomeTotal,
            expenseTotal,
            mileageTotal,
            mileageExpense,
            grossProfit,
            netProfit,
            netProfitNoMileage,
            irsPaymentGross: grossProfit * 0.15,
            statePaymentGross: grossProfit * 0.05,
            irsPaymentNet: netProfit * 0.15,
            statePaymentNet: netProfit * 0.05,
            irsPaymentNetNoMileage: netProfitNoMileage * 0.15,
            statePaymentNetNoMileage: netProfitNoMileage * 0.05,
          };

          console.log("Processed tax data:", processedData);
          setTaxData(processedData);
        } catch (error) {
          console.error("Error in data processing:", error);
        }
      }
    };

    fetchData();
  }, [selectedTimeRange, user]);

  const calculateTotalMileage = (mileageData) => {
    console.log("Calculating total mileage for:", mileageData);
    if (mileageData.length < 2) return 0;
    const totalMileage =
      mileageData[mileageData.length - 1].mileage - mileageData[0].mileage;
    console.log("Total mileage calculated:", totalMileage);
    return totalMileage;
  };

  const getMileageRate = (year) => {
    console.log("Getting mileage rate for year:", year);
    const entry = mileageRates.find((rate) => {
      const startDate = new Date(rate.startDate);
      const endDate = new Date(rate.endDate);
      const selectedDate = new Date(`${year}-01-01`);
      return selectedDate >= startDate && selectedDate <= endDate;
    });
    const rate = entry ? entry.rate : 0;
    console.log("Mileage rate found:", rate);
    return rate;
  };

  const handleTimeRangeSelect = (quarter, year) => {
    console.log("Time range selected:", { quarter, year });
    setSelectedTimeRange({ quarter, year });
  };

  return (
    <div className="main-content">
      <h1>Tax Calculator</h1>
      <TimeSelectComponent onSelect={handleTimeRangeSelect} />
      {taxData && (
        <div>
          <h2>Financial Data</h2>
          <p>Total Income: ${taxData.incomeTotal.toFixed(2)}</p>
          <p>Total Expenses: ${taxData.expenseTotal.toFixed(2)}</p>
          <p>Total Mileage: {taxData.mileageTotal} miles</p>
          <p>Mileage Expense: ${taxData.mileageExpense.toFixed(2)}</p>
          <p>Gross Profit: ${taxData.grossProfit.toFixed(2)}</p>
          <p>Net Profit: ${taxData.netProfit.toFixed(2)}</p>
          <p>
            Net Profit (No Mileage): ${taxData.netProfitNoMileage.toFixed(2)}
          </p>

          <h2>Estimated Tax Payments (Gross Profit)</h2>
          <p>IRS Payment: ${taxData.irsPaymentGross.toFixed(2)}</p>
          <p>
            State Income Tax Payment: ${taxData.statePaymentGross.toFixed(2)}
          </p>

          <h2>Estimated Tax Payments (Net Profit)</h2>
          <p>IRS Payment: ${taxData.irsPaymentNet.toFixed(2)}</p>
          <p>State Income Tax Payment: ${taxData.statePaymentNet.toFixed(2)}</p>

          <h2>Estimated Tax Payments (Net Profit No Mileage)</h2>
          <p>IRS Payment: ${taxData.irsPaymentNetNoMileage.toFixed(2)}</p>
          <p>
            State Income Tax Payment: $
            {taxData.statePaymentNetNoMileage.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;
