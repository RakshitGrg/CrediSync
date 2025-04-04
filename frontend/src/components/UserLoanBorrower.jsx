import React, { useState } from "react";
import {
  DollarSign,
  Percent,
  Calendar,
  User,
  Briefcase,
  FileText,
  CreditCard,
} from "lucide-react";

const UserLoanBorrower = () => {
  const [requestData, setRequestData] = useState({
    amount: "",
    term: "",
    employment: "",
    income: "",
    interestRate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Loan Requested:", requestData);
    alert("Loan Request Submitted Successfully!");
    try {
      const response = await fetch("http://localhost:5001/matchloans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        alert("Loan Asked Successfully!");
      } else {
        alert("Failed to match loan. Please try again.");
      }
    } catch (error) {
      console.error("Error matching loan:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-8">
          Request a Loan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Loan Amount Needed ($)
            </label>
            <input
              type="number"
              name="amount"
              value={requestData.amount}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter desired loan amount"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 mr-2 text-green-600" />
              Loan Purpose
            </label>
            <select
              name="purpose"
              value={requestData.purpose}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Select loan purpose</option>
              <option value="business">Business</option>
              <option value="education">Education</option>
              <option value="personal">Personal</option>
              <option value="home">Home Improvement</option>
              <option value="debt">Debt Consolidation</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 mr-2 text-green-600" />
              Preferred Loan Term (Months)
            </label>
            <input
              type="number"
              name="term"
              value={requestData.term}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter preferred term"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Briefcase className="w-4 h-4 mr-2 text-green-600" />
              Employment Status
            </label>
            <select
              name="employment"
              value={requestData.employment}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Select employment status</option>
              <option value="full-time">Full-Time Employed</option>
              <option value="part-time">Part-Time Employed</option>
              <option value="self-employed">Self-Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Monthly Income ($)
            </label>
            <input
              type="number"
              name="income"
              value={requestData.income}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter your monthly income"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Percent className="w-4 h-4 mr-2 text-green-600" />
              Interest Rate (%)
            </label>
            <input
              type="number"
              name="interestRate"
              value={requestData.interestRate}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter interest rate"
            />
          </div>

          {/* <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <CreditCard className="w-4 h-4 mr-2 text-green-600" />
              Credit Score
            </label>
            <input
              type="number"
              name="creditScore"
              value={requestData.creditScore}
              onChange={handleChange}
              required
              min="300"
              max="850"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter your credit score (300-850)"
            /> */}
          {/* </div> */}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Submit Loan Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLoanBorrower;
