import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Wallet,
  ArrowDownCircle,
  Clock,
  RefreshCw,
  X,
} from "lucide-react";

// Main component with proper hook usage
const UserWallet = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showTransactions, setShowTransactions] = useState(false);
  const [token, setToken] = useState("");

  // Fetch token from localStorage once component mounts
  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (authToken) {
      setToken(authToken);
    }
  }, []);

  // Fetch data whenever token changes
  useEffect(() => {
    if (token && isOpen) {
      fetchBalance();
      fetchTransactions();
    }
  }, [token, isOpen]);

  const fetchBalance = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/wallet/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Failed to fetch balance");
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/wallet/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5001/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBalance(data.newBalance);
        setAmount("");
        setMessage("Money added successfully!");
        fetchTransactions();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Failed to add money");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const refreshData = () => {
    fetchBalance();
    fetchTransactions();
  };

  // Early return with null if not open, but keep the component mounted
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[48rem] max-w-[95vw] max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        {/* Wallet Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Wallet size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Wallet</h2>
            </div>

            {/* Header Action Buttons - Positioned side by side */}
            <div className="flex space-x-2">
              <button
                onClick={refreshData}
                className="text-green-600 bg-white p-2 rounded-full hover:bg-green-50 transition-colors"
                aria-label="Refresh wallet data"
              >
                <RefreshCw size={18} />
              </button>

              <button
                onClick={onClose}
                className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Close wallet"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-white/80">Current Balance</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Add Money Form */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <PlusCircle size={18} className="mr-2 text-green-600" />
            Add Money
          </h3>

          <div className="flex space-x-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleDeposit}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Add Money</span>
                </>
              )}
            </button>
          </div>

          {message && (
            <div
              className={`mt-3 p-3 rounded-lg ${
                message.toLowerCase().includes("error") ||
                message.toLowerCase().includes("failed") ||
                message.toLowerCase().includes("invalid")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              } flex items-center`}
            >
              {message.toLowerCase().includes("error") ||
              message.toLowerCase().includes("failed") ||
              message.toLowerCase().includes("invalid") ? (
                <X size={16} className="mr-2" />
              ) : (
                <PlusCircle size={16} className="mr-2" />
              )}
              {message}
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[100, 500, 1000, 5000].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                className="px-4 py-2 bg-white text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                ₹{quickAmount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="p-6">
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="flex items-center text-gray-700 hover:text-green-700 space-x-2 transition-colors w-full justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-green-200"
          >
            <div className="flex items-center">
              <Clock size={18} className="mr-2 text-green-600" />
              <span className="font-medium">Recent Transactions</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full mr-2">
                {transactions.length}
              </span>
              <span
                className={`transform transition-transform ${
                  showTransactions ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </div>
          </button>

          {showTransactions && (
            <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden">
              {transactions.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.transaction_id}
                      className={`flex items-center justify-between p-4 ${
                        index !== transactions.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            tx.transaction_type === "deposit"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {tx.transaction_type === "deposit" ? (
                            <ArrowDownCircle
                              size={18}
                              className="text-green-600"
                            />
                          ) : (
                            <ArrowDownCircle
                              size={18}
                              className="text-red-600 transform rotate-180"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {tx.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-medium ${
                          tx.transaction_type === "deposit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.transaction_type === "deposit" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 text-center text-gray-500 flex flex-col items-center justify-center">
                  <Clock size={32} className="text-gray-300 mb-2" />
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWallet;
