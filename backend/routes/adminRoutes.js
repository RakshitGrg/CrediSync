const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authenticateJWT = require("../middlewares/authMiddleware");

// Test endpoint
router.get("/admin/test", authenticateJWT, (req, res) => {
  const adminId = req.user.adminId;
  console.log(adminId);
  res.json({ adminId });
});

// Get pending users assigned to the admin
router.get("/admin/pending-users", authenticateJWT, (req, res) => {
  const adminId = req.user.adminId;
  
  const query = `
    SELECT 
      u.user_id as id, 
      u.full_name as name, 
      u.email, 
      u.phone,
      u.created_at as submittedAt,
      ud.aadhar_number,
      ud.address_proof_url,
      ud.bank_statement_url
    FROM users u
    LEFT JOIN user_documents ud ON u.user_id = ud.user_id
    WHERE u.verification_status = 'pending' AND u.verified_by = ?
  `;
  
  db.query(query, [adminId], (err, results) => {
    if (err) {
      console.error("Error fetching pending users:", err);
      return res.status(500).json({ message: "Failed to fetch pending users" });
    }
    res.json(results);
  });
});

// Get pending companies assigned to the admin
router.get("/admin/pending-companies", authenticateJWT, (req, res) => {
  const adminId = req.user.adminId;
  
  const query = `
    SELECT 
      c.company_id as id, 
      c.company_name as name, 
      c.email,
      c.phone,
      c.registration_no,
      c.business_address,
      c.created_at as submittedAt,
      cd.tax_id,
      cd.registration_certificate_url
    FROM companies c
    LEFT JOIN company_documents cd ON c.company_id = cd.company_id
    WHERE c.verification_status = 'pending' AND c.verified_by = ?
  `;
  
  db.query(query, [adminId], (err, results) => {
    if (err) {
      console.error("Error fetching pending companies:", err);
      return res.status(500).json({ message: "Failed to fetch pending companies" });
    }
    res.json(results);
  });
});

// Get verification history (approved/rejected users and companies)
// Get verification history (approved/rejected users and companies)
router.get("/admin/verification-history", authenticateJWT, (req, res) => {
  const adminId = req.user.adminId;
  
  const usersQuery = `
    SELECT 
      u.user_id as id,
      'user' as type,
      u.full_name as name,
      u.email,
      u.verification_status as status,
      u.verified_at,
      ud.aadhar_number,
      ud.address_proof_url,
      ud.bank_statement_url
    FROM users u
    LEFT JOIN user_documents ud ON u.user_id = ud.user_id
    WHERE u.verification_status IN ('approved', 'rejected') 
    AND u.verified_by = ?
  `;
  
  const companiesQuery = `
    SELECT 
      c.company_id as id,
      'company' as type,
      c.company_name as name,
      c.email,
      c.verification_status as status,
      c.verified_at,
      c.registration_no,
      c.business_address,
      cd.registration_certificate_url
    FROM companies c
    LEFT JOIN company_documents cd ON c.company_id = cd.company_id
    WHERE c.verification_status IN ('approved', 'rejected') 
    AND c.verified_by = ?
  `;
  
  db.query(usersQuery, [adminId], (err, userResults) => {
    if (err) {
      console.error("Error fetching verified users:", err.sqlMessage || err);
      return res.status(500).json({ message: "Failed to fetch verification history" });
    }
  
    db.query(companiesQuery, [adminId], (err, companyResults) => {
      if (err) {
        console.error("Error fetching verified companies:", err.sqlMessage || err);
        return res.status(500).json({ message: "Failed to fetch verification history" });
      }
  
      const allResults = [...userResults, ...companyResults].sort((a, b) =>
        new Date(b.verified_at) - new Date(a.verified_at)
      );
  
      res.json(allResults);
    });
  });
});

// Approve or reject a user
router.post("/admin/approve-reject-user", authenticateJWT, (req, res) => {
  const { userId, status } = req.body;
  const adminId = req.user.adminId;
  
  if (!userId || !status) {
    return res.status(400).json({ message: "User ID and status are required" });
  }
  
  const query = `
    UPDATE users
    SET verification_status = ?, verified_by = ?, verified_at = NOW()
    WHERE user_id = ?
  `;
  
  db.query(query, [status, adminId, userId], (err) => {
    if (err) {
      console.error("Error updating user verification status:", err);
      return res.status(500).json({ message: "Failed to update user status" });
    }
    res.json({ message: "User status updated successfully" });
  });
});

// Approve or reject a company
router.post("/admin/approve-reject-company", authenticateJWT, (req, res) => {
  const { companyId, status } = req.body;
  const adminId = req.user.adminId;
  
  if (!companyId || !status) {
    return res.status(400).json({ message: "Company ID and status are required" });
  }
  
  const query = `
    UPDATE companies
    SET verification_status = ?, verified_by = ?, verified_at = NOW()
    WHERE company_id = ?
  `;
  
  db.query(query, [status, adminId, companyId], (err) => {
    if (err) {
      console.error("Error updating company verification status:", err);
      return res.status(500).json({ message: "Failed to update company status" });
    }
    res.json({ message: "Company status updated successfully" });
  });
});

module.exports = router;