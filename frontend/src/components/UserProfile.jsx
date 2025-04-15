import { User } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaWallet,
  FaFileAlt,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import UserDocuments from "./UserDocuments";

function UserProfile({ expanded }) {
  // const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    full_name: "",
    email: "",
    phone: "",
    verification_status: "",
    wallet_balance: "",
    created_at: "",
  });

  // Replace the Overview section with document information instead of wallet and verification
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Document Info Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaFileAlt className="mr-2 text-green-500" /> Documents
          </h3>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Aadhar Number
            </p>
            <p className="text-gray-900">XXXX-XXXX-1234</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Address Proof
            </p>
            <p className="text-green-600 flex items-center">
              <FaCheckCircle className="mr-1" /> Uploaded
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Bank Statement
            </p>
            <p className="text-green-600 flex items-center">
              <FaCheckCircle className="mr-1" /> Uploaded
            </p>
          </div>
        </div> */}
        <UserDocuments userEmail={localStorage.getItem("email")}/>
      </div>

      {/* Activity Card - Keep this one */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaChartLine className="mr-2 text-green-500" /> Activity
          </h3>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Active Loans as Lender</span>
              <span className="font-semibold">
                {
                  loans.filter(
                    (loan) =>
                      loan.lenderId === formData.user_id && !loan.isRepaid
                  ).length
                }
              </span>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Active Loans as Borrower</span>
              <span className="font-semibold">
                {
                  loans.filter(
                    (loan) =>
                      loan.borrowerId === formData.user_id && !loan.isRepaid
                  ).length
                }
              </span>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold">{transactions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Summary Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaWallet className="mr-2 text-green-500" /> Financial Summary
          </h3>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Wallet Balance</span>
              <span className="font-semibold text-green-600">
                ₹{formData.wallet_balance.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Total Lent</span>
              <span className="font-semibold">
                ₹{calculateTotalLent().toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Total Borrowed</span>
              <span className="font-semibold">
                ₹{calculateTotalBorrowed().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add payment functionality to the loans tab
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);

  const handlePaymentSubmit = async (loanId) => {
    try {
      const response = await fetch("http://localhost:5001/paymyloan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanId,
          amount: parseFloat(paymentAmount),
          userId: formData.user_id,
          email: formData.email,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Payment successful!");
        setPaymentAmount("");
        setSelectedLoanForPayment(null);

        // Refresh data
        // fetchUserData();
      } else {
        alert(result.message || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error making payment:", error);
      alert("Payment failed. Please try again.");
    }
  };

  // Helper functions for financial calculations
  const calculateTotalLent = () => {
    return loans
      .filter((loan) => loan.lenderId === formData.user_id)
      .reduce((total, loan) => total + parseFloat(loan.amount), 0);
  };

  const calculateTotalBorrowed = () => {
    return loans
      .filter((loan) => loan.borrowerId === formData.user_id)
      .reduce((total, loan) => total + parseFloat(loan.amount), 0);
  };

  useEffect(() => {
    // Fetch user profile data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // const response = await axios.get('/api/user/profile', {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem('token')}`
        //   }
        // });

        const userEmail = localStorage.getItem("email");

        const response = await fetch("http://localhost:5001/userdata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });

        // setUser(response.data.user);
        // setFormData({
        //   full_name: response.data.user.full_name,
        //   email: response.data.user.email,
        //   phone: response.data.user.phone
        // });
        // setUser(response.data);
        const userdata = await response.json();
        setFormData({
          user_id: userdata.user_id,
          full_name: userdata.full_name,
          email: userdata.email,
          phone: userdata.phone,
          verification_status: userdata.verification_status,
          wallet_balance: Number(userdata.wallet_balance),
          created_at: userdata.created_at,
        });
        // console.log(userdata);
        // console.log("formData", formData);

        // Also fetch transactions and loans
        // const transactionsRes = await axios.get("/api/user/transactions", {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //   },
        // });
        // setTransactions(transactionsRes.data.transactions);

        const loansRes = await fetch("http://localhost:5001/loans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });
        // setLoans(loansRes.data.loans);
        const data = await loansRes.json();

        console.log("loans", data.loans);
        setLoans(data.loans);

        const txnresponse = await fetch("http://localhost:5001/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: localStorage.getItem("email") }),
        });

        const txndata = await txnresponse.json();
        setTransactions(txndata.transactions);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  useEffect(() => {
    console.log("Updated formData:", formData);
    console.log("Updated loans:", loans);
    console.log(loans.filter((loan) => loan.lenderId === 1));
  }, [formData, loans]);
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem("email");
      console.log(formData.full_name);
      // Send updated profile data to backend
      const response = await fetch("http://localhost:5001/updateprofile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_email: userEmail,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local storage if email has changed
        if (userEmail !== formData.email) {
          localStorage.setItem("email", formData.email);
        }

        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        alert(result.message || "Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const getVerificationStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center text-green-600">
            <FaCheckCircle className="mr-1" /> Verified
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center text-yellow-600">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center text-red-600">
            <FaTimesCircle className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-600">Not Verified</span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-green-50 ${
        expanded ? "ml-[18%]" : "ml-24"
      } transition-all`}
    >
      {/* Header */}
      <header className="text-green-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">User Profile</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Profile Overview */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 bg-green-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FaUser className="mr-2 text-green-500" /> Profile Information
              </h3>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-white"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {!editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Full Name
                    </p>
                    <p className="mt-1 text-lg text-gray-900">
                      {formData.full_name}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Email Address
                    </p>
                    <p className="mt-1 text-lg text-gray-900">
                      {formData.email}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Phone Number
                    </p>
                    <p className="mt-1 text-lg text-gray-900">
                      {formData.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Wallet Balance
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      ₹{formData.wallet_balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Verification Status
                    </p>
                    <div className="mt-1">
                      {getVerificationStatusBadge(formData.verification_status)}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Member Since
                    </p>
                    <p className="mt-1 text-lg text-gray-900">
                      {new Date(formData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        id="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end">
                  <button
                    type="submit"
                    className="bg-green-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "transactions"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Wallet Transactions
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "loans"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Loans
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && renderOverviewTab()}

          {activeTab === "transactions" && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <li key={transaction.transaction_id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                transaction.transaction_type === "deposit"
                                  ? "bg-green-100"
                                  : transaction.transaction_type ===
                                    "withdrawal"
                                  ? "bg-red-100"
                                  : "bg-blue-100"
                              }`}
                            >
                              {transaction.transaction_type === "deposit" && (
                                <FaWallet className="text-green-600" />
                              )}
                              {transaction.transaction_type ===
                                "withdrawal" && (
                                <FaWallet className="text-red-600" />
                              )}
                              {transaction.transaction_type === "transfer" && (
                                <FaWallet className="text-blue-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.transaction_type === "deposit" &&
                                  "Wallet Deposit"}
                                {transaction.transaction_type ===
                                  "withdrawal" && "Wallet Withdrawal"}
                                {transaction.transaction_type === "transfer" &&
                                  "Wallet Transfer"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-right">
                              <div
                                className={`text-sm font-medium ${
                                  transaction.transaction_type === "deposit"
                                    ? "text-green-600"
                                    : transaction.transaction_type ===
                                      "withdrawal"
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {transaction.transaction_type === "deposit"
                                  ? "+"
                                  : transaction.transaction_type ===
                                    "withdrawal"
                                  ? "-"
                                  : ""}
                                ₹{Math.abs(transaction.amount).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(
                                  transaction.created_at
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="px-4 py-8 text-center text-gray-500">
                      No transactions found.
                    </div>
                  </li>
                )}
              </ul>
            </div>
          )}

          {activeTab === "loans" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  As a Lender
                </h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {loans.filter((loan) => loan.lenderId === formData.user_id)
                      .length > 0 ? (
                      loans
                        .filter((loan) => loan.lenderId === formData.user_id)
                        .map((loan) => (
                          <li key={loan.loanId}>
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    Loan #{loan.loanId}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Amount: ₹{loan.amount} | Interest:{" "}
                                    {loan.interestRate}%
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Duration: {loan.duration} months | Start
                                    Date:{" "}
                                    {new Date(
                                      loan.startDate
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div>
                                  <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                      loan.borrowerId
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {loan.borrowerId ? "Active" : "Available"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                    ) : (
                      <li>
                        <div className="px-4 py-8 text-center text-gray-500">
                          No loans as a lender.
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  As a Borrower
                </h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {loans.filter(
                      (loan) => loan.borrowerId === formData.user_id
                    ).length > 0 ? (
                      loans
                        .filter((loan) => loan.borrowerId === formData.user_id)
                        .map((loan) => (
                          <li key={loan.loanId}>
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    Loan #{loan.loanId}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Amount: ₹{loan.amount} | Interest:{" "}
                                    {loan.interestRate}%
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Duration: {loan.duration} months | Start
                                    Date:{" "}
                                    {new Date(
                                      loan.startDate
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mb-2">
                                    Active
                                  </span>
                                  {selectedLoanForPayment === loan.loanId ? (
                                    <div className="flex items-center mt-2">
                                      <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) =>
                                          setPaymentAmount(e.target.value)
                                        }
                                        placeholder="Amount"
                                        className="w-24 mr-2 px-2 py-1 border rounded text-sm"
                                      />
                                      <button
                                        onClick={() =>
                                          handlePaymentSubmit(loan.loanId)
                                        }
                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                      >
                                        Pay
                                      </button>
                                      <button
                                        onClick={() =>
                                          setSelectedLoanForPayment(null)
                                        }
                                        className="ml-1 px-2 py-1 border text-xs rounded"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setSelectedLoanForPayment(loan.loanId)
                                      }
                                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                    >
                                      Make Payment
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                    ) : (
                      <li>
                        <div className="px-4 py-8 text-center text-gray-500">
                          No loans as a borrower.
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserProfile;
