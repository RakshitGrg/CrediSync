import React, { useState, useEffect } from "react";
import {
  Bell,
  Building2,
  CheckCircle2,
  Users,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  User,
  Phone,
  Mail,
  CreditCard,
  FileCheck,
  History,
  RefreshCw,
  Filter,
} from "lucide-react";

const AdminNotifications = ({ expanded }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or detail
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, approved, rejected

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = () => {
    setIsLoading(true);
    fetchPendingUsers();
    fetchPendingCompanies();

    if (activeTab === "history") {
      fetchVerificationHistory();
    }
    setIsLoading(false);
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/admin/pending-users",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending users");
      }

      const data = await response.json();
      setPendingUsers(data);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  const fetchPendingCompanies = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/admin/pending-companies",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending companies");
      }

      const data = await response.json();
      setPendingCompanies(data);
    } catch (error) {
      console.error("Error fetching pending companies:", error);
    }
  };

  const fetchVerificationHistory = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/admin/verification-history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch verification history");
      }

      const data = await response.json();
      setVerificationHistory(data);
    } catch (error) {
      console.error("Error fetching verification history:", error);
    }
  };

  const handleAction = async (id, type, status) => {
    try {
      setIsLoading(true);
      const endpoint =
        type === "user"
          ? "http://localhost:5001/api/admin/approve-reject-user"
          : "http://localhost:5001/api/admin/approve-reject-company";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(
          type === "user" ? { userId: id, status } : { companyId: id, status }
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      if (type === "user") {
        setPendingUsers((prev) => prev.filter((user) => user.id !== id));
      } else {
        setPendingCompanies((prev) =>
          prev.filter((company) => company.id !== id)
        );
      }

      // Reset detail view if the current item was acted upon
      if (selectedItem && selectedItem.id === id) {
        setViewMode("list");
        setSelectedItem(null);
      }

      // Refresh all data to keep everything in sync
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const viewDetails = (item, type) => {
    setSelectedItem({ ...item, type });
    setViewMode("detail");
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedItem(null);
  };

  const filterHistoryItems = () => {
    return verificationHistory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const NotificationCard = ({ item, type }) => (
    <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4 mb-3 transition-all hover:shadow-md hover:border-emerald-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {type === "user" ? (
              <User className="w-4 h-4 text-blue-600" />
            ) : (
              <Building2 className="w-4 h-4 text-indigo-600" />
            )}
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">
              Pending
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{item.email}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Submitted {formatDate(item.submittedAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => viewDetails(item, type)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => handleAction(item.id, type, "approved")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
            disabled={isLoading}
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => handleAction(item.id, type, "rejected")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors"
            disabled={isLoading}
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );

  const HistoryCard = ({ item }) => {
    const statusColor =
      item.status === "approved"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-rose-50 text-rose-700";

    const StatusIcon = item.status === "approved" ? CheckCircle2 : XCircle;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3 transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {item.type === "user" ? (
                <User className="w-4 h-4 text-blue-600" />
              ) : (
                <Building2 className="w-4 h-4 text-indigo-600" />
              )}
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {item.type === "user" ? "User" : "Company"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.email}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Verified on {formatDate(item.verified_at)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => viewDetails(item, item.type)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DocumentPreview = ({ label, url, type }) => {
    // Determine the base URL based on document type
    let baseUrl = "http://localhost:5001/uploads/";
    
    if (type === "address") {
      baseUrl += "address-proof/";
    } else if (type === "bank") {
      baseUrl += "bank-statements/";
    } else if (type === "registration") {
      baseUrl += "registration-certificates/";
    }
    
    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{label}</span>
          </div>
          <a
            href={`${baseUrl}${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </a>
        </div>
      </div>
    );
  };

  const DetailView = () => {
    if (!selectedItem) return null;

    const isUser = selectedItem.type === "user";

    return (
      <div className="bg-white rounded-lg shadow border border-emerald-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {isUser ? (
              <User className="w-5 h-5 text-emerald-600" />
            ) : (
              <Building2 className="w-5 h-5 text-emerald-600" />
            )}
            {isUser ? "User Details" : "Company Details"}
          </h3>
          <button
            onClick={backToList}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
          >
            <span>Back to list</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-700 border-b pb-2">Basic Information</h4>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
              <p className="text-base font-medium text-gray-900">
                {selectedItem.name}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
              <p className="text-base flex items-center gap-1">
                <Mail className="w-4 h-4 text-gray-500" />
                {selectedItem.email}
              </p>
            </div>

            {selectedItem.phone && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Phone
                </h4>
                <p className="text-base flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {selectedItem.phone}
                </p>
              </div>
            )}

            {isUser && selectedItem.aadhar_number && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Aadhar Number
                </h4>
                <p className="text-base flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  {selectedItem.aadhar_number}
                </p>
              </div>
            )}

            {!isUser && selectedItem.registration_no && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Registration Number
                </h4>
                <p className="text-base flex items-center gap-1">
                  <FileCheck className="w-4 h-4 text-gray-500" />
                  {selectedItem.registration_no}
                </p>
              </div>
            )}

            {!isUser && selectedItem.business_address && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Business Address
                </h4>
                <p className="text-base text-gray-900">
                  {selectedItem.business_address}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Submitted At
              </h4>
              <p className="text-base flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                {formatDate(
                  selectedItem.submittedAt || selectedItem.verified_at
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 border-b pb-2 mb-4">Documents</h4>

            <div className="space-y-3">
              {isUser && (
                <>
                  {(selectedItem.address_proof_url || selectedItem.address_proof) && (
                    <DocumentPreview 
                      label="Address Proof" 
                      url={selectedItem.address_proof_url || selectedItem.address_proof} 
                      type="address" 
                    />
                  )}

                  {(selectedItem.bank_statement_url || selectedItem.bank_statement) && (
                    <DocumentPreview 
                      label="Bank Statement" 
                      url={selectedItem.bank_statement_url || selectedItem.bank_statement} 
                      type="bank" 
                    />
                  )}
                </>
              )}

              {!isUser && (selectedItem.registration_certificate_url || selectedItem.registration_certificate) && (
                <DocumentPreview 
                  label="Registration Certificate" 
                  url={selectedItem.registration_certificate_url || selectedItem.registration_certificate} 
                  type="registration" 
                />
              )}

              {!isUser && !selectedItem.registration_certificate_url && !selectedItem.registration_certificate && (
                <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                  <AlertCircle className="mx-auto w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-gray-500">No documents available</p>
                </div>
              )}

              {isUser && !selectedItem.address_proof_url && !selectedItem.bank_statement_url && 
                !selectedItem.address_proof && !selectedItem.bank_statement && (
                <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                  <AlertCircle className="mx-auto w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-gray-500">No documents available</p>
                </div>
              )}
            </div>

            {selectedItem.status && (
              <div className="mt-6 p-4 rounded-lg border bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </h4>
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${
                    selectedItem.status === "approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {selectedItem.status === "approved" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {selectedItem.status.charAt(0).toUpperCase() +
                      selectedItem.status.slice(1)}
                  </span>
                </div>
              </div>
            )}

            {!selectedItem.status && viewMode === "detail" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() =>
                    handleAction(selectedItem.id, selectedItem.type, "approved")
                  }
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2"
                  disabled={isLoading}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleAction(selectedItem.id, selectedItem.type, "rejected")
                  }
                  className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center gap-2"
                  disabled={isLoading}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (viewMode === "detail") {
      return <DetailView />;
    }

    if (activeTab === "users") {
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Pending User Verifications
            </h3>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
              <AlertCircle className="mx-auto w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">
                No pending user verifications
              </p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <NotificationCard key={user.id} item={user} type="user" />
            ))
          )}
        </div>
      );
    }

    if (activeTab === "companies") {
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Pending Company Verifications
            </h3>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {pendingCompanies.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
              <AlertCircle className="mx-auto w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">
                No pending company verifications
              </p>
            </div>
          ) : (
            pendingCompanies.map((company) => (
              <NotificationCard
                key={company.id}
                item={company}
                type="company"
              />
            ))
          )}
        </div>
      );
    }

    if (activeTab === "history") {
      const filteredHistory = filterHistoryItems();
      
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Verification History
            </h3>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
              <History className="mx-auto w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">
                {searchTerm || statusFilter !== "all" 
                  ? "No matching verification records found" 
                  : "No verification history yet"}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <HistoryCard key={`${item.type}-${item.id}`} item={item} />
            ))
          )}
        </div>
      );
    }
  };

  return (
    <div
      className={`bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-200 ${
        expanded ? "ml-[18%]" : "ml-24"
      } transition-all`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-0">
          <Bell className="w-5 h-5 text-emerald-600" />
          Verification Queue
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            <Users className="w-3 h-3 mr-1" />
            {pendingUsers.length} Pending Users
          </span>
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            <Building2 className="w-3 h-3 mr-1" />
            {pendingCompanies.length} Pending Companies
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            className={`py-2 px-4 flex items-center gap-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "users"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("users");
              setViewMode("list");
              setSelectedItem(null);
            }}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            className={`py-2 px-4 flex items-center gap-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "companies"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("companies");
              setViewMode("list");
              setSelectedItem(null);
            }}
          >
            <Building2 className="w-4 h-4" />
            Companies
          </button>
          <button
            className={`py-2 px-4 flex items-center gap-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "history"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("history");
              setViewMode("list");
              setSelectedItem(null);
              fetchVerificationHistory();
            }}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default AdminNotifications;