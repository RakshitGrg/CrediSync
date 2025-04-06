const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

// User Signup
router.post("/user/signup", async (req, res) => {
    const { fullName, email, phone, password } = req.body;
    
    if (!fullName || !email || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)";
    db.query(sql, [fullName, email, phone, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });
        
        // Generate token for the newly registered user
        const token = jwt.sign(
            { userId: result.insertId, role: "user" }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );
        
        res.status(201).json({ 
            message: "User registered successfully!",
            token 
        });
    });
});

// User Login
router.post("/user/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });

        if (result.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user.user_id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1d" }); // Use userId instead of user_id
        res.json({ message: "Login successful", token });
    });
});

// Company Signup
router.post("/company/signup", async (req, res) => {
    const { companyName, email, phone, registrationNo, businessAddress, password } = req.body;

    if (!companyName || !email || !phone || !registrationNo || !businessAddress || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO companies (company_name, email, phone, password_hash, registration_no, business_address) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [companyName, email, phone, hashedPassword, registrationNo, businessAddress], (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });
        
        // Generate token for the newly registered company
        const token = jwt.sign(
            { companyId: result.insertId, role: "company" }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );
        
        res.status(201).json({ 
            message: "Company registered successfully!",
            token 
        });
    });
});
// Company Login
router.post("/company/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = "SELECT * FROM companies WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });

        if (result.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const company = result[0];
        const isMatch = await bcrypt.compare(password, company.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ companyId: company.company_id, role: "company" }, process.env.JWT_SECRET, { expiresIn: "1d" }); // Use companyId instead of company_id
        res.json({ message: "Login successful", token });
    });
});
// Admin Signup
router.post("/admin/signup", async (req, res) => {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO admins (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)";
    db.query(sql, [fullName, email, phone, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });
        
        // Generate token for the newly registered admin
        const token = jwt.sign(
            { adminId: result.insertId, role: "admin" }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );
        
        res.status(201).json({ 
            message: "Admin registered successfully!",
            token 
        });
    });
});
// Admin Login
router.post("/admin/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = "SELECT * FROM admins WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });

        if (result.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const admin = result[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ adminId: admin.admin_id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" }); // Use adminId instead of admin_id
        res.json({ message: "Login successful", token });
    });
});

module.exports = router;