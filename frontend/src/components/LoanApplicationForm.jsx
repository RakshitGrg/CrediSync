import React, { useState } from 'react';
import { 
  DollarSign, 
  FileText, 
  Briefcase, 
  Send,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import axios from 'axios';

const LoanApplicationForm = ({ loan, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    employmentStatus: 'full_time',
    reasonForLoan: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Get user email from local storage or context
  const userEmail = localStorage.getItem('email'); // Replace with your auth method
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5001/api/loans/apply', {
        loanId: loan.loanId,
        email: userEmail,
        monthlyIncome: formData.monthlyIncome,
        employmentStatus: formData.employmentStatus,
        reasonForLoan: formData.reasonForLoan
      });
      
      setSuccess(true);
      setLoading(false);
      
      // Wait a moment, then call the success callback
      setTimeout(() => {
        if (onSuccess) onSuccess(response.data);
      }, 2000);
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-2xl mx-auto p-8 text-center border-t-4 border-green-500">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Send className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Your loan application for {formatCurrency(loan.amount)} has been successfully submitted.
          The lender will review your application and get back to you soon.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
        >
          Back to Loans
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-2xl mx-auto border border-gray-200">
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-6">
        <button 
          onClick={onBack}
          className="text-green-100 hover:text-white mb-4 flex items-center group transition-all"
        >
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          Back to loan details
        </button>
        <h1 className="text-2xl font-bold text-white">Apply for Loan</h1>
        <p className="text-green-100 mt-1">
          {formatCurrency(loan.amount)} at {loan.interestRate}% for {loan.duration} months
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 border-l-4 border-red-500 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <DollarSign className="w-4 h-4 inline mr-1 text-green-600" />
              Monthly Income
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="monthlyIncome"
                required
                value={formData.monthlyIncome}
                onChange={handleChange}
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your monthly income is used to determine loan eligibility
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <Briefcase className="w-4 h-4 inline mr-1 text-green-600" />
              Employment Status
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="full_time">Full Time Employment</option>
              <option value="part_time">Part Time Employment</option>
              <option value="self_employed">Self Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-1 text-green-600" />
              Reason for Loan (Optional)
            </label>
            <textarea
              name="reasonForLoan"
              value={formData.reasonForLoan}
              onChange={handleChange}
              rows={4}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
              placeholder="Please describe why you're applying for this loan..."
            />
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg border border-green-100">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Loan Details
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">{formatCurrency(loan.amount)}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">{loan.interestRate}%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Term:</span>
                <span className="font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">{loan.duration} months</span>
              </li>
            </ul>
          </div>
          
          <div className="flex items-center bg-gray-50 p-4 rounded-lg">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-3 block text-sm text-gray-900">
              I agree to the loan terms and conditions
            </label>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-green-600 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplicationForm;