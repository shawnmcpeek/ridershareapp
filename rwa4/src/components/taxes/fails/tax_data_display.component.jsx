import React from "react";
import PropTypes from "prop-types";
import mileageRates from "../mileagerates";

function TaxDataDisplay({ taxData, selectedYear }) {
  if (!taxData) {
    return <div>Loading tax data...</div>;
  }

  const { incomeTotal, expenseTotal, mileageTotal } = taxData;

  const mileageRate = getMileageRate(selectedYear);
  const mileageExpense = mileageTotal * mileageRate;
  const netProfit = incomeTotal - expenseTotal - mileageExpense;
  const irsPayment = netProfit * 0.15;
  const statePayment = netProfit * 0.05;

  function getMileageRate(year) {
    const entry = mileageRates.find((rate) => {
      const startDate = new Date(rate.startDate);
      const endDate = new Date(rate.endDate);
      const selectedDate = new Date(`${year}-01-01`);
      return selectedDate >= startDate && selectedDate <= endDate;
    });
    return entry ? entry.rate : 0;
  }

  return (
    <div className="tax-data-container">
      <div className="tax-data-column">
        <h3>Financial Data</h3>
        <p>Total Income: ${incomeTotal.toFixed(2)}</p>
        <p>Total Expenses: ${expenseTotal.toFixed(2)}</p>
        <p>Total Mileage: {mileageTotal} miles</p>
        <p>Mileage Expense: ${mileageExpense.toFixed(2)}</p>
        <p>Net Profit: ${netProfit.toFixed(2)}</p>
      </div>
      <div className="tax-data-column">
        <h3>Estimated Tax Payments</h3>
        <p>IRS Payment: ${irsPayment.toFixed(2)}</p>
        <p>State Income Tax Payment: ${statePayment.toFixed(2)}</p>
      </div>
    </div>
  );
}

TaxDataDisplay.propTypes = {
  taxData: PropTypes.shape({
    incomeTotal: PropTypes.number.isRequired,
    expenseTotal: PropTypes.number.isRequired,
    mileageTotal: PropTypes.number.isRequired,
  }),
  selectedYear: PropTypes.string.isRequired,
};

export default TaxDataDisplay;
