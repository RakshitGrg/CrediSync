import React, { useState } from 'react';
import {  
  IndianRupeeIcon,
  Calendar, 
  Briefcase, 
  User, 
  Phone, 
  Mail, 
  Check, 
  X, 
  ArrowLeft,
  ChevronRight,
  Calculator,
  Clock,
  Percent,
  FileText,
  CreditCard
} from 'lucide-react';
import LoanApplicationForm from './LoanApplicationForm';

const LoanDetails = ({ loan, onBack, onApply }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  if (!loan) return null;
  
  // Format functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate monthly payment
  const calculateMonthlyPayment = (amount, interestRate, duration) => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = amount * monthlyRate * Math.pow(1 + monthlyRate, duration) / (Math.pow(1 + monthlyRate, duration) - 1);
    return payment.toFixed(2);
  };

  // Calculate total payment
  const calculateTotalPayment = (monthlyPayment, duration) => {
    return (monthlyPayment * duration).toFixed(2);
  };

  // Calculate total interest
  const calculateTotalInterest = (totalPayment, principal) => {
    return (totalPayment - principal).toFixed(2);
  };

  const monthlyPayment = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.duration);
  const totalPayment = calculateTotalPayment(monthlyPayment, loan.duration);
  const totalInterest = calculateTotalInterest(totalPayment, loan.amount);

  const handleApply = () => {
    setShowApplicationForm(true);
  };

  // If application form should be shown, render it
  if (showApplicationForm) {
    return (
      <LoanApplicationForm 
        loan={loan} 
        onBack={() => setShowApplicationForm(false)} 
        onSuccess={onApply} 
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-green-600 p-6">
        <button 
          onClick={onBack}
          className="flex items-center text-green-100 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to loans
        </button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <IndianRupeeIcon className="w-6 h-6 mr-2" />
            {formatCurrency(loan.amount)} Loan
          </h1>
          <span className="bg-green-800 text-green-100 px-4 py-1 rounded-full font-medium">
            {loan.interestRate}% APR
          </span>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-green-50 px-6 flex border-b border-green-100">
        <button 
          className={`py-4 px-4 font-medium flex items-center ${
            activeTab === 'overview' 
              ? 'text-green-700 border-b-2 border-green-600' 
              : 'text-gray-600 hover:text-green-600'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Overview
        </button>
        <button 
          className={`py-4 px-4 font-medium flex items-center ${
            activeTab === 'details' 
              ? 'text-green-700 border-b-2 border-green-600' 
              : 'text-gray-600 hover:text-green-600'
          }`}
          onClick={() => setActiveTab('details')}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Financial Details
        </button>
        <button 
          className={`py-4 px-4 font-medium flex items-center ${
            activeTab === 'lender' 
              ? 'text-green-700 border-b-2 border-green-600' 
              : 'text-gray-600 hover:text-green-600'
          }`}
          onClick={() => setActiveTab('lender')}
        >
          <User className="w-4 h-4 mr-2" />
          Lender
        </button>
      </div>
      
      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Loan Information */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Loan Summary</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Loan Amount:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(loan.amount)}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-medium text-gray-900">{loan.interestRate}% APR</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Term Length:</span>
                    <span className="font-medium text-gray-900">{loan.duration} months</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Payment:</span>
                    <span className="font-medium text-green-700">{formatCurrency(monthlyPayment)}</span>
                  </li>
                </ul>
              </div>
              
              {/* Timeline Information */}
              <div className="bg-blue-50 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-blue-800 mb-4">Loan Timeline</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-blue-200 p-1 rounded-full mr-3 mt-1">
                      <Calendar className="w-4 h-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Start Date</p>
                      <p className="text-blue-700">{formatDate(loan.startDate)}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-200 p-1 rounded-full mr-3 mt-1">
                      <Clock className="w-4 h-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Duration</p>
                      <p className="text-blue-700">{loan.duration} months ({(loan.duration / 12).toFixed(1)} years)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-200 p-1 rounded-full mr-3 mt-1">
                      <Calendar className="w-4 h-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">End Date</p>
                      <p className="text-blue-700">
                        {formatDate(new Date(new Date(loan.startDate).setMonth(
                          new Date(loan.startDate).getMonth() + loan.duration
                        )))}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Loan Features */}
            <div className="mt-6 bg-green-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-green-800 mb-4">Loan Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="bg-green-200 p-2 rounded-full mr-3">
                    <Check className="w-4 h-4 text-green-700" />
                  </div>
                  <span className="text-green-800">Fixed interest rate</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-200 p-2 rounded-full mr-3">
                    <Check className="w-4 h-4 text-green-700" />
                  </div>
                  <span className="text-green-800">No early repayment fees</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-200 p-2 rounded-full mr-3">
                    <Check className="w-4 h-4 text-green-700" />
                  </div>
                  <span className="text-green-800">Online account management</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-200 p-2 rounded-full mr-3">
                    <Check className="w-4 h-4 text-green-700" />
                  </div>
                  <span className="text-green-800">Transparent terms</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div>
            {/* Financial Breakdown */}
            <div className="bg-green-50 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-4">Financial Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-gray-600 mb-1">Principal Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.amount)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-gray-600 mb-1">Total Interest</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalInterest)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-gray-600 mb-1">Total Payment</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPayment)}</p>
                </div>
              </div>
            </div>
            
            {/* Payment Details */}
            <div className="bg-blue-50 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Payment Schedule</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-800">Monthly Payment</p>
                    <p className="text-gray-600 text-sm">Due on the same day each month</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyPayment)}</p>
                </div>
                
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-800">First Payment Due</p>
                    <p className="text-gray-600 text-sm">One month after loan start date</p>
                  </div>
                  <p className="font-medium text-gray-800">
                    {formatDate(new Date(new Date(loan.startDate).setMonth(
                      new Date(loan.startDate).getMonth() + 1
                    )))}
                  </p>
                </div>
                
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-800">Final Payment Due</p>
                    <p className="text-gray-600 text-sm">End of loan term</p>
                  </div>
                  <p className="font-medium text-gray-800">
                    {formatDate(new Date(new Date(loan.startDate).setMonth(
                      new Date(loan.startDate).getMonth() + loan.duration
                    )))}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Interest Information */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Interest Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interest Rate (APR):</span>
                  <span className="font-medium text-gray-900">{loan.interestRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Interest Rate:</span>
                  <span className="font-medium text-gray-900">{(loan.interestRate / 12).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Interest Paid:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interest-to-Principal Ratio:</span>
                  <span className="font-medium text-gray-900">{(totalInterest / loan.amount * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'lender' && (
          <div>
            {/* Lender Information */}
            <div className="bg-blue-50 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Lender Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="w-5 h-5 mr-3 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Name</p>
                    <p className="text-gray-800 text-lg">{loan.lenderDetails?.name || 'Anonymous Lender'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="w-5 h-5 mr-3 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <p className="text-gray-800 text-lg">{loan.lenderDetails?.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 mr-3 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <p className="text-gray-800 text-lg">{loan.lenderDetails?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lender Requirements */}
            <div className="bg-green-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-green-800 mb-4">Lender Requirements</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="mr-3 text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700">Proof of income</p>
                </div>
                <div className="flex items-center">
                  <div className="mr-3 text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700">Valid ID documentation</p>
                </div>
                <div className="flex items-center">
                  <div className="mr-3 text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700">Bank account verification</p>
                </div>
                <div className="flex items-center">
                  <div className="mr-3 text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700">Electronic signature capability</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with Action Button */}
      <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <p className="text-gray-600">Monthly Payment</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(monthlyPayment)}</p>
        </div>
        
        <button 
          onClick={handleApply}
          className="flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white
            bg-green-600 hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 min-w-[180px]"
        >
          Apply for This Loan
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default LoanDetails;