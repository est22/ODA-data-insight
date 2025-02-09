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

const getEducationSummary = () => {
    try {
        // calculate investment amount query
        const investmentResult = db.prepare(`
            SELECT 
                ROUND(COALESCE(SUM(CAST(REPLACE(investment, ',', '') AS FLOAT)), 0), 2) as total_investment 
            FROM oda_education
            WHERE investment IS NOT NULL
        `).get();

        // add debug log
        // console.log('Raw investment data:', investmentResult);

        const projectsResult = db.prepare(`
            SELECT COUNT(*) as total_projects 
            FROM oda_education
        `).get();

        const sectorsResult = db.prepare(`
            SELECT DISTINCT category as sector
            FROM oda_education 
            WHERE category IS NOT NULL
            ORDER BY category
        `).all();

        const result = {
            total_investment: parseFloat(investmentResult.total_investment) || 0,
            total_projects: Number(projectsResult.total_projects),
            focus_sectors: sectorsResult.map(row => row.sector)
        };

        // add debug log
        // console.log('Formatted summary data:', result);

        return result;
    } catch (error) {
        console.error('Error in getEducationSummary:', error);
        throw error;
    }
};

const getEducationProjects = () => {
    try {
        // country basic info
        const countryData = db.prepare(`
            SELECT 
                country,
                COUNT(*) as project_count,
                ROUND(COALESCE(SUM(CAST(REPLACE(investment, ',', '') AS FLOAT)), 0), 2) as total_investment,
                GROUP_CONCAT(DISTINCT category) as sectors
            FROM oda_education
            GROUP BY country
            ORDER BY total_investment DESC
        `).all();

        // country-year investment trend
        const trendData = db.prepare(`
            SELECT 
                country,
                year,
                ROUND(COALESCE(SUM(CAST(REPLACE(investment, ',', '') AS FLOAT)), 0), 2) as amount
            FROM oda_education
            GROUP BY country, year
            ORDER BY year ASC
        `).all();

        // country-latest projects
        const projectsData = db.prepare(`
            SELECT 
                country,
                project_name,
                year,
                category,
                ROUND(CAST(REPLACE(investment, ',', '') AS FLOAT), 2) as amount
            FROM oda_education
            ORDER BY year DESC, investment DESC
        `).all();



        // integrate data and add logs
        const formattedData = countryData.reduce((acc, country) => {

            acc[country.country] = {
                amount: country.total_investment,
                projects: country.project_count,
                sectors: country.sectors.split(','),
                trends: trendData
                    .filter(trend => trend.country === country.country)
                    .map(trend => ({
                        year: trend.year,
                        amount: trend.amount
                    })),
                recentProjects: projectsData
                    .filter(project => project.country === country.country)
                    // .slice(0, 5)  // latest 5 projects
                    .map(project => ({
                        name: project.project_name,
                        year: project.year,
                        sector: project.category,
                        amount: project.amount
                    }))
            };
            return acc;
        }, {});
        return formattedData;
    } catch (error) {
        console.error('Error in getEducationProjects:', error);
        throw error;
    }
};

// add sample investment data for debugging
const checkInvestmentData = () => {
    const sampleData = db.prepare(`
        SELECT investment, CAST(REPLACE(investment, ',', '') AS FLOAT) as converted
        FROM oda_education
        WHERE investment IS NOT NULL
        LIMIT 5
    `).all();

};

// call this when initializing
checkInvestmentData();

module.exports = {
    initializeEducationTable,
    getEducationProjects,
    getEducationSummary
}; 