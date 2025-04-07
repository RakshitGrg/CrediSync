const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { urlencoded } = require("body-parser");

dotenv.config();

const app = express();

const createTables = () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(15) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      verification_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none',
      verified_by INT NULL,
      verified_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      wallet_balance DECIMAL(10,2) DEFAULT 0.00,
      FOREIGN KEY (verified_by) REFERENCES admins(admin_id) ON DELETE SET NULL
    );
  `;

  const createUsersDocumentsTable = `
    CREATE TABLE IF NOT EXISTS user_documents (
      user_id INT PRIMARY KEY,  -- One row per user
      aadhar_number VARCHAR(12) NOT NULL UNIQUE,
      address_proof_url VARCHAR(255),
      bank_statement_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `;
  const wallet_transactions = `CREATE TABLE IF NOT EXISTS wallet_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );
  `;
  const createCompaniesTable = `
    CREATE TABLE IF NOT EXISTS companies (
      company_id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(15) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      registration_no VARCHAR(255) NOT NULL UNIQUE,
      business_address TEXT NOT NULL,
      verification_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none',
      verified_by INT NULL,
      verified_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (verified_by) REFERENCES admins(admin_id) ON DELETE SET NULL
    )
  `;

  const createCompanyDocumentsTable = `
    CREATE TABLE IF NOT EXISTS company_documents (
      company_id INT PRIMARY KEY,
      registration_certificate_url VARCHAR(255) NOT NULL,
      tax_id VARCHAR(20) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
    );
  `;

  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      admin_id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(15) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUserLoanTable = `CREATE TABLE IF NOT EXISTS UserLoan (
    loanId INT AUTO_INCREMENT PRIMARY KEY,
    lenderId INT NOT NULL,
    borrowerId INT DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    employment ENUM( 'retired', 'self_employed', 'unemployed', 'part_time', 'full_time'),
    interestRate DECIMAL(5,2) NOT NULL,
    startDate DATE NOT NULL,
    duration INT NOT NULL,
    FOREIGN KEY (lenderId) REFERENCES users(user_id),
    FOREIGN KEY (borrowerId) REFERENCES users(user_id)
);
`;

  const createAdminAssignmentsTable = `
CREATE TABLE IF NOT EXISTS admin_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  last_assigned_admin_id INT NULL,
  assignment_type ENUM('user', 'company') NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (last_assigned_admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);
`;

  // Initialize the admin_assignments table with one row for user assignments and one for company assignments
  const initAdminAssignments = `
INSERT IGNORE INTO admin_assignments (assignment_type) 
VALUES ('user'), ('company');
`;

  // Execute the queries
  db.query(createAdminsTable, (err) => {
    if (err) throw err;
    console.log("Admins table created or already exists");
  });
  db.query(createUsersTable, (err) => {
    if (err) throw err;
    console.log("Users table created or already exists");
  });

  db.query(createCompaniesTable, (err) => {
    if (err) throw err;
    console.log("Companies table created or already exists");
  });

  db.query(createUsersDocumentsTable, (err) => {
    if (err) throw err;
    console.log("Users Documents table created or already exists");
  });
  db.query(createCompanyDocumentsTable, (err) => {
    if (err) throw err;
    console.log("Company Documents table created or already exists");
  });
  db.query(createUserLoanTable, (err) => {
    if (err) throw err;
    console.log("Users table created or already exists");
  });
  db.query(createAdminAssignmentsTable, (err) => {
    if (err) throw err;
    console.log("Admin assignments table created or already exists");

    // Initialize the admin_assignments table after creating it
    db.query(initAdminAssignments, (err) => {
      if (err) console.error("Error initializing admin assignments:", err);
      else console.log("Admin assignments initialized");
    });
  });

  db.query(wallet_transactions, (err) => {
    if (err) throw err;
    console.log("Wallet transactions table created or already exists");
  }
  );
};

// Call the function to create tables when the server starts
createTables();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const aadharDir = path.join(__dirname, "uploads", "aadhar");
const addressProofDir = path.join(__dirname, "uploads", "address-proof");
const bankStatementsDir = path.join(__dirname, "uploads", "bank-statements");

if (!fs.existsSync(aadharDir)) fs.mkdirSync(aadharDir, { recursive: true });
if (!fs.existsSync(addressProofDir))
  fs.mkdirSync(addressProofDir, { recursive: true });
if (!fs.existsSync(bankStatementsDir))
  fs.mkdirSync(bankStatementsDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination folder based on the field name
    if (file.fieldname === "aadhar") {
      cb(null, aadharDir);
    } else if (file.fieldname === "addressProof") {
      cb(null, addressProofDir);
    } else if (file.fieldname === "bankStatement") {
      cb(null, bankStatementsDir);
    } else {
      cb(new Error("Invalid file field name"));
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const fileExtension = path.extname(file.originalname);
    cb(null, Date.now() + fileExtension); // Filename will be timestamp + file extension
  },
});

// Round-robin assignment function to be included in your server file
const assignToNextAdmin = async (assignmentType) => {
  return new Promise((resolve, reject) => {
    // Get all active admins
    const getAdminsQuery = `SELECT admin_id FROM admins ORDER BY admin_id`;

    db.query(getAdminsQuery, (err, admins) => {
      if (err) return reject(err);

      if (admins.length === 0) {
        return reject(new Error("No admins available for assignment"));
      }

      // Get the last assigned admin for this type
      const getLastAssignedQuery = `
        SELECT last_assigned_admin_id 
        FROM admin_assignments 
        WHERE assignment_type = ?
      `;

      db.query(getLastAssignedQuery, [assignmentType], (err, results) => {
        if (err) return reject(err);

        let lastAssignedAdminId = results[0]?.last_assigned_admin_id;
        let nextAdminIndex = 0;

        // Find the index of the last assigned admin
        if (lastAssignedAdminId) {
          const lastIndex = admins.findIndex(
            (admin) => admin.admin_id === lastAssignedAdminId
          );
          nextAdminIndex = (lastIndex + 1) % admins.length;
        }

        // Get the next admin in rotation
        const nextAdminId = admins[nextAdminIndex].admin_id;

        // Update the last assigned admin
        const updateAssignmentQuery = `
          UPDATE admin_assignments 
          SET last_assigned_admin_id = ? 
          WHERE assignment_type = ?
        `;

        db.query(
          updateAssignmentQuery,
          [nextAdminId, assignmentType],
          (err) => {
            if (err) return reject(err);
            resolve(nextAdminId);
          }
        );
      });
    });
  });
};

const upload = multer({ storage });

// Update your existing upload endpoint
app.post(
  "/upload",
  upload.fields([
    { name: "addressProof", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { email, aadhar } = req.body;
      if (!email || !aadhar) {
        return res
          .status(400)
          .json({ message: "Email and Aadhar number are required." });
      }

      // Fetch the user ID
      const queryUserId = "SELECT user_id FROM users WHERE email = ?";
      db.query(queryUserId, [email], async (err, result) => {
        if (err) {
          console.error("Error fetching user ID:", err);
          return res.status(500).json({ message: "Database query failed." });
        }

        if (result.length === 0) {
          return res.status(404).json({ message: "User not found." });
        }

        const userId = result[0].user_id;

        // Use the round-robin assignment function
        try {
          const assignedAdminId = await assignToNextAdmin("user");

          // Store the uploaded document details
          const addressProofUrl = req.files.addressProof
            ? req.files.addressProof[0].filename
            : null;
          const bankStatementUrl = req.files.bankStatement
            ? req.files.bankStatement[0].filename
            : null;

          // Insert the document details and Aadhar number into the user_documents table
          const insertDocumentQuery = `
            INSERT INTO user_documents (user_id, aadhar_number, address_proof_url, bank_statement_url)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            aadhar_number = VALUES(aadhar_number),
            address_proof_url = VALUES(address_proof_url),
            bank_statement_url = VALUES(bank_statement_url)
          `;

          db.query(
            insertDocumentQuery,
            [userId, aadhar, addressProofUrl, bankStatementUrl],
            (err, result) => {
              if (err) {
                console.error("Error inserting document details:", err);
                return res
                  .status(500)
                  .json({ message: "Failed to insert document details." });
              }

              // Update the verification_status and assign the admin
              const updateVerificationStatusQuery = `
                UPDATE users
                SET verification_status = 'pending', verified_by = ?
                WHERE user_id = ?
              `;

              db.query(
                updateVerificationStatusQuery,
                [assignedAdminId, userId],
                (err, result) => {
                  if (err) {
                    console.error("Error updating verification status:", err);
                    return res
                      .status(500)
                      .json({
                        message: "Failed to update verification status.",
                      });
                  }

                  // Send success response
                  let responseMessage =
                    "Files uploaded and data saved successfully. Verification status set to 'pending'.";

                  if (addressProofUrl) {
                    responseMessage += ` Address Proof uploaded: ${addressProofUrl}.`;
                  }
                  if (bankStatementUrl) {
                    responseMessage += ` Bank Statement uploaded: ${bankStatementUrl}.`;
                  }

                  res.json({ message: responseMessage, assignedAdminId });
                }
              );
            }
          );
        } catch (err) {
          console.error("Error assigning admin:", err);
          return res.status(500).json({ message: "Failed to assign admin." });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed. Try again." });
    }
  }
);

app.post("/createLoan", (req, res) => {
  console.log("received data from frontend");
  const { amount, interestRate, term, employment, email } = req.body;
  const startDate = new Date().toISOString().split("T")[0];

  db.query(
    "SELECT user_id FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error", details: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Lender not found" });
      }

      const lenderId = results[0].user_id;

      db.query(
        "INSERT INTO UserLoan (lenderId, borrowerId, amount, employment, interestRate, startDate, duration) VALUES (?, NULL, ?, ?, ?, ?, ?)",
        [lenderId, amount, employment, interestRate, startDate, term],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            console.log(err);
            return res
              .status(500)
              .json({ error: "Database error", details: err });
          }
          res
            .status(201)
            .json({
              message: "Loan created successfully",
              loanId: result.insertId,
            });
        }
      );
    }
  );
});
app.post("/matchloans", async (req, res) => {
  const { amount, term, employment, income } = req.body;

  try {
    // 🔹 Fetch matching loans directly from the UserLoan table
    const matchedLoans = await db.query(
      `SELECT * FROM UserLoan 
       WHERE duration = ? 
       AND amount = ? 
       AND (amount / duration) <= ?
       AND borrowerId IS NULL`,  // Loan should be available
      [term, amount, income]
    );

    if (matchedLoans.length === 0) {
      return res.json({ message: "No matching loans found." });
    }

    res.json(matchedLoans); // 🔹 Just return matched loans (No DB insert)
  } catch (error) {
    console.error("Error matching loans:", error);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/borrower", async (req, res) => {
  const { email } = req.body;
  console.log("request received from frontend");
  
  try {
    // Get user ID
    const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";
    db.query(getUserIdQuery, [email], (err, userResult) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (userResult.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userId = userResult[0].user_id;
      
      // Get all loans where user is not the lender and include lender details using JOIN
      const loansQuery = `
        SELECT l.*, 
               u.full_name AS lenderName, 
               u.email AS lenderEmail, 
               u.phone AS lenderPhone
        FROM UserLoan l
        JOIN users u ON l.lenderId = u.user_id
        WHERE l.borrowerId IS NULL AND l.lenderId != ?
      `;
      
      db.query(loansQuery, [userId], (err, loans) => {
        if (err) {
          console.error("Error fetching loans:", err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Format the loan data
        const formattedLoans = loans.map(loan => ({
          loanId: loan.loanId,
          lenderId: loan.lenderId,
          borrowerId: loan.borrowerId,
          amount: loan.amount,
          employment: loan.employment,
          interestRate: loan.interestRate,
          startDate: loan.startDate,
          duration: loan.duration,
          lenderDetails: {
            name: loan.lenderName,
            email: loan.lenderEmail,
            phone: loan.lenderPhone
          }
        }));

        console.log(`Found ${formattedLoans.length} loans for user`);
        res.json({ loans: formattedLoans });
      });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get("/", (req, res) => {
  res.send("CREDISYNC Backend Running!");
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Import Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api", adminRoutes);


const walletRoutes = require("./routes/walletRoutes");
app.use("/api", walletRoutes);


// Add this route to your adminRoutes.js or create a new userRoutes.js
app.get("/api/user/verification-status", (req, res) => {
  const { email } = req.query;

  console.log("Received request for verification status:", email);
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  const query = "SELECT verification_status FROM users WHERE email = ?";
  
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching verification status:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ status: results[0].verification_status });
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
