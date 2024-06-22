import React from "react";
import "../../App.scss";

function DefaultComponent() {
  return (
    <div className="app-container">
    <div className="main-content">
      <p>
        Thank you for using RideWealth Assistant to manage your ride-share
        business. Whether this is a side-hustle or a full-time job, we are here
        to help.
        <br />
        To get started, click on the Mileage icon and enter the date, start and
        end mileage.
        <br />
        To track your expenses, click on the Expense icon and enter the date,
        expenditure amount and other details.
        <br />
        To track your income, click on the Income icon and enter the income
        date, income source, and income amount.
        <br />
        To see your total profit (income - expenditures) and estimated tax
        payment, click on the Taxes and Income icon.
        <br />
        To see and change your account info or to submit feedback, click on the
        User icon.
      </p>
    </div>
    </div>
  );
}

export default DefaultComponent;
