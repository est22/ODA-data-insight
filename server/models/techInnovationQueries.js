const Database = require('better-sqlite3');
const { dbFile } = require('./model');  // Import dbFile path from model.js

const db = new Database(dbFile);

// tech investment by country
const getTechInvestmentByCountry = () => {
    const query = `
        SELECT 
            year,
            recipient_name,
            SUM(usd_commitment) as tech_investment,
            COUNT(DISTINCT project_number) as project_count
        FROM oda_data
        WHERE purpose_code IN ('11182', '32182')
        GROUP BY year, recipient_name
        ORDER BY tech_investment DESC
    `;
    
    try {
        const results = db.prepare(query).all();
        return results;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
};

// research/innovation projects
const getResearchProjects = () => {
    const query = `
        SELECT 
            recipient_name,
            project_title,
            usd_commitment,
            sdg_focus
        FROM oda_data
        WHERE project_title LIKE '%research%' 
            OR project_title LIKE '%innovation%'
            OR project_title LIKE '%technology%'
        ORDER BY usd_commitment DESC
    `;
    
    try {
        const results = db.prepare(query).all();
        return results;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
};

// 데이터베이스 연결 확인을 위한 테스트 쿼리 추가
const testDatabaseConnection = () => {
    try {
        const result = db.prepare('SELECT COUNT(*) as count FROM oda_data').get();
        console.log(`Database connected successfully. Total records: ${result.count}`);
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

testDatabaseConnection();

module.exports = {
    getTechInvestmentByCountry,
    getResearchProjects
}; 