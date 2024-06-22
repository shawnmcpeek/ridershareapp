import React, { useEffect, useState } from "react";
import "../../App.scss";

const TimeSelectComponent = ({ onSelect }) => {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const years = Array.from({ length: 5 }, (_, index) => 2024 + index);
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    // Select the default option "Select a Time Range" when the component first loads
    setSelectedQuarter("");
    setSelectedYear("");
  }, []);

  const handleSelection = (value) => {
    if (onSelect) {
      const [quarter, year] = value.split("-");
      setSelectedQuarter(quarter);
      setSelectedYear(year);
      onSelect(quarter, year);
    }
  };

  return (
    <div>
      <select
      className="selector"
      id="time-range-select"
      name="time-range-select"
      value={`${selectedQuarter}-${selectedYear}`}
      onChange={(e) => handleSelection(e.target.value)}
    >
        <option value="">Select a Time Range</option>
        {years.map((year) => (
          <React.Fragment key={`Year-${year}`}>
            {quarters.map((quarter) => (
              <option key={`${quarter}-${year}`} value={`${quarter}-${year}`}>
                {quarter} {year}
              </option>
            ))}
            <option key={`Total-${year}`} value={`Total-${year}`}>
              Total {year}
            </option>
          </React.Fragment>
        ))}
      </select>
    </div>
  );
};

export default TimeSelectComponent;
