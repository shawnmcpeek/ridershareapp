import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import notebookIcon from "./icons8-notebook-64.png";
import dollarIcon from "./icons8-dollar-50.png";
import receiptIcon from "./icons8-receipt-48 (2).png";
import taxesIcon from "./icons8-tax-48 (1).png";
import userIcon from "./icons8-user-48 (1).png";
import homeIcon from "./icons8-home-48.png";
import "../../App.scss";

function NavItem({ path, icon, label, height }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = location.pathname === path;

  const handleClick = () => {
    navigate(path);
  };

  return (
    <li
      className={`nav-item ${isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      <a href={path}>
        <img
          src={icon}
          alt={`${label} Icon`}
          style={{ height: `${height}px` }}
        />
        <span>{label}</span>
      </a>
    </li>
  );
}

function NavbarComponent() {
  return (
    <ul className="bottom-navigation">
      <NavItem path="/" icon={homeIcon} height={24} label="Home" />
      <NavItem
        path="/mileage"
        icon={notebookIcon}
        height={24}
        label="Mileage"
      />
      <NavItem
        path="/expense"
        icon={receiptIcon}
        height={24}
        label="Expenses"
      />
      <NavItem path="/income" icon={dollarIcon} height={24} label="Income" />
      <NavItem
        path="/tax-estimates/"
        icon={taxesIcon}
        height={24}
        label="Tax Estimates"
      />
      <NavItem path="/user" icon={userIcon} height={24} label="User" />
    </ul>
  );
}

export default NavbarComponent;
