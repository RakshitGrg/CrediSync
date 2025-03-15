import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSignupForm from "./components/auth/UserSignupForm";
import UserLoginForm from "./components/auth/UserLoginForm";
import CompanySignupForm from "./components/auth/CompanySignupForm";
import CompanyLoginForm from "./components/auth/CompanyLoginForm";
import AdminSignupForm from "./components/auth/AdminSignupForm";
import AdminLoginForm from "./components/auth/AdminLoginForm";
import { useState } from "react";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState("user");

  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/user/signup" element={<UserSignupForm />} />
        <Route path="/user/login" element={<UserLoginForm />} />

        {/* Company Routes */}
        <Route path="/company/signup" element={<CompanySignupForm />} />
        <Route path="/company/login" element={<CompanyLoginForm />} />

        {/* Admin Routes */}
        <Route path="/admin/signup" element={<AdminSignupForm />} />
        <Route path="/admin/login" element={<AdminLoginForm />} />

        {/* Default Route */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-b from-emerald-800 to-emerald-600 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* User Type Selection Buttons */}
                <div className="flex justify-center space-x-4 py-8">
                  <button
                    onClick={() => setUserType("user")}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${
                      userType === "user"
                        ? "bg-emerald-700 text-white shadow-lg"
                        : "bg-white/80 text-emerald-900 hover:bg-white"
                    }`}
                  >
                    User
                  </button>
                  <button
                    onClick={() => setUserType("admin")}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${
                      userType === "admin"
                        ? "bg-emerald-700 text-white shadow-lg"
                        : "bg-white/80 text-emerald-900 hover:bg-white"
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => setUserType("company")}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${
                      userType === "company"
                        ? "bg-emerald-700 text-white shadow-lg"
                        : "bg-white/80 text-emerald-900 hover:bg-white"
                    }`}
                  >
                    Company
                  </button>
                </div>

                {/* Login/Signup Buttons */}
                <div className="flex justify-center space-x-4 py-8">
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${
                      !isLogin
                        ? "bg-emerald-700 text-white shadow-lg"
                        : "bg-white/80 text-emerald-900 hover:bg-white"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${
                      isLogin
                        ? "bg-emerald-700 text-white shadow-lg"
                        : "bg-white/80 text-emerald-900 hover:bg-white"
                    }`}
                  >
                    Login
                  </button>
                </div>

                {/* Display the appropriate form based on user type and login/signup state */}
                {userType === "user" && (isLogin ? <UserLoginForm /> : <UserSignupForm />)}
                {userType === "admin" && (isLogin ? <AdminLoginForm /> : <AdminSignupForm />)}
                {userType === "company" && (isLogin ? <CompanyLoginForm /> : <CompanySignupForm />)}
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;