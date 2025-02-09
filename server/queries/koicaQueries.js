const { db } = require('../models/model');

async function getKoicaProjects(country) {
    const projects = db.prepare(`
        SELECT sector, amount, year 
        FROM oda_education 
        WHERE country = ?
    `).all(country);

    return {
        basic_education: projects.filter(p => p.sector === '학습성과를 위한 양질의 교육'),
        digital_education: projects.filter(p => p.sector === '미래역량개발을 위한 디지털교육'),
        higher_education: projects.filter(p => p.sector === '인재양성을 위한 직업·고등교육')
    };
}

module.exports = { getKoicaProjects }; 