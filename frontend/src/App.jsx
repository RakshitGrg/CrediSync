import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSignupForm from "./components/auth/UserSignupForm";
import UserLoginForm from "./components/auth/UserLoginForm";
import CompanySignupForm from "./components/auth/CompanySignupForm";
import CompanyLoginForm from "./components/auth/CompanyLoginForm";
import AdminSignupForm from "./components/auth/AdminSignupForm";
import AdminLoginForm from "./components/auth/AdminLoginForm";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import NavbarAdmin from "./components/NavbarAdmin";
import Verification from "./components/Verification";
import { useState } from "react";
import AuthNavbar from "./components/AuthNavbar";
import UserLoan from "./components/UserLoan";
import UserLoanBorrower from "./components/UserLoanBorrower";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState("user");
  const [expanded, setExpanded] = useState(true);

  return (
    <Router>
   
      <Routes>
        {/* User Routes */}
        <Route path="/user/dashboard" element={<HomePage />} />

        <Route path="/user/messages" element={<Verification />} />
        <Route path="/user/signup" element={<UserSignupForm />} />
        <Route path="/user/login" element={<UserLoginForm />} />
        {/* <Route path="/user/lender" element={<div className="flex flex-row gap-5"> <Navbar /> <UserLoan /> </div>} /> */}
        <Route
  path="/user/lender"
  element={
    <div className="flex flex-row min-h-screen">
      {/* Sidebar Navbar */}
      <div className="w-[250px] min-w-[250px] bg-white shadow-md">
        <Navbar />
      </div>

      {/* Main Content Area for Loan Creation */}
      <div className="flex-1 p-6 bg-gray-100">
        <UserLoan />
      </div>
    </div>
  }
/>


<Route
  path="/user/borrower"
  element={
    <div className="flex flex-row min-h-screen">
      {/* Sidebar Navbar */}
      <div className="w-[250px] min-w-[250px] bg-white shadow-md">
        <Navbar />
      </div>

      {/* Main Content Area for Loan Creation */}
      <div className="flex-1 p-6 bg-gray-100">
        <UserLoanBorrower />
      </div>
    </div>
  }
/>

        {/* Company Routes */}
        <Route path="/company/signup" element={<CompanySignupForm />} />
        <Route path="/company/login" element={<CompanyLoginForm />} />

        {/* Admin Routes */}
        <Route path="/admin/signup" element={<AdminSignupForm />} />
        <Route path="/admin/login" element={<AdminLoginForm />} />
        <Route path="/admin/dashboard" element={<NavbarAdmin setExpanded={setExpanded} expanded={expanded}/>}/>

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
    </Router>
  );
}

export default App;
