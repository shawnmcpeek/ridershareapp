import React, { useState } from "react";
import { saveAs } from "file-saver";
import AnnualDataExportComponent from "./annualdataexport.component";

function ExportDataComponent({ userId }) {
  const [fetchingData, setFetchingData] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");

  const handleDataFetchSuccess = (data) => {
    let csvContent =
      "Year,Total Income,Total Expenses,Category Expenses,,Total Mileage,Mileage Expense\n";
    const {
      totalExpenses,
      totalMileage,
      mileageExpense,
      totalByCategory,
      totalIncome,
    } = data;

    csvContent += `${selectedYear},${totalIncome},${totalExpenses},,,,${totalMileage},${mileageExpense}\n`;

    Object.entries(totalByCategory).forEach(([category, amount]) => {
      csvContent += `,,${category},${amount},,\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "exported_data.csv");

    setFetchingData(false);
  };

  const exportToCsv = (year) => {
    setSelectedYear(year);
    setFetchingData(true);
  };

  return (
    <div>
      <button
        name="export"
        className="primary-button"
        onClick={() => exportToCsv("2023")}
        disabled={fetchingData}
      >
        {fetchingData ? "Fetching data..." : "Export to CSV"}
      </button>
      {fetchingData && (
        <AnnualDataExportComponent
          onSuccess={handleDataFetchSuccess}
          selectedYear={selectedYear}
          userId={userId}
        />
      )}
    </div>
  );
}

export default ExportDataComponent;
