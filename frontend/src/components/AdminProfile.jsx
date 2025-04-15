
import { useState, useEffect } from "react";
import { User, Phone, Mail, Calendar, Shield, Edit, Save, X } from "lucide-react";

export default function AdminProfile({ expanded }) {
  const [admin, setAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        
        const email = localStorage.getItem("email");
        console.log(email);
  
        const response = await fetch('http://localhost:5001/admindata', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch admin profile");
        }
  
        const data = await response.json();
        setAdmin(data);
        setFormData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching admin data:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAdminData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage({ text: "Saving changes...", type: "info" });
  
      const emailFromStorage = localStorage.getItem("email");
      const updatedFormData = {
        ...formData,
        old_email: emailFromStorage,
      };
  
      console.log(updatedFormData);
  
      const response = await fetch('http://localhost:5001/updateprofileadmin', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
  
      const updatedData = await response.json();
  
      if (emailFromStorage !== updatedFormData.email) {
        localStorage.setItem("email", updatedFormData.email);
      }
  
      setAdmin(updatedData);
      setIsEditing(false);
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
      console.error('Error updating profile:', err);
    }
  
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-red-600 text-center mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 text-center text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8 ${expanded ? 'ml-[18%]' : 'ml-24'} transition-all`}>
      {/* Header */}
      <header className="bg-green-50 text-green-800">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-green-600 text-white px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold flex items-center">
                <User className="mr-3" size={24} /> 
                Admin Profile
              </h2>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center"
                >
                  <Edit size={18} className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
            
            {message.text && (
              <div 
                className={`px-8 py-4 ${
                  message.type === "success" 
                    ? "bg-green-100 text-green-800 border-l-4 border-green-500" 
                    : message.type === "error" 
                      ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                      : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
                }`}
              >
                {message.text}
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="full_name">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                          <User size={20} />
                        </div>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg pl-10 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                          <Mail size={20} />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg pl-10 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="phone">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                          <Phone size={20} />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg pl-10 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({...admin});
                    }}
                    className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center"
                  >
                    <X size={18} className="mr-2" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
                  >
                    <Save size={18} className="mr-2" /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Admin ID</h3>
                    <p className="font-semibold text-lg text-gray-800">{admin.admin_id}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-2 flex items-center">
                      <User size={16} className="mr-2" /> Full Name
                    </h3>
                    <p className="font-semibold text-lg text-gray-800">{admin.full_name}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-2 flex items-center">
                      <Mail size={16} className="mr-2" /> Email Address
                    </h3>
                    <p className="font-semibold text-lg text-gray-800 break-all">{admin.email}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-2 flex items-center">
                      <Phone size={16} className="mr-2" /> Phone Number
                    </h3>
                    <p className="font-semibold text-lg text-gray-800">{admin.phone}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 md:col-span-2">
                    <h3 className="text-gray-500 text-sm font-medium mb-2 flex items-center">
                      <Calendar size={16} className="mr-2" /> Account Created
                    </h3>
                    <p className="font-semibold text-lg text-gray-800">{formatDate(admin.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}