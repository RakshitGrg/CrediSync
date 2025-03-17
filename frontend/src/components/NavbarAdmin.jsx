import React from "react";
import "./Navbar.css"; // Import your custom CSS file
import AdminNotifications from "./AdminNotifications";
import Verification from "./Verification";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

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
  faQuestionCircle
);

const UserProfileNavbar = ({ setExpanded, expanded }) => {
  const [user, setUser] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8000/user/userData", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.log("Network error:", error);
      }
    };
    fetchUserData();
  }, [user?._id]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/user/logout", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (data.message === "Logged out successfully") {
        navigate("/aboutUs");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex flex-row w-full">
    <div id="nav-bar">
      {/* Toggle Checkbox for Responsive Navbar */}
      <input id="nav-toggle" type="checkbox" />

      {/* Header Section */}
      <div id="nav-header">
        {/* Navbar Title with Icon */}
        <a id="nav-title" target="_blank" rel="noopener noreferrer">
          <div className="flex flex-row ml-3">
            <Sprout className="h-5 w-5 mt-2.5" />
            User Profile
          </div>
        </a>

        {/* Hamburger Menu for Mobile */}
        <label
  htmlFor="nav-toggle"
  id="nav-toggle-label"
  onClick={() => {
    setExpanded((prev) => {
      console.log("Expanded:", !prev);
      return !prev;
    });
  }}
>

          <span id="nav-toggle-burger"></span>
        </label>
        <hr />
      </div>

      {/* Navigation Content */}
      <div id="nav-content">
        {/* Navigation Buttons */}
        <NavButton
          icon="fa-solid fa-user"
          text="Profile"
          onClick={() => {
            navigate("/user/profile");
          }}
        />
        <NavButton
          icon="fa-solid fa-cog"
          text="Settings"
          onClick={() => {
            navigate("/user/settings");
          }}
        />
        <NavButton
          icon="fa-solid fa-bell"
          text="Notifications"
          onClick={() => {setPopupOpen(true)}}
        />
        <NavButton
          icon="fa-solid fa-history"
          text="Activity Log"
          onClick={() => {
            navigate("/user/activity-log");
          }}
        />
        {/* <NavButton
          icon="fa-solid fa-envelope"
          text="Messages"
          onClick={() => {
            navigate("/user/messages");
          }}
        /> */}
        {/* <NavButton
          icon="fa-solid fa-envelope"
          text="Borrowers"
          onClick={() => {
            navigate("/user/messages");
          }}
        />
        <NavButton
          icon="fa-solid fa-envelope"
          text="Lenders"
          onClick={() => {
            navigate("/user/messages");
          }}
        /> */}
        {/* <NavButton
          icon="fa-solid fa-envelope"
          text="Get Verified"
          onClick={() => setPopupOpen(true)} // Open the verification popup
        /> */}
        {/* <NavButton
          icon="fa-solid fa-lock"
          text="Privacy"
          onClick={() => {
            navigate("/user/privacy");
          }}
        /> */}
        <NavButton
          icon="fa-solid fa-question-circle"
          text="Help"
          onClick={() => {
            navigate("/user/help");
          }}
        />
        <hr />

        {/* Highlight Background */}
        <div id="nav-content-highlight"></div>
      </div>

      {/* Footer Section */}
      <input id="nav-footer-toggle" type="checkbox" />
      <div id="nav-footer">
        <div id="nav-footer-heading">
          {/* Avatar */}
          <div id="nav-footer-avatar">
            <img
              src="https://gravatar.com/avatar/4474ca42d303761c2901fa819c4f2547"
              alt="Avatar"
            />
          </div>

          {/* Footer Title */}
          <div id="nav-footer-titlebox">
            <a
              id="nav-footer-title"
              href="https://codepen.io/uahnbu/pens/public"
              target="_blank"
              rel="noopener noreferrer"
            >
              {user?.fullName}
            </a>
            <span id="nav-footer-subtitle">{user?.role}</span>
          </div>

          {/* Footer Toggle Icon */}
          <label htmlFor="nav-footer-toggle">
            <FontAwesomeIcon icon="caret-up" className="fas fa-caret-up" />
          </label>
        </div>

        {/* Footer Content */}
        <div id="nav-footer-content overflow-y-hidden">
          <div
            className="flex justify-center border border-white bg-white text-green-600 py-1.5 rounded-md mx-4 my-1 text-sm cursor-pointer"
            onClick={handleLogout} // Logout on click
          >
            LogOut
          </div>
        </div>
      </div>
     
      {/* <AdminNotifications /> */}
    </div>
    <AdminNotifications isOpen={popupOpen} onClose={() => setPopupOpen(false)} className="w-5/6" expanded={expanded}/>
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

export default UserProfileNavbar;
