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
} from "lucide-react";

const AdminNotifications = ({ expanded }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or detail

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = () => {
    fetchPendingUsers();
    fetchPendingCompanies();

    if (activeTab === "history") {
      fetchVerificationHistory();
    }
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

      // Refresh verification history if that tab is active
      if (activeTab === "history") {
        fetchVerificationHistory();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
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

  const NotificationCard = ({ item, type }) => (
    <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4 mb-3 transition-all hover:shadow-md hover:border-emerald-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
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
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => handleAction(item.id, type, "rejected")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors"
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
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to list
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Documents
            </h4>

            {isUser && (
              <>
                {selectedItem.address_proof_url && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Address Proof</span>
                      </div>
                      <a
                        href={`http://localhost:5001/uploads/address-proof/${selectedItem.address_proof_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:text-blue-800"
                      >
                        View
                      </a>
                    </div>
                  </div>
                )}

                {selectedItem.bank_statement_url && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Bank Statement</span>
                      </div>
                      <a
                        href={`http://localhost:5001/uploads/bank-statements/${selectedItem.bank_statement_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:text-blue-800"
                      >
                        View
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {!isUser && selectedItem.registration_certificate_url && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">
                      Registration Certificate
                    </span>
                  </div>
                  <a
                    href={`http://localhost:5001/uploads/registration-certificates/${selectedItem.registration_certificate_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    View
                  </a>
                </div>
              </div>
            )}

            {selectedItem.status && (
              <div className="mt-8 p-4 rounded-lg border bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </h4>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
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
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() =>
                    handleAction(selectedItem.id, selectedItem.type, "approved")
                  }
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleAction(selectedItem.id, selectedItem.type, "rejected")
                  }
                  className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center gap-2"
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pending User Verifications
          </h3>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pending Company Verifications
          </h3>
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
      return (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Verification History
          </h3>
          {verificationHistory.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
              <History className="mx-auto w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">
                No verification history yet
              </p>
            </div>
          ) : (
            verificationHistory.map((item) => (
              <HistoryCard key={`${item.type}-${item.id}`} item={item} />
            ))
          )}
        </div>
      );
    }
  };

  return (
    <div
      className={`bg-white p-10 rounded-lg shadow-sm border border-gray-200 ${
        expanded ? "ml-[18%]" : "ml-24"
      } transition-all`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          Verification Queue
        </h2>
        <div className="flex space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            {pendingUsers.length} Users
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {pendingCompanies.length} Companies
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 flex items-center gap-1 border-b-2 font-medium text-sm ${
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
            className={`py-2 px-4 flex items-center gap-1 border-b-2 font-medium text-sm ${
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
            className={`py-2 px-4 flex items-center gap-1 border-b-2 font-medium text-sm ${
              activeTab === "history"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("history");
              setViewMode("list");
              setSelectedItem(null);
            }}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default AdminNotifications;
