import React, { useState } from "react";
import { DollarSign, Percent, Calendar, User, Briefcase, IndianRupeeIcon } from "lucide-react";

const LoanCreation = () => {
  const [loanData, setLoanData] = useState({
    amount: "",
    interestRate: "",
    term: "",
    employment: "",
  });
  
  const [errors, setErrors] = useState({
    amount: "",
    interestRate: "",
    term: "",
  });

  const validateField = (name, value) => {
    switch (name) {
      case "amount":
        return value > 100000 ? "Amount cannot exceed $100,000" : "";
      case "interestRate":
        return value > 20 ? "Interest rate cannot exceed 20%" : "";
      case "term":
        return value > 120 ? "Term cannot exceed 120 months" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoanData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {
      amount: validateField("amount", loanData.amount),
      interestRate: validateField("interestRate", loanData.interestRate),
      term: validateField("term", loanData.term),
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== "")) {
      return; // Don't submit if there are errors
    }
    
    const userEmail = localStorage.getItem("email");
    const loanDetails = {
      ...loanData,
      email: userEmail, // Include user email in the request payload
    };
    console.log(loanDetails);

    try {
      const response = await fetch("http://localhost:5001/createLoan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanDetails),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Loan Created Successfully!");
      } else {
        alert("Failed to create loan. Please try again.");
      }
    } catch (error) {
      console.error("Error creating loan:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-8">
          Create a New Loan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <IndianRupeeIcon className="w-4 h-4 mr-2 text-green-600" />
              Loan Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={loanData.amount}
              onChange={handleChange}
              required
              max="100000"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.amount ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors`}
              placeholder="Enter loan amount (max ₹100,000)"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Percent className="w-4 h-4 mr-2 text-green-600" />
              Interest Rate (%)
            </label>
            <input
              type="number"
              name="interestRate"
              value={loanData.interestRate}
              onChange={handleChange}
              required
              step="0.01"
              max="20"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.interestRate ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors`}
              placeholder="Enter interest rate (max 20%)"
            />
            {errors.interestRate && (
              <p className="text-red-500 text-xs mt-1">{errors.interestRate}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 mr-2 text-green-600" />
              Loan Term (Months)
            </label>
            <input
              type="number"
              name="term"
              value={loanData.term}
              onChange={handleChange}
              required
              max="120"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.term ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors`}
              placeholder="Enter loan term (max 120 months)"
            />
            {errors.term && (
              <p className="text-red-500 text-xs mt-1">{errors.term}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Briefcase className="w-4 h-4 mr-2 text-green-600" />
              Employment Status
            </label>
            <select
              name="employment"
              value={loanData.employment}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Select employment status</option>
              <option value="full_time">Full-Time Employed</option>
              <option value="part_time">Part-Time Employed</option>
              <option value="self_employed">Self-Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Create Loan
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoanCreation;