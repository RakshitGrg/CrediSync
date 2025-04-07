import React, { useState, useEffect } from "react";
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
  faCheckCircle,
  faClockRotateLeft,
  faHandHoldingDollar,
  faCoins,
  faCircleQuestion,
  faHourglass,
  faTimesCircle
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
  faWallet,
  faCheckCircle,
  faClockRotateLeft,
  faHandHoldingDollar,
  faCoins,
  faCircleQuestion,
  faHourglass,
  faTimesCircle
);

const CommonNavbar = ({ role, setExpanded }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [walletPopupOpen, setWalletPopupOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("none");
  const navigate = useNavigate();

  // Fetch user verification status
  useEffect(() => {
    if (role === "user") {
      const userEmail = localStorage.getItem("email"); // Assuming email is stored in localStorage
      if (userEmail) {
        fetch(`http://localhost:5001/api/user/verification-status?email=${encodeURIComponent(userEmail)}`)
          .then(response => response.json())
          .then(data => {
            if (data.status) {
              setVerificationStatus(data.status);
              console.log("Verification status:", data.status);
            }
          })
          .catch(error => console.error("Error fetching verification status:", error));
      }
    }
  }, [role]);

  // Define verification button properties based on status
  const getVerificationButton = () => {
    let icon, text, onClick, className;
    
    switch(verificationStatus) {
      case "approved":
        icon = "fa-solid fa-check-circle";
        text = "Verified";
        onClick = () => {}; // No action for verified users
        className = "verified";
        return { icon, text, onClick, className };
      
      case "pending":
        icon = "fa-solid fa-hourglass";
        text = "Verification Pending";
        onClick = () => {}; // No action for pending verification
        className = "pending";
        return { icon, text, onClick, className };
      
      case "rejected":
        icon = "fa-solid fa-times-circle";
        text = "Verification Rejected";
        onClick = () => setPopupOpen(true); // Open popup to retry
        className = "rejected";
        return { icon, text, onClick, className };
      
      default: // "none"
        icon = "fa-solid fa-check-circle";
        text = "Get Verified";
        onClick = () => setPopupOpen(true);
        className = "";
        return { icon, text, onClick, className };
    }
  };

  // Define navigation items for user and admin
  const userNavItems = [
    { icon: "fa-solid fa-user", text: "Profile", onClick: () => navigate("/user/profile") },
    { icon: "fa-solid fa-clock-rotate-left", text: "Activity Log", onClick: () => navigate("/user/activity-log") },
    { icon: "fa-solid fa-hand-holding-dollar", text: "Borrow", onClick: () => navigate("/user/borrower") },
    { icon: "fa-solid fa-coins", text: "Lend", onClick: () => navigate("/user/lender") },
  ];
  
  // Add verification button with dynamic properties
  if (role === "user") {
    const verificationButton = getVerificationButton();
    userNavItems.push({
      icon: verificationButton.icon,
      text: verificationButton.text,
      onClick: verificationButton.onClick,
      className: verificationButton.className
    });
  }
  
  // Complete the user nav items
  userNavItems.push(
    { icon: "fa-solid fa-wallet", text: "My Wallet", onClick: () => setWalletPopupOpen(true) },
    { icon: "fa-solid fa-circle-question", text: "Help", onClick: () => navigate("/user/help") }
  );

  const adminNavItems = [
    { icon: "fa-solid fa-user", text: "Profile", onClick: () => navigate("/admin/profile") },
    { icon: "fa-solid fa-bell", text: "Notifications", onClick: () => navigate("/admin/notification") },
    { icon: "fa-solid fa-history", text: "Activity Log", onClick: () => navigate("/admin/activity-log") },
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
              className={item.className}
            />
          ))}

          {/* Highlight Background */}
          <div id="nav-content-highlight"></div>
        </div>
      </div>
      {role === "user" && verificationStatus !== "approved" && <Verification isOpen={popupOpen} onClose={() => setPopupOpen(false)} />}
      {role === "user" && <UserWallet isOpen={walletPopupOpen} onClose={() => setWalletPopupOpen(false)} />}
    </div>
  );
};

// Updated NavButton Component with className support
const NavButton = ({ icon, text, onClick, className = "" }) => {
  return (
    <div className={`nav-button ${className}`} onClick={onClick}>
      <FontAwesomeIcon icon={icon} className="fas fa-palette" />
      <span>{text}</span>
    </div>
  );
};

export default CommonNavbar;