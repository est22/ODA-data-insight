const { db } = require('./model');

// 1. investment efficiency analysis
function getInvestmentEfficiency() {
    return db.prepare(`
        WITH yearly_changes AS (
            SELECT 
                w1.country,
                w1.category,
                w1.indicator_code,
                w1.indicator_name,
                w1.year,
                ((w1.value - w2.value) / w2.value * 100) as improvement_rate,
                o.total_investment,
                o.project_count
            FROM world_bank_education w1
            JOIN world_bank_education w2 
                ON w1.country = w2.country 
                AND w1.indicator_code = w2.indicator_code
                AND w1.year = w2.year + 1
            JOIN (
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
            ) o ON w1.country = o.country AND w1.category = o.category
        )
        SELECT 
            country,
            category,
            total_investment,
            project_count,
            AVG(improvement_rate) as avg_improvement,
            total_investment / NULLIF(AVG(improvement_rate), 0) as investment_per_improvement,
            json_group_object(
                indicator_code,
                json_object(
                    'name', indicator_name,
                    'improvement_rate', improvement_rate
                )
            ) as indicators
        FROM yearly_changes
        GROUP BY country, category
        HAVING avg_improvement > 0
        ORDER BY investment_per_improvement ASC
    `).all();
}

// 2. synergy analysis
function getSynergyAnalysis() {
    return db.prepare(`
        WITH category_investments AS (
            SELECT 
                country,
                json_object(
                    '학습성과를 위한 양질의 교육', 
                    SUM(CASE WHEN category = '학습성과를 위한 양질의 교육' THEN investment ELSE 0 END),
                    '미래역량개발을 위한 디지털교육',
                    SUM(CASE WHEN category = '미래역량개발을 위한 디지털교육' THEN investment ELSE 0 END),
                    '인재양성을 위한 직업·고등교육',
                    SUM(CASE WHEN category = '인재양성을 위한 직업·고등교육' THEN investment ELSE 0 END)
                ) as investment_distribution
            FROM oda_education
            GROUP BY country
        )
        SELECT 
            w.country,
            ci.investment_distribution,
            AVG(CASE WHEN w.category = 'basic_education' THEN w.value END) as basic_edu_score,
            AVG(CASE WHEN w.category = 'digital_education' THEN w.value END) as digital_edu_score,
            AVG(CASE WHEN w.category = 'higher_education' THEN w.value END) as higher_edu_score
        FROM world_bank_education w
        JOIN category_investments ci ON w.country = ci.country
        WHERE w.year = (SELECT MAX(year) FROM world_bank_education)
        GROUP BY w.country
        HAVING basic_edu_score IS NOT NULL 
            AND digital_edu_score IS NOT NULL 
            AND higher_edu_score IS NOT NULL
    `).all();
}

// 3. sustainability analysis
function getSustainabilityAnalysis() {
    return db.prepare(`
        WITH project_timeline AS (
            SELECT 
                country,
                category,
                MIN(year) as start_year,
                MAX(year) as end_year,
                COUNT(DISTINCT year) as active_years,
                SUM(investment) as total_investment
            FROM oda_education
            GROUP BY country, category
        ),
        indicator_trends AS (
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
                AND w2.year = (
                    SELECT MAX(year) 
                    FROM world_bank_education w3 
                    WHERE w3.country = w1.country 
                    AND w3.indicator_code = w1.indicator_code
                )
            WHERE w1.year = (
                SELECT MIN(year) 
                FROM world_bank_education w4 
                WHERE w4.country = w1.country 
                AND w4.indicator_code = w1.indicator_code
            )
        )
        SELECT 
            pt.country,
            pt.category,
            pt.active_years,
            pt.total_investment / pt.active_years as avg_yearly_investment,
            json_group_object(
                it.indicator_code,
                json_object(
                    'name', it.indicator_name,
                    'total_change', it.value_change,
                    'yearly_change', it.value_change / NULLIF(pt.active_years, 0),
                    'sustainability_score', 
                    CASE 
                        WHEN it.value_change > 0 AND it.years_since_last_project > 2 
                        THEN it.value_change / it.years_since_last_project 
                        ELSE NULL 
                    END
                )
            ) as indicators
        FROM project_timeline pt
        JOIN indicator_trends it ON pt.country = it.country
        GROUP BY pt.country, pt.category
        HAVING active_years > 1
        ORDER BY avg_yearly_investment DESC
    `).all();
}

module.exports = {
    getInvestmentEfficiency,
    getSynergyAnalysis,
    getSustainabilityAnalysis
}; 