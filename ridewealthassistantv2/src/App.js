import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavbarComponent from "./components/navbar.component/navbar.component";
import UserComponent from "./components/user.component/user.component";
import DefaultComponent from "./components/default.component/default.component";
import ExpenseComponent from "./components/expenses.component/expense.component";
import IncomeComponent from "./components/income.component/income.component";
import MileageComponent from "./components/mileage.component/mileage.component";
import EstTaxComponent from "./components/taxes.component/estimated_tax.component";
import TopBarComponent from "./components/topbar.component/topbar.component";
import "./App.scss";
import { auth, firebase } from "./utils/firebase/firebase.utils";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <header>
          <TopBarComponent />
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DefaultComponent />} />
            <Route path="/user/*" element={<UserComponent user={user} />} />
            <Route path="/expense" element={<ExpenseComponent />} />
            <Route path="/income" element={<IncomeComponent />} />
            <Route path="/mileage" element={<MileageComponent />} />
            <Route path="/tax-estimates/*" element={<EstTaxComponent />} />
          </Routes>
        </main>
      </div>
      <NavbarComponent />
    </BrowserRouter>
  );
}

export default App;
