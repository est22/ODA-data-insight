const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '../data/ODA.db');

function initializeDatabase() {
    try {
        const db = new Database(dbPath, {
            // remove fileMustExist option to create a new DB file if needed
        });
        
        db.prepare('DROP TABLE IF EXISTS oda_education').run();
        
        // create education table
        db.prepare(`
            CREATE TABLE IF NOT EXISTS oda_education (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                project_name TEXT NOT NULL,
                country TEXT NOT NULL,
                year INTEGER NOT NULL,
                purpose_code TEXT NOT NULL,
                investment REAL,
                disbursement REAL,
                sdg_focus TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // read education data from CSV file
        const csvPath = path.join(__dirname, '../data/oda_korea_dataset.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const rows = csvContent.split('\n')
            .slice(1)
            .filter(line => line.trim()) 
            .map(line => {
                const fields = line.split(',').map(f => f.trim().replace(/"/g, ''));
                const purposeCode = fields[4] || '';
                
                // filter education related purpose codes
                if (!purposeCode.startsWith('11') && !['22040', '22081', '43081'].includes(purposeCode)) {
                    return null;
                }
                
                
                if (fields[2] === 'Republic of Korea') {
                    return null;
                }

                // set categories
                let category;
                if (purposeCode.startsWith('111') || purposeCode.startsWith('112')) {
                    category = '학습성과를 위한 양질의 교육';
                } else if (['22040', '22081', '43081'].includes(purposeCode)) {
                    category = '미래역량개발을 위한 디지털교육';
                } else if (purposeCode.startsWith('113') || purposeCode.startsWith('114')) {
                    category = '인재양성을 위한 직업·고등교육';
                } else {
                    return null;
                }

                return {
                    category,
                    project_name: fields[1] || '',  // project name
                    country: fields[2] || '',
                    year: parseInt(fields[3]) || 0,
                    purpose_code: purposeCode,
                    investment: parseFloat(fields[6]) || 0,
                    disbursement: parseFloat(fields[7]) || 0,
                    sdg_focus: fields[9] || null
                };
            })
            .filter(row => row !== null);

        const insertStmt = db.prepare(`
            INSERT INTO oda_education (
                category, project_name, country,
                year, purpose_code, investment, 
                disbursement, sdg_focus
            ) VALUES (
                @category, @project_name, @country,
                @year, @purpose_code, @investment, 
                @disbursement, @sdg_focus
            )
        `);

        const insertMany = db.transaction((rows) => {
            for (const row of rows) {
                insertStmt.run(row);
            }
        });

        insertMany(rows);
        console.log('Education data loaded successfully');

        return db;
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

const db = initializeDatabase();

const initializeEducationTable = async () => {
    try {
        // create table
        await db.query(`
            CREATE TABLE IF NOT EXISTS education_projects (
                id SERIAL PRIMARY KEY,
                project_name VARCHAR(255) NOT NULL,
                country VARCHAR(100) NOT NULL,
                sector VARCHAR(100),
                investment_amount DECIMAL(15,2) NOT NULL,
                start_date DATE,
                end_date DATE,
                status VARCHAR(50)
            )
        `);

        // check existing data
        const existingData = await db.query('SELECT COUNT(*) FROM education_projects');
        
        // insert sample data if no data exists
        if (existingData.rows[0].count === '0') {
            await db.query(`
                INSERT INTO education_projects 
                (project_name, country, sector, investment_amount, start_date, end_date, status)
                VALUES 
                ('Digital Education Initiative', 'Korea', 'Technology', 5000000.00, '2023-01-01', '2024-12-31', 'Active'),
                ('Rural School Development', 'Vietnam', 'Infrastructure', 3000000.00, '2023-03-15', '2024-06-30', 'Active'),
                ('Teacher Training Program', 'Indonesia', 'Capacity Building', 2000000.00, '2023-02-01', '2023-12-31', 'Active'),
                ('STEM Education Support', 'Thailand', 'Education', 4000000.00, '2023-04-01', '2024-03-31', 'Active'),
                ('Educational Technology', 'Malaysia', 'Technology', 6000000.00, '2023-01-15', '2024-12-31', 'Active')
            `);
        }
    } catch (error) {
        console.error('Error initializing education table:', error);
        throw error;
    }
};

module.exports = {
    db
};
