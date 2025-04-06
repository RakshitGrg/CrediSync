// Add these routes to your Express app

const express = require("express");
const db = require("../config/db");
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

// Get wallet balance
router.get("/wallet/balance", authenticateJWT, (req, res) => {
    const userId = req.user.userId; // Assuming your JWT contains userId
  
    if (!userId) {
      return res.status(400).json({ message: "User identification missing." });
    }
  
    const query = "SELECT wallet_balance FROM users WHERE user_id = ?";
    db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching wallet balance:", err);
      return res.status(500).json({ message: "Database query failed." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ balance: result[0].wallet_balance });
  });
});

// Add money to wallet
// Fix for the deposit endpoint
router.post("/wallet/deposit", authenticateJWT, (req, res) => {
    const userId = req.user.userId; // Get from JWT
    const { amount } = req.body;
  
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Valid user and amount are required." });
    }

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Error starting transaction:", err);
            return res.status(500).json({ message: "Transaction failed to start." });
        }

        // Get current balance - using userId from JWT
        const getUserQuery = "SELECT wallet_balance FROM users WHERE user_id = ?";
        db.query(getUserQuery, [userId], (err, users) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error fetching user:", err);
                    res.status(500).json({ message: "Database query failed." });
                });
            }

            if (users.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({ message: "User not found." });
                });
            }

            const currentBalance = users[0].wallet_balance || 0;
            const newBalance = parseFloat(currentBalance) + parseFloat(amount);

            // Update wallet balance
            const updateBalanceQuery = "UPDATE users SET wallet_balance = ? WHERE user_id = ?";
            db.query(updateBalanceQuery, [newBalance, userId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error updating balance:", err);
                        res.status(500).json({ message: "Failed to update wallet balance." });
                    });
                }

                // Record the transaction
                const insertTxQuery = "INSERT INTO wallet_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, 'deposit', 'Manual deposit')";
                db.query(insertTxQuery, [userId, amount], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Error recording transaction:", err);
                            res.status(500).json({ message: "Failed to record transaction." });
                        });
                    }

                    // Commit the transaction
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Error committing transaction:", err);
                                res.status(500).json({ message: "Transaction commit failed." });
                            });
                        }

                        res.json({
                            message: "Deposit successful",
                            newBalance: newBalance,
                        });
                    });
                });
            });
        });
    });
});
router.get("/wallet/transactions", authenticateJWT, (req, res) => {
    const userId = req.user.userId; // Get from JWT
  
    if (!userId) {
      return res.status(400).json({ message: "User identification missing." });
    }
  
    const query = `
      SELECT transaction_id, amount, transaction_type, 
             description, created_at 
      FROM wallet_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `;
  
    db.query(query, [userId], (err, transactions) => {
      if (err) {
        console.error("Error fetching transactions:", err);
        return res.status(500).json({ message: "Database query failed." });
      }
  
      res.json({ transactions });
    });
  });


module.exports = router;