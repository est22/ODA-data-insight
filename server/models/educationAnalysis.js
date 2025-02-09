const { db } = require('./model');

// 1. investment efficiency analysis
function getInvestmentEfficiency() {
    return db.prepare(`
        WITH yearly_stats AS (
            -- CTE for calculating yearly indicator improvement rates
            SELECT 
                w1.country,
                w1.category,
                w1.year,
                AVG((w1.value - w2.value) / NULLIF(w2.value, 0) * 100) as yearly_improvement
            FROM world_bank_education w1
            JOIN world_bank_education w2 
                ON w1.country = w2.country 
                AND w1.indicator_code = w2.indicator_code
                AND w1.year = w2.year + 1
            GROUP BY w1.country, w1.category, w1.year
        ),
        investment_stats AS (
            -- investment statistics for CTE
            SELECT 
                country,
                CASE 
                    WHEN category = '학습성과를 위한 양질의 교육' THEN 'basic_education'
                    WHEN category = '미래역량개발을 위한 디지털교육' THEN 'digital_education'
                    WHEN category = '인재양성을 위한 직업·고등교육' THEN 'higher_education'
                END as category,
                SUM(investment) as total_investment,
                COUNT(*) as project_count
            FROM oda_education
            GROUP BY country, category
        )
        SELECT 
            i.country,
            i.category,
            i.total_investment,
            i.project_count,
            AVG(y.yearly_improvement) as avg_improvement,
            i.total_investment / NULLIF(AVG(y.yearly_improvement), 0) as investment_per_improvement
        FROM investment_stats i
        JOIN yearly_stats y ON i.country = y.country AND i.category = y.category
        GROUP BY i.country, i.category
        HAVING avg_improvement IS NOT NULL
        ORDER BY investment_per_improvement ASC
    `).all();
}

// 2. synergy analysis
function getSynergyAnalysis() {
    return db.prepare(`
        WITH investment_summary AS (
            -- investment summary for CTE
            SELECT 
                country,
                category,
                SUM(investment) as total_investment
            FROM oda_education
            GROUP BY country, category
        ),
        category_scores AS (
            -- category score for CTE
            SELECT 
                country,
                category,
                AVG(value) as score
            FROM world_bank_education
            WHERE year = (SELECT MAX(year) FROM world_bank_education)
            GROUP BY country, category
        )
        SELECT 
            i.country,
            json_object(
                '학습성과를 위한 양질의 교육', MAX(CASE WHEN i.category = '학습성과를 위한 양질의 교육' THEN i.total_investment END),
                '미래역량개발을 위한 디지털교육', MAX(CASE WHEN i.category = '미래역량개발을 위한 디지털교육' THEN i.total_investment END),
                '인재양성을 위한 직업·고등교육', MAX(CASE WHEN i.category = '인재양성을 위한 직업·고등교육' THEN i.total_investment END)
            ) as investment_distribution,
            MAX(CASE WHEN c.category = 'basic_education' THEN c.score END) as basic_edu_score,
            MAX(CASE WHEN c.category = 'digital_education' THEN c.score END) as digital_edu_score,
            MAX(CASE WHEN c.category = 'higher_education' THEN c.score END) as higher_edu_score
        FROM investment_summary i
        JOIN category_scores c ON i.country = c.country
        GROUP BY i.country
        HAVING basic_edu_score IS NOT NULL 
            AND digital_edu_score IS NOT NULL 
            AND higher_edu_score IS NOT NULL
    `).all();
}

// 3. sustainability analysis
function getSustainabilityAnalysis() {
    return db.prepare(`
        WITH project_stats AS (
            -- 프로젝트 통계를 위한 CTE
            SELECT 
                country,
                category,
                COUNT(DISTINCT year) as active_years,
                SUM(investment) as total_investment
            FROM oda_education
            GROUP BY country, category
        ),
        indicator_changes AS (
            -- 지표 변화를 위한 CTE
            SELECT 
                w1.country,
                w1.category,
                w1.indicator_code,
                w1.indicator_name,
                (w2.value - w1.value) as value_change,
                (strftime('%Y', 'now') - w2.year) as years_since_last_project
            FROM world_bank_education w1
            JOIN world_bank_education w2 
                ON w1.country = w2.country 
                AND w1.indicator_code = w2.indicator_code
                AND w2.year = (SELECT MAX(year) FROM world_bank_education)
            WHERE w1.year = (SELECT MIN(year) FROM world_bank_education)
        )
        SELECT 
            p.country,
            p.category,
            p.active_years,
            p.total_investment / p.active_years as avg_yearly_investment,
            json_group_object(
                i.indicator_code,
                json_object(
                    'name', i.indicator_name,
                    'total_change', i.value_change,
                    'yearly_change', i.value_change / NULLIF(p.active_years, 0),
                    'sustainability_score', 
                    CASE 
                        WHEN i.value_change > 0 AND i.years_since_last_project > 2 
                        THEN i.value_change / i.years_since_last_project 
                        ELSE NULL 
                    END
                )
            ) as indicators
        FROM project_stats p
        JOIN indicator_changes i ON p.country = i.country
        GROUP BY p.country, p.category
        HAVING active_years > 1
    `).all();
}

// check available countries in the current DB
function checkAvailableCountries() {
    return db.prepare(`
        SELECT DISTINCT country 
        FROM world_bank_education 
        ORDER BY country
    `).all();
}

// check KOICA data countries
function checkKoicaCountries() {
    return db.prepare(`
        SELECT DISTINCT country 
        FROM oda_education 
        ORDER BY country
    `).all();
}

module.exports = {
    getInvestmentEfficiency,
    getSynergyAnalysis,
    getSustainabilityAnalysis,
    checkAvailableCountries,
    checkKoicaCountries
}; 