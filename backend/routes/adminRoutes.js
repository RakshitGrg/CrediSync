const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Fetch pending users
router.get("/admin/pending-users", (req, res) => {
    const adminId = req.user.adminId; // Assuming admin ID is available in the request
  
    // Fetch the admin's pending_users
    const query = "SELECT pending_users FROM admins WHERE admin_id = ?";
    db.query(query, [adminId], (err, results) => {
      if (err) {
        console.error("Error fetching pending users:", err);
        return res.status(500).json({ message: "Failed to fetch pending users" });
      }
  
      const pendingUsers = results[0].pending_users || [];
  
      // Fetch details of pending users
      if (pendingUsers.length === 0) {
        return res.json([]); // No pending users
      }
  
      const userQuery = `
        SELECT 
          user_id AS id, 
          full_name AS name, 
          email, 
          verification_status AS status, 
          created_at AS submittedAt
        FROM users 
        WHERE user_id IN (?)
      `;
  
      db.query(userQuery, [pendingUsers], (err, userResults) => {
        if (err) {
          console.error("Error fetching user details:", err);
          return res.status(500).json({ message: "Failed to fetch user details" });
        }
        res.json(userResults);
      });
    });
  });
// Fetch pending companies
router.get("/admin/pending-companies", (req, res) => {
  const query = `
    SELECT 
      company_id AS id, 
      company_name AS name, 
      email, 
      verification_status AS status, 
      created_at AS submittedAt
    FROM companies 
    WHERE verification_status = 'pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching pending companies:", err);
      return res.status(500).json({ message: "Failed to fetch pending companies" });
    }
    res.json(results);
  });
});

// Approve or reject a user
router.post("/admin/approve-reject-user", async (req, res) => {
    const { userId, status } = req.body;
    const adminId = req.user.adminId; // Assuming admin ID is available in the request
  
    if (!userId || !status) {
      return res.status(400).json({ message: "User ID and status are required" });
    }
  
    // Remove the user ID from the admin's pending_users
    await updateAdminPendingUsers(adminId, userId, "remove");
  
    const query = `
      UPDATE users 
      SET verification_status = ?, verified_by = ?
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
router.post("/admin/approve-reject-company", (req, res) => {
    const { companyId, status } = req.body;
    const adminId = req.user.adminId; // Assuming admin ID is available in the request
  
    if (!companyId || !status) {
      return res.status(400).json({ message: "Company ID and status are required" });
    }
  
    const query = `
      UPDATE companies 
      SET verification_status = ?, verified_by = ?
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