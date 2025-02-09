const { db } = require('../models/model');

async function getKoicaProjects(country) {
    try {
        const projects = db.prepare(`
            SELECT 
                category,
                investment as amount,
                year,
                project_name
            FROM oda_education 
            WHERE country = ? AND category IS NOT NULL
        `).all(country);

        return {
            basic_education: projects.filter(p => p.category === '학습성과를 위한 양질의 교육'),
            digital_education: projects.filter(p => p.category === '미래역량개발을 위한 디지털교육'),
            higher_education: projects.filter(p => p.category === '인재양성을 위한 직업·고등교육')
        };
    } catch (error) {
        console.error('Error in getKoicaProjects:', error);
        return {
            basic_education: [], digital_education: [], higher_education: []
        };
    }
}

module.exports = { getKoicaProjects }; 