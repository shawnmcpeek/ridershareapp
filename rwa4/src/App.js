// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import User from "./components/user/user.component";
import IncomeComponent from "./components/income/income.component";
import "./App.scss";
import ExpenseComponent from "./components/expense/expense.component";
import MileageComponent from "./components/mileage/mileage.component";
//import EstimatedTaxCalculator from "./components/taxes/estimated_tax_calculator.component";
import DefaultComponent from "./components/default/default.component";
import NavbarComponent from "./components/navbar/navbar.component";
import TopBarComponent from "./components/topbar/topbar.component";
import TaxCalculator from "./components/taxes/tax_calculator.component";
const App = () => {
  return (
    <Router>
      <div>
        <header className="App-header">
          <TopBarComponent />
        </header>
        <Routes>
          <Route path="/" element={<DefaultComponent />} />
          <Route path="/user/*" element={<User />} />
          <Route path="/income" element={<IncomeComponent />} />
          <Route path="/expense" element={<ExpenseComponent />} />
          <Route path="/mileage" element={<MileageComponent />} />
          <Route
            path="/tax-estimates/*"
            element={<TaxCalculator />} 
          />
        </Routes>

        <NavbarComponent />
      </div>
    </Router>
  );
};


export default App;
