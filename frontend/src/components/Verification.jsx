import React, { useState } from "react";
import axios from "axios";

const DocumentUploadPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Hide component when not open

  const [aadharNumber, setAadharNumber] = useState("");
  const [addressProof, setAddressProof] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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
    formData.append("aadhar", aadharNumber); // Aadhar is a text field, not a file
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
    } catch (error) {
      setMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Popup Box */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-[48rem] h-[32rem] text-gray-900">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">
          Upload Verification Document
        </h2>

        {/* Aadhar Number */}
        <label
          htmlFor="aadhar-number"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Aadhar Number
        </label>
        <input
          id="aadhar-number"
          type="text"
          value={aadharNumber}
          onChange={handleAadharChange}
          className="mb-3 w-full border border-gray-300 p-3 rounded-lg"
        />

        {/* Address Proof */}
        <label
          htmlFor="address-proof"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Address Proof
        </label>
        <input
          id="address-proof"
          type="file"
          onChange={(e) => handleFileChange(e, "addressProof")}
          className="mb-3 w-full border border-gray-300 p-3 rounded-lg"
        />

        {/* Bank Statement */}
        <label
          htmlFor="bank-statement"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Bank Statement
        </label>
        <input
          id="bank-statement"
          type="file"
          onChange={(e) => handleFileChange(e, "bankStatement")}
          className="mb-3 w-full border border-gray-300 p-3 rounded-lg"
        />

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg w-full font-medium"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {/* Message */}
        {message && <p className="mt-3 text-base text-gray-700">{message}</p>}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-5 text-red-600 hover:text-red-700 w-full font-medium text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const DocumentVerification = ({ isOpen, onClose }) => {
  return <DocumentUploadPopup isOpen={isOpen} onClose={onClose} />;
};

export default DocumentVerification;
