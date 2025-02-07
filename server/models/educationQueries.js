const { db } = require('./model');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// create education table
function initializeEducationTable() {
    try {
        // Drop and create table
        db.prepare('DROP TABLE IF EXISTS oda_education').run();
        
        db.prepare(`
            CREATE TABLE IF NOT EXISTS oda_education (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                country TEXT NOT NULL,
                year INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                purpose_code TEXT NOT NULL,
                investment REAL NOT NULL,
                disbursement REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Delete existing data
        db.prepare('DELETE FROM oda_education').run();
        
        // Read CSV and insert data
        const rows = [];
        const csvPath = path.join(__dirname, '../data/oda_korea_dataset.csv');
        
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                const purposeCode = row.purpose_code;
                
                // Skip if not education related
                if (!purposeCode.startsWith('11') && 
                    !['22040', '22081', '43081'].includes(purposeCode)) {
                    return;
                }
                
                // Skip if Republic of Korea
                if (row.recipient_name === 'Republic of Korea') {
                    return;
                }

                // Determine category
                let category;
                if (purposeCode.startsWith('111') || purposeCode.startsWith('112')) {
                    category = '학습성과를 위한 양질의 교육';
                } else if (['22040', '22081', '43081'].includes(purposeCode)) {
                    category = '미래역량개발을 위한 디지털교육';
                } else if (purposeCode.startsWith('113') || purposeCode.startsWith('114')) {
                    category = '인재양성을 위한 직업·고등교육';
                } else {
                    return;
                }

                rows.push({
                    category,
                    country: row.recipient_name,
                    year: parseInt(row.year),
                    project_name: row.project_name,
                    purpose_code: row.purpose_code,
                    investment: parseFloat(row.usd_commitment),
                    disbursement: parseFloat(row.usd_disbursement)
                });
            })
            .on('end', () => {
                const insertStmt = db.prepare(`
                    INSERT INTO oda_education (
                        category, country, year, project_name,
                        purpose_code, investment, disbursement
                    ) VALUES (
                        @category, @country, @year, @project_name,
                        @purpose_code, @investment, @disbursement
                    )
                `);

                const insertMany = db.transaction((rows) => {
                    for (const row of rows) {
                        insertStmt.run(row);
                    }
                });

                insertMany(rows);
                console.log('Education data loaded successfully');
            });

    } catch (error) {
        console.error('Failed to initialize education table:', error);
        throw error;
    }
}

function getEducationProjects() {
    return db.prepare(`
        SELECT * FROM oda_education 
        ORDER BY year DESC, investment DESC
    `).all();
}

function getEducationSummary() {
    return db.prepare(`
        SELECT 
            category,
            COUNT(*) as total_projects,
            COUNT(DISTINCT country) as total_countries,
            SUM(investment) as total_investment,
            ROUND(AVG(CASE WHEN disbursement > 0 
                THEN (disbursement / investment) * 100 
                ELSE NULL END), 2) as execution_rate
        FROM oda_education
        GROUP BY category
    `).all();
}

module.exports = {
    initializeEducationTable,
    getEducationProjects,
    getEducationSummary
}; 