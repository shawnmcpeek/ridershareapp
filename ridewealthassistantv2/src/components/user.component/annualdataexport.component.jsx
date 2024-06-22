import React, { useState } from "react";
import TimeSelectComponent from "../time_select.component/time_select.component";
import DataFetcher from "./data_fetcher.component";

function AnnualDataExportComponent({ onSuccess, selectedYear, userId }) {
  const [selectedQuarter, setSelectedQuarter] = useState("");

  const handleTimeSelect = (quarter, year) => {
    setSelectedQuarter(quarter);
  };

  return (
    <div>
      <h2>Annual Data Export</h2>
      <TimeSelectComponent onSelect={handleTimeSelect} />
      {selectedQuarter && (
        <DataFetcher
          selectedQuarter={selectedQuarter}
          selectedYear={selectedYear}
          onSuccess={onSuccess}
          userId={userId}
        />
      )}
    </div>
  );
}

export default AnnualDataExportComponent;