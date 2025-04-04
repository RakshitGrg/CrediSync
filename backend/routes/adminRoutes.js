const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authenticateJWT = require("../middlewares/authMiddleware");


const updateAdminPendingUsers = async (adminId, userId, action = "add") => {
    return new Promise((resolve, reject) => {
      // Fetch the current pending_users for the admin
      const query = "SELECT pending_users FROM admins WHERE admin_id = ?";
      db.query(query, [adminId], (err, results) => {
        if (err) return reject(err);
  
        let pendingUsers = results[0].pending_users || []; // Default to an empty array if null
  
        if (action === "add") {
          // Add the user ID to the pending_users array
          if (!pendingUsers.includes(userId)) {
            pendingUsers.push(userId);
          }
        } else if (action === "remove") {
          // Remove the user ID from the pending_users array
          pendingUsers = pendingUsers.filter((id) => id !== userId);
        }
  
        // Update the pending_users field in the database
        const updateQuery = "UPDATE admins SET pending_users = ? WHERE admin_id = ?";
        db.query(updateQuery, [JSON.stringify(pendingUsers), adminId], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  };
  
// Fetch pending users
router.get("/admin/pending-users", authenticateJWT, (req, res) => {
    const adminId = req.user.adminId; // Assuming admin ID is available in the request

    console.log(adminId)
  
    // Fetch the admin's pending_users
    const query = "SELECT pending_users FROM admins WHERE admin_id = ?";
    db.query(query, [adminId], (err, results) => {
      if (err) {
        console.error("Error fetching pending users:", err);
        return res.status(500).json({ message: "Failed to fetch pending users" });
      }
  
      const pendingUsers = results[0].pending_users || [];

      console.log(pendingUsers)
  
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
router.get("/admin/pending-companies", authenticateJWT, (req, res) => {
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


router.get("/admin/test", authenticateJWT, (req, res) => {
    const adminId = req.user.adminId;
    console.log(adminId)
    })
// Approve or reject a user
router.post("/admin/approve-reject-user", authenticateJWT, async (req, res) => {
    const { userId, status } = req.body;
    const adminId = req.user.adminId; // Assuming admin ID is available in the request

    console.log("hello : ", userId, status, adminId)

    // res.json({ message: "testing the endpoint" })
  
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
router.post("/admin/approve-reject-company", authenticateJWT, (req, res) => {
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