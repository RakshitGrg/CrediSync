// import React, { useState, useEffect } from 'react';
// import { DollarSign, Calendar, Briefcase, User, Phone, Mail, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

// const Borrower = ({ expanded }) => {
//   const [loanBuckets, setLoanBuckets] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedLoan, setSelectedLoan] = useState(null);
//   const [activeBucket, setActiveBucket] = useState(null);

//   useEffect(() => {
//     const userEmail = localStorage.getItem("email");
//     if (userEmail) {
//       fetchLoanBuckets(userEmail);
//     } else {
//       setError("User email not found. Please log in again.");
//       setLoading(false);
//     }
//   }, []);

//   const fetchLoanBuckets = async (userEmail) => {
//     try {
//       setLoading(true);
//       const response = await fetch('http://localhost:5001/borrower', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email: userEmail }),
//       });

//       if (!response.ok) throw new Error('Failed to fetch loans');
      
//       const data = await response.json();
//       setLoanBuckets(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   // Calculate monthly payment using loan amount, interest rate, and duration
//   const calculateMonthlyPayment = (amount, interestRate, duration) => {
//     const monthlyRate = interestRate / 100 / 12;
//     const payment = amount * monthlyRate * Math.pow(1 + monthlyRate, duration) / (Math.pow(1 + monthlyRate, duration) - 1);
//     return payment.toFixed(2);
//   };

//   const toggleBucket = (bucketKey) => {
//     setActiveBucket(activeBucket === bucketKey ? null : bucketKey);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
//           <p className="text-green-800 font-medium">Loading available loans...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
//         <div className="bg-red-50 p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-red-700 mb-2">Error Occurred</h2>
//           <p className="text-red-600 mb-6">{error}</p>
//           <button 
//             onClick={() => {
//               const userEmail = localStorage.getItem("email");
//               if (userEmail) fetchLoanBuckets(userEmail);
//             }}
//             className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const bucketCount = Object.keys(loanBuckets).length;

//   return (
//     <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8 ${expanded ? 'ml-[18%]' : 'ml-24'} transition-all`}>
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-green-800 mb-2">Available Loans</h1>
//           <p className="text-green-700">Browse {bucketCount} loan categories based on your qualification</p>
//         </div>
        
//         {bucketCount === 0 ? (
//           <div className="bg-white rounded-xl shadow-lg p-10 text-center">
//             <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
//               <DollarSign className="w-10 h-10 text-green-600" />
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Loans Available</h2>
//             <p className="text-gray-600 max-w-md mx-auto">
//               There are currently no loans available that match your profile. Please check back later or update your borrower profile.
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {Object.entries(loanBuckets).map(([bucketKey, loans]) => {
//               const amount = parseInt(bucketKey.split('_')[1]);
//               const isActive = activeBucket === bucketKey;
              
//               return (
//                 <div key={bucketKey} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
//                   <div 
//                     className={`px-6 py-5 cursor-pointer transition-colors ${isActive ? 'bg-green-700' : 'bg-green-600 hover:bg-green-650'}`}
//                     onClick={() => toggleBucket(bucketKey)}
//                   >
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h2 className="text-xl font-semibold text-white flex items-center">
//                           <DollarSign className="w-5 h-5 mr-2" />
//                           Loans up to {formatCurrency(amount)}
//                         </h2>
//                         <p className="text-green-100 mt-1">{loans.length} {loans.length === 1 ? 'loan' : 'loans'} available</p>
//                       </div>
//                       {isActive ? (
//                         <ChevronUp className="w-6 h-6 text-white" />
//                       ) : (
//                         <ChevronDown className="w-6 h-6 text-white" />
//                       )}
//                     </div>
//                   </div>

//                   {isActive && (
//                     <div className="divide-y divide-gray-100">
//                       {loans.map((loan) => {
//                         const isSelected = selectedLoan === loan.loanId;
//                         const monthlyPayment = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.duration);
                        
//                         return (
//                           <div key={loan.loanId} className="transition-colors">
//                             <div className={`p-6 ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
//                               <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
//                                 <div className="space-y-2">
//                                   <p className="text-2xl font-bold text-gray-900">
//                                     {formatCurrency(loan.amount)}
//                                   </p>
//                                   <div className="flex flex-wrap gap-x-6 gap-y-2">
//                                     <p className="text-sm text-gray-600 flex items-center">
//                                       <Calendar className="w-4 h-4 mr-1" />
//                                       {loan.duration} months
//                                     </p>
//                                     <p className="text-sm text-gray-600 flex items-center">
//                                       <Briefcase className="w-4 h-4 mr-1" />
//                                       {loan.interestRate}% APR
//                                     </p>
//                                     <p className="text-sm font-medium text-green-700">
//                                       ~{formatCurrency(monthlyPayment)}/month
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <button
//                                   onClick={() => setSelectedLoan(isSelected ? null : loan.loanId)}
//                                   className={`
//                                     px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
//                                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
//                                     ${isSelected 
//                                       ? 'bg-green-100 text-green-800 hover:bg-green-200' 
//                                       : 'bg-green-600 text-white hover:bg-green-700'}
//                                   `}
//                                 >
//                                   {isSelected ? 'Hide Details' : 'View Details'}
//                                 </button>
//                               </div>

//                               {isSelected && (
//                                 <div className="mt-6 pt-4 border-t border-gray-100">
//                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                     <div className="bg-green-50 rounded-lg p-5">
//                                       <h3 className="font-semibold text-green-800 mb-4 text-lg">Lender Details</h3>
//                                       <div className="space-y-3">
//                                         <p className="flex items-center text-gray-700">
//                                           <User className="w-5 h-5 mr-3 text-green-600" />
//                                           <span className="text-gray-900 font-medium">{loan.lenderDetails.name || 'Not provided'}</span>
//                                         </p>
//                                         <p className="flex items-center text-gray-700">
//                                           <Mail className="w-5 h-5 mr-3 text-green-600" />
//                                           {loan.lenderDetails.email || 'Not provided'}
//                                         </p>
//                                         <p className="flex items-center text-gray-700">
//                                           <Phone className="w-5 h-5 mr-3 text-green-600" />
//                                           {loan.lenderDetails.phone || 'Not provided'}
//                                         </p>
//                                       </div>
//                                     </div>
                                    
//                                     <div className="bg-blue-50 rounded-lg p-5">
//                                       <h3 className="font-semibold text-blue-800 mb-4 text-lg">Loan Summary</h3>
//                                       <div className="space-y-3">
//                                         <div className="flex justify-between">
//                                           <span className="text-gray-600">Loan Amount:</span>
//                                           <span className="font-medium text-gray-900">{formatCurrency(loan.amount)}</span>
//                                         </div>
//                                         <div className="flex justify-between">
//                                           <span className="text-gray-600">Interest Rate:</span>
//                                           <span className="font-medium text-gray-900">{loan.interestRate}% APR</span>
//                                         </div>
//                                         <div className="flex justify-between">
//                                           <span className="text-gray-600">Term Length:</span>
//                                           <span className="font-medium text-gray-900">{loan.duration} months</span>
//                                         </div>
//                                         <div className="flex justify-between">
//                                           <span className="text-gray-600">Monthly Payment:</span>
//                                           <span className="font-medium text-green-700">{formatCurrency(monthlyPayment)}</span>
//                                         </div>
//                                         <div className="flex justify-between">
//                                           <span className="text-gray-600">Start Date:</span>
//                                           <span className="font-medium text-gray-900">{formatDate(loan.startDate)}</span>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </div>
                                  
//                                   <div className="mt-6 flex justify-end">
//                                     <button 
//                                       className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 
//                                         transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
//                                     >
//                                       Apply for This Loan
//                                     </button>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Borrower;


import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Briefcase, User, Phone, Mail, Filter, Check, AlertCircle, Search, ChevronDown } from 'lucide-react';

const Borrower = ({ expanded }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    amountRange: [0, 100000],
    durationRange: [0, 120],
    interestRange: [0, 20],
  });
  const [sortBy, setSortBy] = useState('amount-asc');

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      fetchLoans(userEmail);
    } else {
      setError("User email not found. Please log in again.");
      setLoading(false);
    }
  }, []);

  const fetchLoans = async (userEmail) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/borrower', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) throw new Error('Failed to fetch loans');
      
      const data = await response.json();
      // Flatten the loan buckets into a single array
      const allLoans = [];
      Object.values(data).forEach(loanGroup => {
        allLoans.push(...loanGroup);
      });
      
      setLoans(allLoans);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  // Calculate monthly payment using loan amount, interest rate, and duration
  const calculateMonthlyPayment = (amount, interestRate, duration) => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = amount * monthlyRate * Math.pow(1 + monthlyRate, duration) / (Math.pow(1 + monthlyRate, duration) - 1);
    return payment.toFixed(2);
  };

  const toggleFilterPanel = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Apply filters and sorting to loans
  const filteredLoans = loans.filter(loan => {
    const amount = loan.amount;
    const duration = loan.duration;
    const interest = loan.interestRate;
    
    return (
      amount >= filters.amountRange[0] && 
      amount <= filters.amountRange[1] &&
      duration >= filters.durationRange[0] && 
      duration <= filters.durationRange[1] &&
      interest >= filters.interestRange[0] && 
      interest <= filters.interestRange[1]
    );
  });

  // Apply search
  const searchedLoans = searchTerm 
    ? filteredLoans.filter(loan => 
        loan.lenderDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.amount.toString().includes(searchTerm) ||
        loan.interestRate.toString().includes(searchTerm)
      )
    : filteredLoans;

  // Apply sorting
  const sortedLoans = [...searchedLoans].sort((a, b) => {
    switch (sortBy) {
      case 'amount-asc':
        return a.amount - b.amount;
      case 'amount-desc':
        return b.amount - a.amount;
      case 'interest-asc':
        return a.interestRate - b.interestRate;
      case 'interest-desc':
        return b.interestRate - a.interestRate;
      case 'duration-asc':
        return a.duration - b.duration;
      case 'duration-desc':
        return b.duration - a.duration;
      default:
        return a.amount - b.amount;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
          <p className="text-green-800 font-medium">Loading available loans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-red-50 p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Occurred</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => {
              const userEmail = localStorage.getItem("email");
              if (userEmail) fetchLoans(userEmail);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8 ${expanded ? 'ml-[18%]' : 'ml-24'} transition-all`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">Available Loans</h1>
            <p className="text-green-700">Browse {loans.length} loans tailored to your profile</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search loans..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button
              onClick={toggleFilterPanel}
              className="flex items-center justify-center bg-white text-green-700 border border-green-300 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors shadow-sm"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm appearance-none cursor-pointer"
            >
              <option value="amount-asc">Amount: Low to High</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="interest-asc">Interest: Low to High</option>
              <option value="interest-desc">Interest: High to Low</option>
              <option value="duration-asc">Duration: Shortest</option>
              <option value="duration-desc">Duration: Longest</option>
            </select>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg mb-6 p-6 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Amount Filter */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Loan Amount</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">{formatCurrency(filters.amountRange[0])}</span>
                  <span className="text-sm text-gray-600">{formatCurrency(filters.amountRange[1])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={filters.amountRange[1]}
                  onChange={(e) => handleFilterChange('amountRange', [0, parseInt(e.target.value)])}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              {/* Duration Filter */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Loan Duration</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">{filters.durationRange[0]} months</span>
                  <span className="text-sm text-gray-600">{filters.durationRange[1]} months</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="6"
                  value={filters.durationRange[1]}
                  onChange={(e) => handleFilterChange('durationRange', [0, parseInt(e.target.value)])}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              {/* Interest Rate Filter */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Interest Rate</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">{filters.interestRange[0]}%</span>
                  <span className="text-sm text-gray-600">{filters.interestRange[1]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={filters.interestRange[1]}
                  onChange={(e) => handleFilterChange('interestRange', [0, parseFloat(e.target.value)])}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Loans Grid */}
        {sortedLoans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Loans Available</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || showFilters ? 
                "No loans match your current search criteria. Try adjusting your filters." : 
                "There are currently no loans available that match your profile. Please check back later or update your borrower profile."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLoans.map((loan) => {
              const isSelected = selectedLoan === loan.loanId;
              const monthlyPayment = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.duration);
              
              return (
                <div 
                  key={loan.loanId} 
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform ${
                    isSelected ? 'ring-4 ring-green-300 scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                >
                  <div className="bg-green-600 px-5 py-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-white flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        {formatCurrency(loan.amount)}
                      </h2>
                      <span className="bg-green-800 text-green-100 text-xs font-semibold px-3 py-1 rounded-full">
                        {loan.interestRate}% APR
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-4 mb-3">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-4 h-4 mr-1 text-green-600" />
                          <span>{loan.duration} months</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Briefcase className="w-4 h-4 mr-1 text-green-600" />
                          <span>{formatDate(loan.startDate)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Monthly Payment</p>
                        <p className="text-xl font-bold text-green-700">{formatCurrency(monthlyPayment)}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center text-gray-700">
                        <User className="w-4 h-4 mr-2 text-green-600" />
                        <span>{loan.lenderDetails?.name || 'Anonymous Lender'}</span>
                      </div>
                      
                      {!isSelected && (
                        <button
                          onClick={() => setSelectedLoan(loan.loanId)}
                          className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 
                            transition-all duration-200 flex items-center justify-center"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                    
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-medium text-blue-800 mb-3">Loan Details</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Loan Amount:</span>
                                <span className="font-medium text-gray-900">{formatCurrency(loan.amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Interest Rate:</span>
                                <span className="font-medium text-gray-900">{loan.interestRate}% APR</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Term Length:</span>
                                <span className="font-medium text-gray-900">{loan.duration} months</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Monthly Payment:</span>
                                <span className="font-medium text-green-700">{formatCurrency(monthlyPayment)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start Date:</span>
                                <span className="font-medium text-gray-900">{formatDate(loan.startDate)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-medium text-green-800 mb-3">Lender Information</h3>
                            <div className="space-y-2">
                              <p className="flex items-center text-gray-700">
                                <User className="w-4 h-4 mr-2 text-green-600" />
                                <span>{loan.lenderDetails?.name || 'Not provided'}</span>
                              </p>
                              <p className="flex items-center text-gray-700">
                                <Mail className="w-4 h-4 mr-2 text-green-600" />
                                <span>{loan.lenderDetails?.email || 'Not provided'}</span>
                              </p>
                              <p className="flex items-center text-gray-700">
                                <Phone className="w-4 h-4 mr-2 text-green-600" />
                                <span>{loan.lenderDetails?.phone || 'Not provided'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between">
                          <button 
                            onClick={() => setSelectedLoan(null)}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 
                              transition-all duration-200"
                          >
                            Hide Details
                          </button>
                          
                          <button 
                            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 
                              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Apply for This Loan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Borrower;