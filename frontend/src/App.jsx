import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import UserLoanBorrower from "./components/UserLoanBorrower";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState("user");
  const [expanded, setExpanded] = useState(true);

  return (
    <Router>
      <InnerApp 
        isLogin={isLogin} setIsLogin={setIsLogin}
        userType={userType} setUserType={setUserType}
        expanded={expanded} setExpanded={setExpanded}
      />
    </Router>
  );
}

function InnerApp({ isLogin, setIsLogin, userType, setUserType, expanded, setExpanded }) {
  const location = useLocation(); // Now it's inside Router!

  return (
    <>
      {isLogin && location.pathname !== "/" && (
        <CommonNavbar role={userType} setExpanded={setExpanded} expanded={expanded} />
      )}

      <Routes>
        {/* User Routes */}
        <Route path="/user/messages" element={<Verification />} />
        <Route path="/user/signup" element={<UserSignupForm />} />
        <Route path="/user/login" element={<UserLoginForm />} />

        {/* Company Routes */}
        <Route path="/company/signup" element={<CompanySignupForm />} />
        <Route path="/company/login" element={<CompanyLoginForm />} />

        {/* Admin Routes */}
        <Route path="/admin/signup" element={<AdminSignupForm />} />
        <Route path="/admin/login" element={<AdminLoginForm />} />
        <Route path="/admin/notification" element={<AdminNotifications expanded={expanded} />} />

        {/* User Loan Routes */}
        <Route path="/user/borrower" element={<UserLoanBorrower />} />
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