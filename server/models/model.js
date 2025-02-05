const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Database = require('better-sqlite3');

// create DB
const db = new Database('ODA.db');

// create ODA database table
db.prepare(`CREATE TABLE IF NOT EXISTS oda_data (
    project_number TEXT,
    year INTEGER,
    recipient_name TEXT,
    project_title TEXT,
    purpose_code TEXT,
    sdg_focus TEXT,
    usd_commitment REAL,
    usd_disbursement REAL,
    gender INTEGER,
    environment INTEGER,
    trade INTEGER
)`).run();

// create SDG indicators table
db.prepare(`CREATE TABLE IF NOT EXISTS sdg_indicators (
    sector TEXT,
    strategic_goal TEXT,
    program TEXT,
    performance_indicators TEXT,
    output_indicators TEXT
)`).run();

// insert ODA data
const odaRows = [];
fs.createReadStream(path.join(__dirname, '../data/oda_korea_dataset.csv'))
    .pipe(csv())
    .on('data', (row) => odaRows.push(row))
    .on('end', () => {
        const insert = db.prepare(`INSERT INTO oda_data VALUES (
            @project_number, @year, @recipient_name, @project_title, 
            @purpose_code, @sdg_focus, @usd_commitment, @usd_disbursement,
            @gender, @environment, @trade
        )`);

        const insertMany = db.transaction((rows) => {
            for (const row of rows) {
                insert.run({
                    project_number: row.project_number,
                    year: parseInt(row.year),
                    recipient_name: row.recipient_name,
                    project_title: row.project_title,
                    purpose_code: row.purpose_code,
                    sdg_focus: row.sdg_focus,
                    usd_commitment: parseFloat(row.usd_commitment),
                    usd_disbursement: parseFloat(row.usd_disbursement),
                    gender: parseInt(row.gender),
                    environment: parseInt(row.environment),
                    trade: parseInt(row.trade)
                });
            }
        });

        insertMany(odaRows);
        console.log('ODA data imported');
    });

// insert SDG indicators data
const sdgRows = [];
fs.createReadStream(path.join(__dirname, '../data/한국국제협력단_SDG 분야별 성과지표_20230901.csv'), 
    { encoding: 'utf8' })
    .pipe(csv())
    .on('data', (row) => sdgRows.push(row))

    
    
    .on('end', () => {
        const insert = db.prepare(`INSERT INTO sdg_indicators VALUES (
            @sector, @strategic_goal, @program, 
            @performance_indicators, @output_indicators
        )`);

        const insertMany = db.transaction((rows) => {
            for (const row of rows) {
                                
                insert.run({
                    sector: row['분야'],
                    strategic_goal: row['전략목표'],
                    program: row['프로그램'],
                    performance_indicators: row['성과'],
                    output_indicators: row['산출물']
                });
            }
        });

        insertMany(sdgRows);
        console.log('SDG indicators imported');
    });

module.exports = { db };
