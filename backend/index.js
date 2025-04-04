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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
      verified_users JSON DEFAULT NULL,
      verified_companies JSON DEFAULT NULL,
      pending_users JSON DEFAULT NULL,
      pending_companies JSON DEFAULT NULL,
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

const getAdmins = async () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT admin_id FROM admins";
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results.map((row) => row.admin_id));
    });
  });
};

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

const upload = multer({ storage });

let lastAssignedAdminIndex = -1; // Track the last assigned admin

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

        // Fetch all admins
        const admins = await getAdmins();
        if (admins.length === 0) {
          return res.status(500).json({ message: "No admins available." });
        }

        // Assign the request to the next admin in round-robin fashion
        lastAssignedAdminIndex = (lastAssignedAdminIndex + 1) % admins.length;
        const assignedAdminId = admins[lastAssignedAdminIndex];

        // Add the user ID to the assigned admin's pending_users
        await updateAdminPendingUsers(assignedAdminId, userId, "add");

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
                    .json({ message: "Failed to update verification status." });
                }

                // Send success response
                let responseMessage = "Files uploaded and data saved successfully. Verification status set to 'pending'.";

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
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed. Try again." });
    }
  }
);


// app.post("/create-loan", (req, res) => {
//   const { email, amount, interestRate, term } = req.body; // Match frontend fields
//   const startDate = new Date().toISOString().split("T")[0];

//   // Get lenderId from the user table using email
//   db.query(
//     "SELECT user_id FROM user WHERE email = ?",
//     [email], // Match frontend key
//     (err, results) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ error: "Database error", details: err });
//       }
//       if (results.length === 0) {
//         return res.status(404).json({ error: "Lender not found" });
//       }
      
//       const lenderId = results[0].user_id;

//       // Insert loan details into UserLoan table
//       db.query(
//         "INSERT INTO UserLoan (lenderId, borrowerId, amount, interestRate, startDate, duration) VALUES (?, NULL, ?, ?, ?, ?)",
//         [lenderId, amount, interestRate, startDate, term], // Match frontend key
//         (err, result) => {
//           if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ error: "Database error", details: err });
//           }
//           res.status(201).json({ message: "Loan created successfully", loanId: result.insertId });
//         }
//       );
//     }
//   );
// });

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
            return res.status(500).json({ error: "Database error", details: err });
          }
          res.status(201).json({ message: "Loan created successfully", loanId: result.insertId });
        }
      );
    }
  );
});

app.post("/matchloans", async (req, res) => {
  const { amount, term, employment, income } = req.body;

  try {
    // 🔹 Fetch matching loans directly from the UserLoan table
    const [matchedLoans] = db.query(
      `SELECT * FROM UserLoan 
       WHERE duration = ? 
       AND employment = ?
       AND amount = ? 
       AND (amount / duration) <= ?
       AND borrowerId IS NULL`,  // Loan should be available
      [term, employment, amount, income]
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


app.get("/", (req, res) => {
  res.send("CREDISYNC Backend Running!");
});

// Import Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
