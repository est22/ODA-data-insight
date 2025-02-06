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
        recipient_name,
        SUM(usd_commitment) as total_investment,
        COUNT(DISTINCT project_number) as project_count
    FROM oda_data
    WHERE purpose_code IN ('11182', '32182', '22081', '22040', '114%', '321%')
    GROUP BY recipient_name
    ORDER BY total_investment DESC
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

// Prepare statement for better performance
const strategicGoalsStmt = db.prepare(`
    WITH project_stats AS (
        SELECT 
            CASE 
                WHEN project_title LIKE '%research%' OR project_title LIKE '%innovation%' 
                    OR project_title LIKE '%digital%' OR project_title LIKE '%ICT%'
                    THEN '과학기술혁신'
                WHEN project_title LIKE '%education%' OR project_title LIKE '%training%' 
                    THEN '교육'
            END as matched_sector,
            COUNT(DISTINCT project_number) as proj_count,
            ROUND(SUM(usd_commitment) / 1000000, 2) as total_investment
        FROM oda_data
        WHERE purpose_code IN ('11182', '32182', '22081', '22040')
        GROUP BY matched_sector
    )
    SELECT 
        i.sector,
        i.strategic_goal,
        i.program,
        COALESCE(p.proj_count, 0) as project_count,
        COALESCE(p.total_investment, 0) as total_investment_million_usd,
        i.performance_indicators,
        i.output_indicators
    FROM sdg_indicators i
    LEFT JOIN project_stats p ON i.sector = p.matched_sector
    WHERE i.sector IN ('과학기술혁신', '교육')
    AND p.proj_count > 0
    ORDER BY p.total_investment DESC
`);

// Simplified cache
let cache = null;

// Simple query function
const getStrategicGoalsAnalysis = () => {
    if (cache) return cache;
    
    try {
        const strategicData = strategicGoalsStmt.all();
        cache = {
            success: true,
            data: strategicData,
            metadata: {
                sectors: [...new Set(strategicData.map(r => r.sector))],
                totalProjects: strategicData.reduce((sum, r) => sum + r.project_count, 0),
                totalInvestment: strategicData.reduce((sum, r) => sum + r.total_investment_million_usd, 0)
            }
        };
        return cache;
    } catch (error) {
        console.error('Query execution failed:', error);
        throw error;
    }
};

// Export functions
module.exports = {
    getStrategicGoalsAnalysis
}; 