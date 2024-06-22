import React from "react";
import { useLocation } from "react-router-dom";
import "../../App.scss";

function TopBarComponent() {
  const location = useLocation();

  const getHeaderText = () => {
    switch (location.pathname) {
      case "/":
        return "RideWealth Assistant";
      case "/mileage":
        return "Mileage";
      case "/expense":
        return "Expenses";
      case "/income":
        return "Income";
      case "/tax-estimates/":
        return "Tax Estimates";
      case "/user":
        return "User";
      default:
        return "RideWealth Assistant";
    }
  };

  return (
    <div className="topbar active bruno-ace-regular">
      <h1>{getHeaderText()}</h1>
    </div>
  );
}

export default TopBarComponent;
