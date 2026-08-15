/**
 * Project: AI-Based Early Warning System for Hospital Resource Shortage
 * Module: Main Backend Server (Node.js + Express)
 * Description: Handles database connections and provides RESTful APIs for frontend.
 */

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors()); // Cross-Origin Resource Sharing allowed
app.use(express.json()); // Parses incoming JSON requests
app.use(express.static(path.join(__dirname, 'public'))); // Serves HTML/CSS static files

// Database Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'hospital_db', // Apnar ashol database er nam
    port: 3306               // Apnar update kora MySQL port
});

// Database Connection Check
db.connect((err) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.message);
        return;
    }
    console.log('✅ MySQL Database Connected Successfully!');
});

/**
 * API ENDPOINT: GET /api/resources
 * Purpose: Fetches all resources and calculates the warning status logically.
 */
app.get('/api/resources', (req, res) => {
    const sql = "SELECT * FROM hospital_resources";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database Fetch Error:", err);
            return res.status(500).json({ error: "Failed to fetch data from database" });
        }
        
        // Threshold Logic Implementation
        const data = results.map(row => {
            if(row.current_stock <= row.threshold_limit) {
                row.status = "Critical Alert!";
                row.color = "red";
            } else {
                row.status = "Safe";
                row.color = "green";
            }
            return row;
        });

        res.json(data); // Send documented JSON response
    });
});

/**
 * API ENDPOINT: POST /api/update
 * Purpose: Updates the current stock of a specific resource from the Admin Panel.
 */
app.post('/api/update', (req, res) => {
    const { id, new_stock } = req.body;
    
    // Using Prepared Statements for Security against SQL Injection
    const sql = "UPDATE hospital_resources SET current_stock = ? WHERE id = ?";
    
    db.query(sql, [new_stock, id], (err, result) => {
        if (err) {
            console.error("Database Update Error:", err);
            return res.status(500).json({ error: "Failed to update database" });
        }
        res.json({ message: "Stock Updated Successfully in Database!" });
    });
});

// Server Initialization
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running perfectly on http://localhost:${PORT}`);
});