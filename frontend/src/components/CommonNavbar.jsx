import React, { useState } from "react";
import "./Navbar.css"; // Import your custom CSS file
import AdminNotifications from "./AdminNotifications";
import Verification from "./Verification";
import { useNavigate } from "react-router-dom";
import UserWallet from "./UserWallet";

// Import Font Awesome Icons
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUser,
  faCog,
  faBell,
  faHistory,
  faSignOutAlt,
  faEnvelope,
  faLock,
  faQuestionCircle,
  faBuilding,
  faWallet,

} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Add the icons to the library
library.add(
  faUser,
  faCog,
  faBell,
  faHistory,
  faSignOutAlt,
  faEnvelope,
  faLock,
  faQuestionCircle,
  faBuilding,
  faWallet
);

const CommonNavbar = ({ role, setExpanded, expanded }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [walletPopupOpen, setWalletPopupOpen] = useState(false);
  const navigate = useNavigate();

  // Define navigation items for user and admin
  const userNavItems = [
    { icon: "fa-solid fa-user", text: "Profile", onClick: () => navigate("/user/profile") },
    // { icon: "fa-solid fa-cog", text: "Settings", onClick: () => navigate("/user/settings") },
    { icon: "fa-solid fa-history", text: "Activity Log", onClick: () => navigate("/user/activity-log") },
    { icon: "fa-solid fa-envelope", text: "Borrow", onClick: () => navigate("/user/borrower") },
    { icon: "fa-solid fa-envelope", text: "Lend", onClick: () => navigate("/user/lender") },
    { icon: "fa-solid fa-envelope", text: "Get Verified", onClick: () => setPopupOpen(true) },
    // { icon: "fa-solid fa-question-circle", text: "Help", onClick: () => navigate("/user/help") },
    { icon: "fa-solid fa-wallet", text: "My Wallet", onClick: () => setWalletPopupOpen(true)},
  ];

  const adminNavItems = [
    { icon: "fa-solid fa-user", text: "Profile", onClick: () => navigate("/admin/profile") },
  { icon: "fa-solid fa-bell", text: "Notifications", onClick: () => navigate("/admin/notification") },

  { icon: "fa-solid fa-building", text: "Companies", onClick: () => navigate("/admin/companies") },
  { icon: "fa-solid fa-history", text: "Activity Log", onClick: () => navigate("/admin/activity-log") },
  { icon: "fa-solid fa-question-circle", text: "Help", onClick: () => navigate("/admin/help") },
];


  // Select navigation items based on role
  const navItems = role === "admin" ? adminNavItems : userNavItems;

  return (
    <div className="flex flex-row w-full">
      <div id="nav-bar">
        {/* Toggle Checkbox for Responsive Navbar */}
        <input id="nav-toggle" type="checkbox" />

        {/* Header Section */}
        <div id="nav-header">
          {/* Navbar Title with Icon */}
          <a id="nav-title" target="_blank" rel="noopener noreferrer">
            <div className="flex flex-row ml-3">CrediSync</div>
          </a>

          {/* Hamburger Menu for Mobile */}
          <label
            htmlFor="nav-toggle"
            id="nav-toggle-label"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <span id="nav-toggle-burger"></span>
          </label>
          <hr />
        </div>

        {/* Navigation Content */}
        <div id="nav-content">
          {/* Render Navigation Buttons */}
          {navItems.map((item, index) => (
            <NavButton
              key={index}
              icon={item.icon}
              text={item.text}
              onClick={item.onClick}
            />
          ))}
          <hr />

          {/* Highlight Background */}
          <div id="nav-content-highlight"></div>
        </div>
      </div>

      {/* Conditionally Render AdminNotifications or Verification */}
      {/* {role === "admin" ? (
        <AdminNotifications
          isOpen={popupOpen}
          onClose={() => setPopupOpen(false)}
          className="w-5/6"
          expanded={expanded}
        />
      ) : (
        role == "user" && <Verification isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
      )} */}
      {role == "user" && <Verification isOpen={popupOpen} onClose={() => setPopupOpen(false)} />}
      {role == "user" && <UserWallet isOpen={walletPopupOpen} onClose={() => setWalletPopupOpen(false)} />}
    </div>
  );
};

// Reusable NavButton Component
const NavButton = ({ icon, text, onClick }) => {
  return (
    <div className="nav-button" onClick={onClick}>
      <FontAwesomeIcon icon={icon} className="fas fa-palette" />
      <span>{text}</span>
    </div>
  );
};

export default CommonNavbar;