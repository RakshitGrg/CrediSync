import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, X, FileText, CreditCard, CheckCircle, AlertCircle } from "lucide-react";

const DocumentUploadPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [aadharNumber, setAadharNumber] = useState("");
  const [addressProof, setAddressProof] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("none"); // Default to 'none'
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user verification status when component mounts
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const userEmail = localStorage.getItem("email");
      
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5001/api/user/verification-status?email=${userEmail}`);
        setVerificationStatus(response.data.status);
        setMessage(getStatusMessage(response.data.status));
      } catch (error) {
        console.error("Error fetching verification status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkVerificationStatus();
  }, []);

  // Generate appropriate message based on verification status
  const getStatusMessage = (status) => {
    switch(status) {
      case 'pending':
        return "Your verification is pending approval. Please check back later.";
      case 'approved':
        return "You are already verified. No further action is needed.";
      case 'rejected':
        return "Your previous verification was rejected. Please submit new documents.";
      default:
        return "";
    }
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (type === "addressProof") {
        setAddressProof(file);
      } else if (type === "bankStatement") {
        setBankStatement(file);
      }
    }
  };

  const handleAadharChange = (event) => {
    setAadharNumber(event.target.value);
  };

  const handleUpload = async () => {
    if (!aadharNumber || !addressProof || !bankStatement) {
      setMessage("Please complete all fields.");
      return;
    }

    setUploading(true);

    const userEmail = localStorage.getItem("email");

    const formData = new FormData();
    formData.append("email", userEmail);
    formData.append("aadhar", aadharNumber);
    formData.append("addressProof", addressProof);
    formData.append("bankStatement", bankStatement);

    try {
      const response = await axios.post(
        "http://localhost:5001/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage(response.data.message);
      setVerificationStatus("pending"); // Update status after successful upload
    } catch (error) {
      setMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // Check if form should be disabled
  const isFormDisabled = verificationStatus === 'pending' || verificationStatus === 'approved';

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 flex items-center justify-center w-full max-w-3xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Document Verification
            </h2>
          </div>

          {/* Status Message */}
          {isFormDisabled && (
            <div className={`p-4 rounded-lg mb-6 ${verificationStatus === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <div className="flex items-center gap-2">
                {verificationStatus === 'approved' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {getStatusMessage(verificationStatus)}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Aadhar Number */}
            <div>
              <label
                htmlFor="aadhar-number"
                className={`flex items-center gap-2 text-sm font-medium ${isFormDisabled ? 'text-gray-400' : 'text-gray-700'} mb-2`}
              >
                <CreditCard className="w-4 h-4" />
                Aadhar Number
              </label>
              <input
                id="aadhar-number"
                type="text"
                value={aadharNumber}
                onChange={handleAadharChange}
                className={`text-black w-full border ${isFormDisabled ? 'bg-gray-100 text-gray-500' : 'border-gray-200'} p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400`}
                placeholder="Enter your 12-digit Aadhar number"
                disabled={isFormDisabled}
              />
            </div>

            {/* Address Proof */}
            <div>
              <label
                htmlFor="address-proof"
                className={`flex items-center gap-2 text-sm font-medium ${isFormDisabled ? 'text-gray-400' : 'text-gray-700'} mb-2`}
              >
                <FileText className="w-4 h-4" />
                Address Proof
              </label>
              <div className="relative">
                <input
                  id="address-proof"
                  type="file"
                  onChange={(e) => handleFileChange(e, "addressProof")}
                  className={`text-black w-full border ${isFormDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-200'} p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium ${isFormDisabled ? 'file:bg-gray-200 file:text-gray-500' : 'file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200`}
                  disabled={isFormDisabled}
                />
                {addressProof && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
            </div>

            {/* Bank Statement */}
            <div>
              <label
                htmlFor="bank-statement"
                className={`flex items-center gap-2 text-sm font-medium ${isFormDisabled ? 'text-gray-400' : 'text-gray-700'} mb-2`}
              >
                <FileText className="w-4 h-4" />
                Bank Statement
              </label>
              <div className="relative">
                <input
                  id="bank-statement"
                  type="file"
                  onChange={(e) => handleFileChange(e, "bankStatement")}
                  className={`text-black w-full border ${isFormDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-200'} p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium ${isFormDisabled ? 'file:bg-gray-200 file:text-gray-500' : 'file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200`}
                  disabled={isFormDisabled}
                />
                {bankStatement && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
            </div>

            {/* Message */}
            {message && !isFormDisabled && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes("failed")
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || isFormDisabled}
              className={`w-full ${isFormDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#3c8243] hover:bg-[#3c6f42]'} disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${isFormDisabled ? '' : 'hover:shadow-xl'} disabled:shadow-none`}
            >
              <Upload className="w-5 h-5" />
              {uploading ? "Uploading..." : isFormDisabled ? "Already Submitted" : "Upload Documents"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentVerification = ({ isOpen, onClose }) => {
  return <DocumentUploadPopup isOpen={isOpen} onClose={onClose} />;
};

export default DocumentVerification;