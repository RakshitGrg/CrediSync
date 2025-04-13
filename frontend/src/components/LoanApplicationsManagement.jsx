import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserCheck, 
  UserX,
  DollarSign,
  Calendar,
  Users,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

const LoanApplicationsManagement = ({expanded}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeApplication, setActiveApplication] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get lender email from local storage or context
  const lenderEmail = localStorage.getItem('email'); // Replace with your auth method
  
  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    setIsRefreshing(true);
    
    try {
      const response = await axios.get(`http://localhost:5001/api/loans/applications?email=${lenderEmail}`);
      setApplications(response.data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 600); // Give a visual indication of refresh
    }
  };
  
  useEffect(() => {
    fetchApplications();
  }, [lenderEmail]);
  
  const handleApprove = async (applicationId) => {
    setProcessingId(applicationId);
    
    try {
      await axios.post('http://localhost:5001/api/loans/applications/approve', {
        applicationId,
        lenderEmail
      });
      
      // Remove this application from the list
      setApplications(prev => prev.filter(app => app.application_id !== applicationId));
      setActiveApplication(null);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve application. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (applicationId) => {
    setProcessingId(applicationId);
    
    try {
      await axios.post('http://localhost:5001/api/loans/applications/reject', {
        applicationId,
        lenderEmail
      });
      
      // Update application status
      setApplications(prev => prev.map(app => 
        app.application_id === applicationId 
          ? { ...app, status: 'rejected' } 
          : app
      ));
      setActiveApplication(null);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject application. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (loading && !isRefreshing) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="w-16 h-16 relative">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-green-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-green-800 font-medium">Loading applications...</p>
      </div>
    );
  }
  
  if (applications.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8 ${expanded ? 'ml-[18%]' : 'ml-24'} transition-all duration-300 ease-in-out`}>
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 transition-all duration-300 hover:shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform duration-500 hover:scale-110">
            <Users className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">No Applications Yet</h2>
          <p className="text-gray-600 mb-8 text-center">
            You don't have any pending loan applications at this time.
          </p>
          <button 
            onClick={fetchApplications}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Applications
          </button>
        </div>
      </div>
    );
  }
  
  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8 ${expanded ? 'ml-[18%]' : 'ml-24'} transition-all duration-300`}>
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl shadow-lg p-6 mb-6 transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-2xl font-bold text-white">Loan Applications Dashboard</h1>
        <p className="text-green-100 mt-1">
          Review and manage applications for your loans
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 border-l-4 border-red-500 rounded-md mb-6 shadow-sm flex items-start animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-gray-700 font-medium">Filter:</span>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-md border border-green-300 bg-white pl-3 pr-10 py-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 text-sm transition-all duration-200"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronRight className="h-4 w-4 text-gray-500 rotate-90" />
            </div>
          </div>
        </div>
        
        <button
          onClick={fetchApplications}
          disabled={isRefreshing}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
            isRefreshing 
              ? 'bg-green-100 text-green-800 cursor-not-allowed' 
              : 'text-white bg-green-600 hover:bg-green-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="flex rounded-b-xl shadow-lg overflow-hidden bg-white">
        {/* Applications list */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="divide-y divide-gray-200">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No applications match the selected filter
              </div>
            ) : (
              filteredApplications.map(application => (
                <div 
                  key={application.application_id}
                  className={`p-4 cursor-pointer hover:bg-green-50 transition-all duration-200 ${
                    activeApplication?.application_id === application.application_id 
                      ? 'bg-green-50 border-l-4 border-green-500 pl-3' 
                      : ''
                  }`}
                  onClick={() => setActiveApplication(application)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {application.borrower_name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    } transition-all duration-200`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 flex items-center mb-1">
                    <DollarSign className="w-3 h-3 mr-1 text-green-600" />
                    {formatCurrency(application.amount)} loan
                  </div>
                  
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1 text-green-600" />
                    Applied {formatDate(application.application_date)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Application details */}
        <div className="w-2/3 p-6 bg-white overflow-y-auto max-h-[calc(100vh-220px)]">
          {activeApplication ? (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Application from {activeApplication.borrower_name}
                  </h2>
                  <p className="text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-green-600" />
                    Applied on {formatDate(activeApplication.application_date)}
                  </p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  activeApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                } transition-all duration-200`}>
                  {activeApplication.status.charAt(0).toUpperCase() + activeApplication.status.slice(1)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <h3 className="font-semibold text-green-800 mb-4 pb-2 border-b border-green-200">
                    Borrower Information
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="text-gray-600 w-32 flex-shrink-0">Name:</span>
                      <span className="font-medium text-gray-900">{activeApplication.borrower_name}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600 w-32 flex-shrink-0">Email:</span>
                      <span className="font-medium text-gray-900">{activeApplication.borrower_email}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600 w-32 flex-shrink-0">Phone:</span>
                      <span className="font-medium text-gray-900">{activeApplication.borrower_phone || 'Not provided'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600 w-32 flex-shrink-0">Verification:</span>
                      <span className={`font-medium flex items-center ${
                        activeApplication.borrower_verification === 'verified' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {activeApplication.borrower_verification === 'verified' ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {activeApplication.borrower_verification || 'Pending'}
                          </>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <h3 className="font-semibold text-green-800 mb-4 pb-2 border-b border-green-200">
                    Financial Information
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="text-gray-600 w-32 flex-shrink-0">Monthly Income:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(activeApplication.monthly_income)}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600 w-32 flex-shrink-0">Employment:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {activeApplication.employment_status.replace('_', ' ')}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-50 p-5 rounded-lg shadow-sm mb-8 transition-all duration-200 hover:shadow-md">
                <h3 className="font-semibold text-green-800 mb-4 pb-2 border-b border-green-200">
                  Loan Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-xs text-gray-500 mb-1">Loan Amount</div>
                    <div className="font-bold text-gray-900">{formatCurrency(activeApplication.amount)}</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-green-600 font-bold text-xl mb-2">%</div>
                    <div className="text-xs text-gray-500 mb-1">Interest Rate</div>
                    <div className="font-bold text-gray-900">{activeApplication.interestRate}%</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="font-bold text-gray-900">{activeApplication.duration} months</div>
                  </div>
                </div>
              </div>
              
              {activeApplication.reason_for_loan && (
                <div className="mb-8 bg-green-50 p-5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <h3 className="font-semibold text-green-800 mb-4 pb-2 border-b border-green-200">
                    Reason for Loan
                  </h3>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-700 italic">{activeApplication.reason_for_loan}</p>
                  </div>
                </div>
              )}
              
              {activeApplication.status === 'pending' && (
                <div className="flex space-x-4 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(activeApplication.application_id)}
                    disabled={processingId === activeApplication.application_id}
                    className={`flex-1 flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 transition-all duration-200 ${
                      processingId === activeApplication.application_id 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:bg-green-700 hover:shadow transform hover:-translate-y-1'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  >
                    {processingId === activeApplication.application_id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                    ) : (
                      <UserCheck className="w-4 h-4 mr-2" />
                    )}
                    Approve Application
                  </button>
                  
                  <button
                    onClick={() => handleReject(activeApplication.application_id)}
                    disabled={processingId === activeApplication.application_id}
                    className={`flex-1 flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 transition-all duration-200 ${
                      processingId === activeApplication.application_id 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:bg-red-700 hover:shadow transform hover:-translate-y-1'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                  >
                    {processingId === activeApplication.application_id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                    ) : (
                      <UserX className="w-4 h-4 mr-2" />
                    )}
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 transform transition-transform duration-500 hover:rotate-12">
                <Search className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Application</h3>
              <p className="text-gray-500 max-w-md">
                Choose a loan application from the list to view details and take action
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add some custom animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoanApplicationsManagement;