const { db } = require('./model');

// Check database tables
console.log('Checking database tables...');
const odaCount = db.prepare('SELECT COUNT(*) as count FROM oda_data').get();
const sdgCount = db.prepare('SELECT COUNT(*) as count FROM sdg_indicators').get();
console.log(`ODA data records: ${odaCount.count}`);
console.log(`SDG indicators records: ${sdgCount.count}`);

// Prepare statements for frequently used queries
const techInvestmentStmt = db.prepare(`
    SELECT 
        year,
        recipient_name,
        purpose_code,
        project_title,
        SUM(usd_commitment) as total_investment,
        COUNT(DISTINCT project_number) as project_count,
        gender,
        environment,
        trade,
        sdg_focus
    FROM oda_data
    WHERE purpose_code IN ('11182', '32182', '22081', '22040', '114%', '321%')
    GROUP BY year, recipient_name, purpose_code
    ORDER BY year DESC, total_investment DESC
`);

const projectOutputsStmt = db.prepare(`
    SELECT 
        recipient_name,
        project_title,
        purpose_code,
        usd_commitment,
        usd_disbursement,
        ROUND((usd_disbursement / usd_commitment) * 100, 2) as execution_rate,
        sdg_focus
    FROM oda_data
    WHERE project_title LIKE '%research%' 
        OR project_title LIKE '%innovation%'
        OR project_title LIKE '%technology%'
        OR project_title LIKE '%digital%'
        OR project_title LIKE '%ICT%'
    AND usd_commitment > 0
    ORDER BY usd_commitment DESC
`);

const sdgAnalysisStmt = db.prepare(`
    SELECT 
        o.sdg_focus,
        COUNT(DISTINCT o.project_number) as project_count,
        ROUND(SUM(o.usd_commitment) / 1000000, 2) as total_investment_million,
        ROUND((SUM(o.usd_disbursement) / SUM(o.usd_commitment)) * 100, 2) as execution_rate,
        ROUND(AVG(o.gender) * 100, 2) as gender_focus_percentage,
        COUNT(DISTINCT o.recipient_name) as beneficiary_countries,
        GROUP_CONCAT(DISTINCT o.purpose_code) as related_purpose_codes
    FROM oda_data o
    WHERE o.sdg_focus IS NOT NULL
    AND purpose_code IN ('11182', '32182', '22081', '22040', '114%', '321%')
    GROUP BY o.sdg_focus
    ORDER BY total_investment_million DESC
`);

// Strategic goals achievement analysis
const getStrategicGoalsAnalysis = () => {
    const query = `
        WITH project_categories AS (
            SELECT 
                CASE 
                    WHEN project_title LIKE '%research%' OR project_title LIKE '%innovation%' 
                        THEN '과학기술혁신'
                    WHEN project_title LIKE '%education%' OR project_title LIKE '%training%' 
                        THEN '교육'
                    WHEN project_title LIKE '%digital%' OR project_title LIKE '%ICT%' 
                        THEN '과학기술혁신'
                END as project_sector,
                *
            FROM oda_data
            WHERE purpose_code IN ('11182', '32182', '22081', '22040')
        )
        SELECT 
            i.sector,
            i.strategic_goal,
            i.program,
            COUNT(DISTINCT p.project_number) as project_count,
            ROUND(SUM(p.usd_commitment) / 1000000, 2) as total_investment_million_usd,
            ROUND((SUM(p.usd_disbursement) / SUM(p.usd_commitment)) * 100, 2) as execution_rate,
            COUNT(DISTINCT p.recipient_name) as country_count,
            i.performance_indicators,
            i.output_indicators,
            GROUP_CONCAT(DISTINCT p.project_title) as sample_projects
        FROM sdg_indicators i
        LEFT JOIN project_categories p ON i.sector = p.project_sector
        WHERE i.sector IN ('과학기술혁신', '교육')
        GROUP BY i.sector, i.strategic_goal, i.program
        HAVING project_count > 0
        ORDER BY total_investment_million_usd DESC
    `;
    return db.prepare(query).all();
};

// Performance timeline analysis
const getPerformanceTimeline = () => {
    const query = `
        SELECT 
            o.year,
            i.sector,
            i.strategic_goal,
            COUNT(DISTINCT o.project_number) as projects,
            ROUND(SUM(o.usd_commitment) / 1000000, 2) as investment_million_usd,
            ROUND(AVG(o.gender) * 100, 2) as gender_focus_percentage,
            COUNT(DISTINCT o.recipient_name) as countries
        FROM oda_data o
        JOIN sdg_indicators i ON 
            CASE 
                WHEN o.project_title LIKE '%research%' OR o.project_title LIKE '%innovation%' 
                    THEN i.sector = '과학기술혁신'
                WHEN o.project_title LIKE '%education%' OR o.project_title LIKE '%training%' 
                    THEN i.sector = '교육'
            END
        WHERE o.year BETWEEN 2018 AND 2023
        GROUP BY o.year, i.sector, i.strategic_goal
        ORDER BY o.year DESC, investment_million_usd DESC
    `;
    return db.prepare(query).all();
};

// Export functions with the same names as before
module.exports = {
    getTechInvestmentImpact: () => techInvestmentStmt.all(),
    getProjectOutputs: () => projectOutputsStmt.all(),
    getSDGPerformanceAnalysis: () => sdgAnalysisStmt.all(),
    getStrategicGoalsAnalysis: () => getStrategicGoalsAnalysis(),
    getPerformanceTimeline: () => getPerformanceTimeline()
}; 