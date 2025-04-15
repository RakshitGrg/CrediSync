import React, { useState, useEffect, use } from "react";
import {
  FaFileAlt,
  FaCheckCircle,
  FaDownload,
  FaExclamationCircle,
} from "react-icons/fa";
import axios from "axios";

const UserDocuments = ({ userEmail }) => {
  const [documents, setDocuments] = useState({
    aadharNumber: "",
    addressProofUrl: "",
    bankStatementUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDocuments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5001/api/user-documents?email=${userEmail}`
        );
        setDocuments(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load documents");
        setLoading(false);
        console.error("Error fetching documents:", err);
      }
    };

    if (userEmail) {
      fetchUserDocuments();
    }
  }, [userEmail]);

  useEffect(() => {
    console.log("Documents state updated:", documents);
    console.log(`http://localhost:5001/uploads/address-proof/${documents.addressProofUrl}`)
  }, [documents]);

  //   const handleDownload = async (documentType) => {
  //     try {
  //       const docurl = `http://localhost:5001/uploads/${documentType}/${
  //         documentType == "address-proof"
  //           ? documents.addressProofUrl
  //           : documents.bankStatementUrl
  //       }`;
  //       await axios.get(docurl);

  //       console.log(docurl);
  //     } catch (err) {
  //       console.error("Error downloading document:", err);
  //       alert("Failed to download document. Please try again.");
  //     }
  //   };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-4">
        <p className="text-center">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-4">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FaFileAlt className="mr-2 text-green-500" /> Documents
        </h3>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Aadhar Number
          </p>
          <p className="text-gray-900">
            {documents.aadharNumber || "Not provided"}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Address Proof
          </p>
          {documents.addressProofUrl ? (
            <div className="flex items-center justify-between">
              <p className="text-green-600 flex items-center">
                <FaCheckCircle className="mr-1" /> Uploaded
              </p>
              <a
                href={
                  `http://localhost:5001/uploads/address-proof/${documents.addressProofUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
              >
                <FaDownload className="mr-1" /> Download
              </a>
            </div>
          ) : (
            <p className="text-red-500 flex items-center">
              <FaExclamationCircle className="mr-1" /> Not uploaded
            </p>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Bank Statement
          </p>
          {documents.bankStatementUrl ? (
            <div className="flex items-center justify-between">
              <p className="text-green-600 flex items-center">
                <FaCheckCircle className="mr-1" /> Uploaded
              </p>
              <a
                href={
                  "http://localhost:5001/uploads/bank-statements/" +
                  documents.bankStatementUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
              >
                <FaDownload className="mr-1" /> Download
              </a>
            </div>
          ) : (
            <p className="text-red-500 flex items-center">
              <FaExclamationCircle className="mr-1" /> Not uploaded
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDocuments;
