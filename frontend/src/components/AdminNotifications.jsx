// import React, { useState } from 'react';
// import { 
//   Bell,
//   Building2,
//   CheckCircle2,
//   Users,
//   XCircle,
//   Clock,
//   AlertCircle
// } from 'lucide-react';

// const AdminNotifications = ({ isOpen, onClose, expanded }) => {
//   if (!isOpen) return null;

//   const [activeTab, setActiveTab] = useState('users');
//   const [pendingUsers, setPendingUsers] = useState([
//     { 
//       id: 1, 
//       name: "John Doe", 
//       email: "john@example.com",
//       status: "pending",
//       submittedAt: "2024-03-15T10:30:00Z"
//     },
//     { 
//       id: 2, 
//       name: "Jane Smith", 
//       email: "jane@example.com",
//       status: "pending",
//       submittedAt: "2024-03-14T15:45:00Z"
//     },
//   ]);

//   const [pendingCompanies, setPendingCompanies] = useState([
//     { 
//       id: 1, 
//       name: "TechCorp", 
//       email: "contact@techcorp.com",
//       status: "pending",
//       submittedAt: "2024-03-15T09:20:00Z"
//     },
//     { 
//       id: 2, 
//       name: "Biz Solutions", 
//       email: "info@bizsolutions.com",
//       status: "pending",
//       submittedAt: "2024-03-13T16:15:00Z"
//     },
//   ]);

//   const handleAction = (id, type, status) => {
//     if (type === "user") {
//       setPendingUsers((prev) => prev.filter((user) => user.id !== id));
//     } else {
//       setPendingCompanies((prev) => prev.filter((company) => company.id !== id));
//     }
//     console.log(`ID: ${id} marked as ${status}`);
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }).format(date);
//   };

//   const NotificationCard = ({ item, type }) => (
//     <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4 mb-3 transition-all hover:shadow-md hover:border-emerald-200">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex items-center gap-2">
//             <h4 className="font-medium text-gray-900">{item.name}</h4>
//             <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
//               Pending
//             </span>
//           </div>
//           <p className="text-sm text-gray-500 mt-1">{item.email}</p>
//           <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
//             <Clock className="w-3 h-3" />
//             <span>Submitted {formatDate(item.submittedAt)}</span>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => handleAction(item.id, type, "approved")}
//             className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
//           >
//             <CheckCircle2 className="w-4 h-4" />
//             Approve
//           </button>
//           <button
//             onClick={() => handleAction(item.id, type, "rejected")}
//             className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors"
//           >
//             <XCircle className="w-4 h-4" />
//             Reject
//           </button>
//         </div>
//       </div>
//     </div>
//   );    


//   return (
//     <div className={` min-h-screen bg-white                                                           ${expanded ?"ml-[21%]": "ml-24"} transition-all w-full`}>
//       <div className="max-w-5xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <Bell className="w-6 h-6 text-emerald-600" />
//             <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-4 mb-6 border-b border-emerald-100">
//           <button
//             className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
//               activeTab === 'users'
//                 ? 'text-emerald-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//             onClick={() => setActiveTab('users')}
//           >
//             <Users className="w-4 h-4" />
//             Users
//             <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">
//               {pendingUsers.length}
//             </span>
//             {activeTab === 'users' && (
//               <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
//             )}
//           </button>
//           <button
//             className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
//               activeTab === 'companies'
//                 ? 'text-emerald-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//             onClick={() => setActiveTab('companies')}
//           >
//             <Building2 className="w-4 h-4" />
//             Companies
//             <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">
//               {pendingCompanies.length}
//             </span>
//             {activeTab === 'companies' && (
//               <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
//             )}
//           </button>
//         </div>

//         {/* Content */}
//         <div className="space-y-4">
//           {activeTab === 'users' && (
//             <div>
//               {pendingUsers.length > 0 ? (
//                 pendingUsers.map((user) => (
//                   <NotificationCard key={user.id} item={user} type="user" />
//                 ))
//               ) : (
//                 <div className="flex flex-col items-center justify-center py-12 text-gray-500">
//                   <AlertCircle className="w-12 h-12 mb-3 text-emerald-400" />
//                   <p className="text-lg font-medium">No pending user verifications</p>
//                   <p className="text-sm">All user verification requests have been processed</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'companies' && (
//             <div>
//               {pendingCompanies.length > 0 ? (
//                 pendingCompanies.map((company) => (
//                   <NotificationCard key={company.id} item={company} type="company" />
//                 ))
//               ) : (
//                 <div className="flex flex-col items-center justify-center py-12 text-gray-500">
//                   <AlertCircle className="w-12 h-12 mb-3 text-emerald-400" />
//                   <p className="text-lg font-medium">No pending company verifications</p>
//                   <p className="text-sm">All company verification requests have been processed</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminNotifications;

import React, { useState, useEffect } from "react";
import { Bell, Building2, CheckCircle2, Users, XCircle, Clock, AlertCircle } from "lucide-react";
import axios from "axios";

const AdminNotifications = ({ isOpen, onClose, expanded }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (isOpen) {
      fetchPendingUsers();
      fetchPendingCompanies();
    }
  }, [isOpen]);

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get("/api/admin/pending-users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the admin's token
        },
      });
      setPendingUsers(response.data);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  const fetchPendingCompanies = async () => {
    try {
      const response = await axios.get("/api/admin/pending-companies");
      setPendingCompanies(response.data);
    } catch (error) {
      console.error("Error fetching pending companies:", error);
    }
  };

  const handleAction = async (id, type, status) => {
    try {
      if (type === "user") {
        await axios.post("/api/admin/approve-reject-user", { userId: id, status });
        setPendingUsers((prev) => prev.filter((user) => user.id !== id));
      } else {
        await axios.post("/api/admin/approve-reject-company", { companyId: id, status });
        setPendingCompanies((prev) => prev.filter((company) => company.id !== id));
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

  return (
    <div className={`min-h-screen bg-white ${expanded ? "ml-[21%]" : "ml-24"} transition-all w-full`}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-emerald-100">
          <button
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "users" ? "text-emerald-600" : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4" />
            Users
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">
              {pendingUsers.length}
            </span>
            {activeTab === "users" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "companies" ? "text-emerald-600" : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("companies")}
          >
            <Building2 className="w-4 h-4" />
            Companies
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">
              {pendingCompanies.length}
            </span>
            {activeTab === "companies" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === "users" && (
            <div>
              {pendingUsers.length > 0 ? (
                pendingUsers.map((user) => <NotificationCard key={user.id} item={user} type="user" />)
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mb-3 text-emerald-400" />
                  <p className="text-lg font-medium">No pending user verifications</p>
                  <p className="text-sm">All user verification requests have been processed</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "companies" && (
            <div>
              {pendingCompanies.length > 0 ? (
                pendingCompanies.map((company) => <NotificationCard key={company.id} item={company} type="company" />)
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mb-3 text-emerald-400" />
                  <p className="text-lg font-medium">No pending company verifications</p>
                  <p className="text-sm">All company verification requests have been processed</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;