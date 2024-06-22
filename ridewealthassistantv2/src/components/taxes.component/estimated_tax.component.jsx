import React from "react";
import { Link, useNavigate } from "react-router-dom";
import GrossEstimatedTaxPaymentComponent from "./gross_est_tax.component.jsx";
import NetIncomeTaxEstimateComponent from "./net_est_tax.component.jsx";
import TaxEstimationNoMileageComponent from "./net_est_tax_no_miles.component.jsx";

function EstTaxComponent() {
  const navigate = useNavigate();
  const [activeCalculator, setActiveCalculator] = React.useState(null);

  const handleGrossClick = () => {
    setActiveCalculator("gross");
  };

  const handleNetClick = () => {
    setActiveCalculator("net");
  };

  const handleNetNoMileageClick = () => {
    setActiveCalculator("netNoMileage");
  };

  return (
    <div>
      <h2>Suggested Estimated Tax Calculators</h2>
      <div className="app-container">
        <div className="input-group">
          <p>
            Please select a calculator below to calculate your estimated tax
            payments. The Gross Estimated Tax Calculator is the most
            conservative method of calculating estimated tax payments. It takes
            20% of your gross income into account, with no expense or mileage
            deductions. The Net No Mileage Estimated Tax Calculator takes 20% of
            your net income, less expenses, without considering mileage. The Net
            Estimated Tax Calculator is the least conservative method, taking
            20% of your net profit into account, which includes expense and
            mileage deductions.
          </p>
          <div className="input-row">
            <button className="primary-button" onClick={handleGrossClick}>
              Gross Est. Tax
            </button>
            <button className="primary-button" onClick={handleNetClick}>
              Net Est. Tax
            </button>
            <button
              className="primary-button"
              onClick={handleNetNoMileageClick}
            >
              Net Est. Tax No Mileage
            </button>
          </div>
        </div>
        <div>
          {activeCalculator === "gross" && (
            <GrossEstimatedTaxPaymentComponent />
          )}
          {activeCalculator === "net" && <NetIncomeTaxEstimateComponent />}
          {activeCalculator === "netNoMileage" && (
            <TaxEstimationNoMileageComponent />
          )}
        </div>
      </div>
    </div>
  );
}

export default EstTaxComponent;
