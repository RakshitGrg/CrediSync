import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const VerificationRequired = ({ onVerificationClick, featureName }) => {
  return (
    <div className="verification-required-overlay">
      <div className="verification-required-container">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="warning-icon" />
        <h2>Verification Required</h2>
        <p>You need to be verified to access <strong>{featureName}</strong>.</p>
        <p>Verification helps us ensure a secure platform for all CrediSync users.</p>
        <button onClick={onVerificationClick} className="verification-btn">
          <FontAwesomeIcon icon={faCheckCircle} /> Get Verified Now
        </button>
      </div>
      
      <style jsx>{`
        .verification-required-overlay {
          position: fixed;
          top: 100px; /* Leave space for navbar */
          left: 250px; /* Leave space for sidebar navbar */
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 900; /* Below the navbar z-index */
        }
        
        .verification-required-container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #e0e0e0;
        }
        
        .warning-icon {
          color: #3498db; /* Match CrediSync blue theme */
          margin-bottom: 20px;
        }
        
        h2 {
          color: #333;
          margin-bottom: 15px;
          font-weight: bold;
        }
        
        p {
          color: #666;
          margin-bottom: 10px;
          line-height: 1.5;
        }
        
        .verification-btn {
          background-color: #3498db; /* Match CrediSync blue theme */
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin-top: 20px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .verification-btn:hover {
          background-color: #2980b9;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .verification-required-overlay {
            left: 0; /* Full width on mobile */
            top: 60px; /* Adjust for mobile navbar height */
          }
          
          .verification-required-container {
            margin: 15px;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default VerificationRequired;