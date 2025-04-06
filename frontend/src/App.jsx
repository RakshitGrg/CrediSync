import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import UserSignupForm from "./components/auth/UserSignupForm";
import UserLoginForm from "./components/auth/UserLoginForm";
import CompanySignupForm from "./components/auth/CompanySignupForm";
import CompanyLoginForm from "./components/auth/CompanyLoginForm";
import AdminSignupForm from "./components/auth/AdminSignupForm";
import AdminLoginForm from "./components/auth/AdminLoginForm";
import Verification from "./components/Verification";
import { useState } from "react";
import AuthNavbar from "./components/AuthNavbar";
import CommonNavbar from "./components/CommonNavbar";
import AdminNotifications from "./components/AdminNotifications";
import UserLoan from "./components/UserLoan";
import Borrower from "./components/Borrower";
import UserLoanBorrower from "./components/UserLoanBorrower";
import UserProfile from "./components/UserProfile";
import AdminProfile from "./components/AdminProfile";
import { useEffect } from "react";
import UserWallet from "./components/UserWallet";

function App() {
  const [isLogin, setIsLogin] = useState(() => {
    return localStorage.getItem("token") !== null;
  });

  const [userType, setUserType] = useState(() => {
    return localStorage.getItem("userType") || "user";
  });

  const [expanded, setExpanded] = useState(true);

  return (
    <Router>
      <InnerApp
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        userType={userType}
        setUserType={setUserType}
        expanded={expanded}
        setExpanded={setExpanded}
      />
    </Router>
  );
}
function InnerApp({
  isLogin,
  setIsLogin,
  userType,
  setUserType,
  expanded,
  setExpanded,
}) {
  const location = useLocation(); // Now it's inside Router!
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogin(token !== null);
  }, [location.pathname, setIsLogin]); // Re-check on route change

  return (
    <>
      {isLogin && location.pathname !== "/" && (
        <CommonNavbar
          role={userType}
          setExpanded={setExpanded}
          expanded={expanded}
        />
      )}

      <Routes>
        {/* User Routes */}
        <Route
          path="/user/login"
          element={<UserLoginForm setUserType={setUserType} />}
        />
        <Route
          path="/user/signup"
          element={<UserSignupForm setUserType={setUserType} />}
        />
        {/* <Route path="/user/messages" element={<Verification />} /> */}
        <Route path="/user/profile" element={<UserProfile />} />
        {/* <Route path="/user/wallet" element={<UserWallet />} /> */}

        {/* Company Routes */}
        <Route path="/company/signup" element={<CompanySignupForm />} />
        <Route path="/company/login" element={<CompanyLoginForm />} />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={<AdminLoginForm setUserType={setUserType} />}
        />
        <Route
          path="/admin/signup"
          element={<AdminSignupForm setUserType={setUserType} />}
        />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route
          path="/admin/notification"
          element={<AdminNotifications expanded={expanded} />}
        />

        {/* User Loan Routes */}
        <Route
          path="/user/borrower"
          element={<Borrower expanded={expanded} />}
        />
        <Route path="/user/lender" element={<UserLoan />} />

        {/* Default Route */}
        <Route
          path="/"
          element={
            <AuthNavbar
              isLogin={isLogin}
              setIsLogin={setIsLogin}
              userType={userType}
              setUserType={setUserType}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
