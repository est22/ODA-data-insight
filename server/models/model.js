const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Database = require('better-sqlite3');

// Update DB path to server directory
const dbPath = path.join(__dirname, '../oda.db');

function initializeDatabase() {
    // Check if database already exists
    const dbExists = fs.existsSync(dbPath);
    
    // Create database connection
    const db = new Database(dbPath);
    
    // Only create tables and load data if database doesn't exist
    if (!dbExists) {
        console.log('Initializing new database...');
        
        // Create tables
        db.prepare(`
            CREATE TABLE IF NOT EXISTS oda_data (
                project_number TEXT,
                project_title TEXT,
                recipient_name TEXT,
                year INTEGER,
                purpose_code TEXT,
                sector TEXT,
                usd_commitment REAL,
                usd_disbursement REAL,
                gender INTEGER,
                sdg_focus TEXT
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS sdg_indicators (
                sector TEXT,
                strategic_goal TEXT,
                program TEXT,
                performance_indicators TEXT,
                output_indicators TEXT
            )
        `).run();

        console.log('Database tables created');
    } else {
        console.log('Using existing database');
    }

    return db;
}

const db = initializeDatabase();

module.exports = {
    db
};
