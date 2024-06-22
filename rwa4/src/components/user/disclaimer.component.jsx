import React from "react";
import "../../App.scss";

function DisclaimerComponent() {
  return (
    <div className="app-container">
      <div>
        <h3>Disclaimer:</h3>
        <p>
          RideWealth Assistant is designed solely for informational purposes and
          does not offer tax, legal, or accounting advice. The content provided
          should not be construed as such advice, and reliance on it for tax,
          legal, or accounting matters without professional consultation is not
          recommended. It is advisable to seek guidance from your own tax,
          legal, and accounting advisors before making any decisions or
          transactions.
        </p>
      </div>
    </div>
  );
}

export default DisclaimerComponent;
