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

  const loan_applications = `
 CREATE TABLE IF NOT EXISTS loan_applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  borrower_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  monthly_income DECIMAL(10,2) NOT NULL,
  employment_status VARCHAR(50) NOT NULL,
  reason_for_loan TEXT,
  FOREIGN KEY (loan_id) REFERENCES UserLoan(loanId) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id) REFERENCES users(user_id) ON DELETE CASCADE
);
`;
  // Create the tables if they do not exist

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
  });

  db.query(loan_applications, (err) => {
    if (err) throw err;
    console.log("Loan applications table created or already exists");
  });
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
                    return res.status(500).json({
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

app.post("/matchloans", async (req, res) => {
  const { amount, term, employment, income } = req.body;

  try {
    // 🔹 Fetch matching loans directly from the UserLoan table
    const matchedLoans = await db.query(
      `SELECT * FROM UserLoan 
       WHERE duration = ? 
       AND amount = ? 
       AND (amount / duration) <= ?
       AND borrowerId IS NULL`, // Loan should be available
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
        return res.status(500).json({ error: "Database error" });
      }

      if (userResult.length === 0) {
        return res.status(404).json({ error: "User not found" });
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
          return res.status(500).json({ error: "Database error" });
        }

        // Format the loan data
        const formattedLoans = loans.map((loan) => ({
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
            phone: loan.lenderPhone,
          },
        }));

        console.log(`Found ${formattedLoans.length} loans for user`);
        res.json({ loans: formattedLoans });
      });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
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

// Add these routes to your Express app

// Endpoint for borrowers to apply for a loan
app.post("/api/loans/apply", (req, res) => {
  const { loanId, email, monthlyIncome, employmentStatus, reasonForLoan } =
    req.body;

  console.log("Loan application received:", { loanId, email, monthlyIncome });

  if (!loanId || !email || !monthlyIncome || !employmentStatus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Get borrower ID from email
  const getUserQuery = "SELECT user_id FROM users WHERE email = ?";
  db.query(getUserQuery, [email], (err, userResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const borrowerId = userResults[0].user_id;

    // Check if user already applied for this loan
    const checkExistingQuery =
      "SELECT * FROM loan_applications WHERE loan_id = ? AND borrower_id = ?";
    db.query(
      checkExistingQuery,
      [loanId, borrowerId],
      (err, existingResults) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (existingResults.length > 0) {
          return res
            .status(400)
            .json({ error: "You have already applied for this loan" });
        }

        // Insert application
        const insertQuery = `
        INSERT INTO loan_applications 
        (loan_id, borrower_id, monthly_income, employment_status, reason_for_loan) 
        VALUES (?, ?, ?, ?, ?)
      `;

        db.query(
          insertQuery,
          [
            loanId,
            borrowerId,
            monthlyIncome,
            employmentStatus,
            reasonForLoan || null,
          ],
          (err, result) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ error: "Database error" });
            }

            res.status(201).json({
              message: "Loan application submitted successfully",
              applicationId: result.insertId,
            });
          }
        );
      }
    );
  });
});

// Endpoint for lenders to get applications for their loans
app.get("/api/loans/applications", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Get lender ID from email
  const getLenderQuery = "SELECT user_id FROM users WHERE email = ?";
  db.query(getLenderQuery, [email], (err, lenderResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (lenderResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const lenderId = lenderResults[0].user_id;

    // Get all loans by this lender that have pending applications
    const getApplicationsQuery = `
      SELECT 
        la.application_id,
        la.loan_id,
        la.borrower_id,
        la.status,
        la.application_date,
        la.monthly_income,
        la.employment_status,
        la.reason_for_loan,
        ul.amount,
        ul.interestRate,
        ul.duration,
        u.full_name AS borrower_name,
        u.email AS borrower_email,
        u.phone AS borrower_phone,
        u.verification_status AS borrower_verification
      FROM loan_applications la
      JOIN UserLoan ul ON la.loan_id = ul.loanId
      JOIN users u ON la.borrower_id = u.user_id
      WHERE ul.lenderId = ? AND la.status = 'pending' AND ul.borrowerId IS NULL
    `;

    db.query(getApplicationsQuery, [lenderId], (err, applications) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ applications });
    });
  });
});

// Endpoint for lenders to reject a loan application
app.post("/api/loans/applications/reject", (req, res) => {
  const { applicationId, lenderEmail } = req.body;

  if (!applicationId || !lenderEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Get lender ID from email
  const getLenderQuery = "SELECT user_id FROM users WHERE email = ?";
  db.query(getLenderQuery, [lenderEmail], (err, lenders) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (lenders.length === 0) {
      return res.status(404).json({ error: "Lender not found" });
    }

    const lenderId = lenders[0].user_id;

    // Verify lender owns the loan for this application
    const verifyOwnershipQuery = `
      SELECT ul.lenderId 
      FROM loan_applications la 
      JOIN UserLoan ul ON la.loan_id = ul.loanId 
      WHERE la.application_id = ?
    `;

    db.query(verifyOwnershipQuery, [applicationId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (results[0].lenderId !== lenderId) {
        return res.status(403).json({ error: "You don't own this loan" });
      }

      // Update application status
      const updateApplicationQuery =
        "UPDATE loan_applications SET status = 'rejected' WHERE application_id = ?";
      db.query(updateApplicationQuery, [applicationId], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          message: "Loan application rejected successfully",
          applicationId: applicationId,
        });
      });
    });
  });
});

// Endpoint for borrowers to check their loan application status
app.get("/api/loans/my-applications", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Get borrower ID from email
  const getBorrowerQuery = "SELECT user_id FROM users WHERE email = ?";
  db.query(getBorrowerQuery, [email], (err, borrowers) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (borrowers.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const borrowerId = borrowers[0].user_id;

    // Get all applications by this borrower
    const getApplicationsQuery = `
      SELECT 
        la.application_id,
        la.loan_id,
        la.status,
        la.application_date,
        ul.amount,
        ul.interestRate,
        ul.duration,
        u.full_name AS lender_name,
        u.email AS lender_email
      FROM loan_applications la
      JOIN UserLoan ul ON la.loan_id = ul.loanId
      JOIN users u ON ul.lenderId = u.user_id
      WHERE la.borrower_id = ?
      ORDER BY la.application_date DESC
    `;

    db.query(getApplicationsQuery, [borrowerId], (err, applications) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ applications });
    });
  });
});

// Modify the createLoan endpoint to check wallet balance first
app.post("/createLoan", (req, res) => {
  console.log("received data from frontend");
  const { amount, interestRate, term, employment, email } = req.body;
  const startDate = new Date().toISOString().split("T")[0];

  // Check user exists and get their ID
  db.query(
    "SELECT user_id, wallet_balance FROM users WHERE email = ?",
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
      const walletBalance = results[0].wallet_balance;

      // Check if user has sufficient balance
      if (walletBalance < amount) {
        return res.status(400).json({
          error: "Insufficient wallet balance",
          currentBalance: walletBalance,
          requiredAmount: amount,
        });
      }

      // Reserve the funds by creating the loan
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

          // Success - funds are now reserved in the system
          res.status(201).json({
            message:
              "Loan created successfully. Funds reserved from your wallet.",
            loanId: result.insertId,
          });
        }
      );
    }
  );
});

// Modify the loan approval endpoint to handle fund transfer
app.post("/api/loans/applications/approve", (req, res) => {
  const { applicationId, lenderEmail } = req.body;

  if (!applicationId || !lenderEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Get application details
    const getApplicationQuery = `
      SELECT la.*, ul.lenderId, ul.amount 
      FROM loan_applications la 
      JOIN UserLoan ul ON la.loan_id = ul.loanId 
      WHERE la.application_id = ?
    `;

    db.query(getApplicationQuery, [applicationId], (err, applications) => {
      if (err) {
        return db.rollback(() => {
          console.error("Database error:", err);
          res.status(500).json({ error: "Database error" });
        });
      }

      if (applications.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: "Application not found" });
        });
      }

      const application = applications[0];
      const loanAmount = application.amount;

      // Get lender ID from email
      const getLenderQuery =
        "SELECT user_id, wallet_balance FROM users WHERE email = ?";
      db.query(getLenderQuery, [lenderEmail], (err, lenders) => {
        if (err) {
          return db.rollback(() => {
            console.error("Database error:", err);
            res.status(500).json({ error: "Database error" });
          });
        }

        if (lenders.length === 0) {
          return db.rollback(() => {
            res.status(404).json({ error: "Lender not found" });
          });
        }

        const lenderId = lenders[0].user_id;
        const lenderBalance = lenders[0].wallet_balance;

        // Verify this lender owns the loan
        if (application.lenderId !== lenderId) {
          return db.rollback(() => {
            res.status(403).json({ error: "You don't own this loan" });
          });
        }

        // Double-check the lender still has sufficient funds
        if (lenderBalance < loanAmount) {
          return db.rollback(() => {
            res.status(400).json({
              error: "Insufficient funds in your wallet",
              currentBalance: lenderBalance,
              requiredAmount: loanAmount,
            });
          });
        }

        // Update application status
        const updateApplicationQuery =
          "UPDATE loan_applications SET status = 'approved' WHERE application_id = ?";
        db.query(updateApplicationQuery, [applicationId], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Database error:", err);
              res.status(500).json({ error: "Database error" });
            });
          }

          // Update loan with borrower ID
          const updateLoanQuery =
            "UPDATE UserLoan SET borrowerId = ? WHERE loanId = ?";
          db.query(
            updateLoanQuery,
            [application.borrower_id, application.loan_id],
            (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Database error:", err);
                  res.status(500).json({ error: "Database error" });
                });
              }

              // Deduct amount from lender's wallet
              const deductFromLenderQuery =
                "UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?";
              db.query(deductFromLenderQuery, [loanAmount, lenderId], (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Database error:", err);
                    res.status(500).json({ error: "Database error" });
                  });
                }

                // Add amount to borrower's wallet
                const addToBorrowerQuery =
                  "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?";
                db.query(
                  addToBorrowerQuery,
                  [loanAmount, application.borrower_id],
                  (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error("Database error:", err);
                        res.status(500).json({ error: "Database error" });
                      });
                    }

                    // Record the transaction in wallet_transactions for lender
                    const lenderTransactionQuery = `
                  INSERT INTO wallet_transactions 
                  (user_id, amount, transaction_type, description) 
                  VALUES (?, ?, 'transfer', ?)
                `;

                    db.query(
                      lenderTransactionQuery,
                      [
                        lenderId,
                        -loanAmount,
                        `Loan transfer to borrower (Loan ID: ${application.loan_id})`,
                      ],
                      (err) => {
                        if (err) {
                          return db.rollback(() => {
                            console.error("Database error:", err);
                            res.status(500).json({ error: "Database error" });
                          });
                        }

                        // Record the transaction in wallet_transactions for borrower
                        const borrowerTransactionQuery = `
                      INSERT INTO wallet_transactions 
                      (user_id, amount, transaction_type, description) 
                      VALUES (?, ?, 'transfer', ?)
                    `;

                        db.query(
                          borrowerTransactionQuery,
                          [
                            application.borrower_id,
                            loanAmount,
                            `Loan received from lender (Loan ID: ${application.loan_id})`,
                          ],
                          (err) => {
                            if (err) {
                              return db.rollback(() => {
                                console.error("Database error:", err);
                                res
                                  .status(500)
                                  .json({ error: "Database error" });
                              });
                            }

                            // Reject all other applications for this loan
                            const rejectOtherApplicationsQuery = `
                          UPDATE loan_applications 
                          SET status = 'rejected' 
                          WHERE loan_id = ? AND application_id != ?
                        `;

                            db.query(
                              rejectOtherApplicationsQuery,
                              [application.loan_id, applicationId],
                              (err) => {
                                if (err) {
                                  return db.rollback(() => {
                                    console.error("Database error:", err);
                                    res
                                      .status(500)
                                      .json({ error: "Database error" });
                                  });
                                }

                                // Commit the transaction
                                db.commit((err) => {
                                  if (err) {
                                    return db.rollback(() => {
                                      console.error("Commit error:", err);
                                      res
                                        .status(500)
                                        .json({ error: "Database error" });
                                    });
                                  }

                                  res.json({
                                    message:
                                      "Loan application approved successfully. Funds transferred to borrower.",
                                    applicationId: applicationId,
                                    loanId: application.loan_id,
                                    borrowerId: application.borrower_id,
                                    amountTransferred: loanAmount,
                                  });
                                });
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              });
            }
          );
        });
      });
    });
  });
});

app.post("/userdata", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const query = `
    SELECT user_id, full_name, email, phone , verification_status , wallet_balance, created_at
    FROM users 
    WHERE email = ?
  `;

  try {
    const rows = await db.query(query, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/loans", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Get user_id from email
    const userQuery = "SELECT user_id FROM users WHERE email = ?";
    const userResult = await db.query(userQuery, [email]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult[0].user_id;

    // Fetch loans for this user
    const loanQuery = `
      SELECT * FROM UserLoan 
      WHERE lenderId = ? OR borrowerId = ?
    `;
    const loans = await db.query(loanQuery, [userId, userId]);

    // console.log("my all loand details", loans)

    res.json({ loans });
  } catch (err) {
    console.error("Error fetching loans:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/transactions", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Get user_id from email
    const userQuery = "SELECT user_id FROM users WHERE email = ?";
    const userResult = await db.query(userQuery, [email]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user_id = userResult[0].user_id;

    // Fetch wallet transactions for this user
    const txQuery = `
      SELECT * FROM wallet_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const transactions = await db.query(txQuery, [user_id]);

    res.json({ transactions });
  } catch (err) {
    console.error("Error fetching wallet transactions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/updateprofile", async (req, res) => {
  const { old_email, full_name, email, phone } = req.body;

  if (!old_email || !full_name || !email || !phone) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // 1. Check if user exists
    const userResult = await db.query("SELECT * FROM users WHERE email = ?", [
      old_email,
    ]);
    if (!userResult || userResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Check if email is changing and already taken
    if (old_email !== email) {
      const emailExists = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (emailExists.length > 0) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
    }

    // 3. Check if phone is already used by someone else
    const phoneExists = await db.query(
      "SELECT * FROM users WHERE phone = ? AND email != ?",
      [phone, old_email]
    );
    if (phoneExists.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Phone number already in use" });
    }

    // 4. Update the user profile
    await db.query(
      `UPDATE users 
       SET full_name = ?, email = ?, phone = ?
       WHERE email = ?`,
      [full_name, email, phone, old_email]
    );

    return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add this endpoint to the server.js file

app.post("/paymyloan", async (req, res) => {
  const { loanId, amount, userId, email } = req.body;

  if (!loanId || !amount || !userId || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  // Start a transaction
  db.beginTransaction(async (err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    try {
      // 1. Check if user has enough balance
      const userQuery = "SELECT wallet_balance FROM users WHERE user_id = ?";
      const userResult = await db.query(userQuery, [userId]);

      if (userResult.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ success: false, message: "User not found" });
        });
      }

      const currentBalance = parseFloat(userResult[0].wallet_balance);

      if (currentBalance < amount) {
        return db.rollback(() => {
          res
            .status(400)
            .json({ success: false, message: "Insufficient balance" });
        });
      }

      // 2. Get loan details
      const loanQuery = "SELECT * FROM UserLoan WHERE loanId = ?";
      const loanResult = await db.query(loanQuery, [loanId]);

      if (loanResult.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ success: false, message: "Loan not found" });
        });
      }

      const loan = loanResult[0];

      // 3. Deduct from user's wallet
      const updateWalletQuery =
        "UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?";
      await db.query(updateWalletQuery, [amount, userId]);

      // 4. Record the transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (user_id, amount, transaction_type, description)
        VALUES (?, ?, 'withdrawal', ?)
      `;
      await db.query(transactionQuery, [
        userId,
        amount,
        `Loan payment for Loan #${loanId}`,
      ]);

      // 5. Add to lender's wallet
      const updateLenderWalletQuery =
        "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?";
      await db.query(updateLenderWalletQuery, [amount, loan.lenderId]);

      // 6. Record the transaction for lender
      const lenderTransactionQuery = `
        INSERT INTO wallet_transactions (user_id, amount, transaction_type, description)
        VALUES (?, ?, 'deposit', ?)
      `;
      await db.query(lenderTransactionQuery, [
        loan.lenderId,
        amount,
        `Loan payment received from ${email} for Loan #${loanId}`,
      ]);

      // Commit the transaction
      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error committing transaction:", err);
            res
              .status(500)
              .json({ success: false, message: "Error processing payment" });
          });
        }

        res.json({ success: true, message: "Payment successful" });
      });
    } catch (error) {
      db.rollback(() => {
        console.error("Transaction error:", error);
        res.status(500).json({ success: false, message: "Server error" });
      });
    }
  });
});

app.post("/admindata", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const query = `
    SELECT full_name, email, phone, created_at, admin_id
    FROM admins 
    WHERE email = ?
  `;

  try {
    const rows = await db.query(query, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/updateprofileadmin", async (req, res) => {
  const { old_email, full_name, email, phone } = req.body;

  if (!old_email || !full_name || !email || !phone) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if admin exists with old_email
    const checkQuery = "SELECT * FROM admins WHERE email = ?";
    const rows = await db.query(checkQuery, [old_email]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Check for duplicate email
    if (old_email !== email) {
      const emailQuery = "SELECT * FROM admins WHERE email = ?";
      const existingEmail = await db.query(emailQuery, [email]);
      if (existingEmail.length > 0) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
    }

    // Check for duplicate phone number (excluding current admin)
    const phoneQuery = "SELECT * FROM admins WHERE phone = ? AND email != ?";
    const existingPhone = await db.query(phoneQuery, [phone, old_email]);
    if (existingPhone.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Phone number already in use" });
    }

    // Update admin details
    const updateQuery = `
      UPDATE admins
      SET full_name = ?, email = ?, phone = ?
      WHERE email = ?
    `;
    await db.query(updateQuery, [full_name, email, phone, old_email]);

    // Fetch updated data to return
    const updatedQuery =
      "SELECT full_name, email, phone, created_at FROM admins WHERE email = ?";
    const updatedAdmin = await db.query(updatedQuery, [email]);

    return res.json(updatedAdmin[0]);
  } catch (err) {
    console.error("Error updating admin profile:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Add this to your existing Express server file

// Add this endpoint to serve documents for download
// app.get("/api/download-document", (req, res) => {
//   const { filename } = req.query;

//   if (!filename) {
//     return res.status(400).json({ message: "Filename is required" });
//   }

//   // Determine which directory the file might be in
//   let filePath;
//   if (filename.includes("address")) {
//     filePath = path.join(addressProofDir, filename);
//   } else if (filename.includes("bank")) {
//     filePath = path.join(bankStatementsDir, filename);
//   } else {
//     return res.status(400).json({ message: "Invalid document type" });
//   }

//   // Check if file exists
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ message: "File not found" });
//   }

//   // Send the file
//   res.download(filePath);
// });

// Add this endpoint to get user documents
app.get("/api/user-documents", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // First get the user_id
  const getUserQuery = "SELECT user_id FROM users WHERE email = ?";

  db.query(getUserQuery, [email], (err, userResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userResults[0].user_id;

    // Now get the documents for this user
    const getDocumentsQuery = `
      SELECT aadhar_number, address_proof_url, bank_statement_url 
      FROM user_documents 
      WHERE user_id = ?
    `;

    db.query(getDocumentsQuery, [userId], (err, docResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (docResults.length === 0) {
        return res.json({
          aadharNumber: "",
          addressProofUrl: "",
          bankStatementUrl: "",
        });
      }

      res.json({
        aadharNumber: docResults[0].aadhar_number,
        addressProofUrl: docResults[0].address_proof_url,
        bankStatementUrl: docResults[0].bank_statement_url,
      });
    });
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Serve the uploads folder
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
