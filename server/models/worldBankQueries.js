const { db } = require('./model');

const chalk = require('chalk');
const cliProgress = require('cli-progress');

const { getCountryIsoCode } = require('../services/worldBankService');

const INDICATORS = {
    basic_education: [ 
        'SE.PRM.CMPT.ZS',     // Primary completion rate (% of relevant age group) - De Facto
        'SE.PRM.ENRR',        // School enrollment, primary (% gross) - De Facto
        'SE.PRM.TENR',        // Trained teachers in primary education (% of total teachers) - De Jure
        'SE.XPD.PRIM.PC.ZS',  // Government expenditure per student, primary (% of GDP per capita) - De Jure
        'SE.PRM.PRSL.ZS',     // Persistence to last grade of primary (% of cohort) - De Facto
        'SE.SEC.CMPT.LO.ZS',  // Lower secondary completion rate (% of relevant age group) - De Facto
        'SE.PRM.TCAQ.ZS',     // Qualified teachers in primary education (% of total teachers) - De Jure
        'UIS.LR.AG25T64'      // Literacy rate, population 25-64 years (%) - De Facto
    ],
    digital_education: [
        'IT.NET.USER.ZS',     // Individuals using the Internet (% of population) - De Facto
        'IT.CEL.SETS.P2',     // Mobile cellular subscriptions (per 100 people) - De Facto
        'IT.NET.BBND.P2',     // Fixed broadband subscriptions (per 100 people) - De Facto
        'IT.NET.SECR.P6',     // Secure Internet servers (per 1 million people) - De Facto
        'GB.XPD.RSDV.GD.ZS',  // Research and development expenditure (% of GDP) - De Jure
        'IP.JRN.ARTC.SC'      // Scientific and technical journal articles - De Facto
    ],
    higher_education: [
        'SE.TER.ENRR',        // School enrollment, tertiary (% gross) - De Facto
        'SL.UEM.ADVN.ZS',     // Unemployment with advanced education - De Facto
        'SE.XPD.TERT.PC.ZS',  // Government expenditure per student, tertiary (% of GDP per capita) - De Jure
        'SE.TER.CUAT.BA.ZS',  // Educational attainment, Bachelor's or equivalent (% of population 25+) - De Facto
        'SE.TER.CUAT.MS.ZS',  // Educational attainment, Master's or equivalent (% of population 25+) - De Facto
        'SL.UEM.BASC.ZS'      // Unemployment with basic education (% of total labor force) - De Facto
    ]
};

async function fetchWorldBankData() {
    try {
        // Check if table exists and has data
        const tableExists = db.prepare(`
            SELECT COUNT(*) as count 
            FROM sqlite_master 
            WHERE type='table' AND name='world_bank_education'
        `).get();

        const hasData = tableExists.count > 0 && db.prepare(`
            SELECT COUNT(*) as count 
            FROM world_bank_education
        `).get().count > 0;

        if (hasData) {
            console.log('\n' + chalk.green.bold('World Bank data already exists.') + '\n');
            return;
        }

        // If table doesn't exist or is empty, proceed with data fetching
        db.prepare('DROP TABLE IF EXISTS world_bank_education').run();
        db.prepare(`
            CREATE TABLE IF NOT EXISTS world_bank_education (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                indicator_code TEXT NOT NULL,
                indicator_name TEXT NOT NULL,
                country TEXT NOT NULL,
                year INTEGER NOT NULL,
                value REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Get unique countries from oda_education
        const countries = db.prepare(`
            SELECT DISTINCT country 
            FROM oda_education
            ORDER BY country
        `).all();

        const countryList = countries
            .map(c => getCountryIsoCode(c.country))
            .filter(code => code) // remove null values 
            .join(';');

        console.log('\n' + chalk.cyan.bold('Initializing World Bank Data...') + '\n');
        console.log('Countries to fetch:', countries.map(c => `${c.country} (${getCountryIsoCode(c.country)})`).join(', '));

        // Create progress bar
        const progressBar = new cliProgress.MultiBar({
            clearOnComplete: false,
            hideCursor: true,
            format: '{category} |' + chalk.cyan('{bar}') + '| {percentage}% || {indicator}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            stopOnComplete: true
        }, cliProgress.Presets.shades_classic);

        // Create progress bars for each category
        const bars = {};
        const categories = [...new Set(Object.keys(INDICATORS))];  // 중복 제거
        for (const category of categories) {
            bars[category] = progressBar.create(INDICATORS[category].length, 0, {
                category: chalk.yellow.bold(category.padEnd(20)),
                indicator: ''
            });
        }

        // Calculate total indicators
        const totalIndicators = Object.values(INDICATORS).flat().length;
        let currentIndicator = 0;

        // Fetch data for each indicator
        for (const [category, indicators] of Object.entries(INDICATORS)) {
            for (const [index, indicator] of indicators.entries()) {
                bars[category].update(index + 1, {
                    indicator: chalk.gray(`Loading: ${indicator}`)
                });

                
                const url = `http://api.worldbank.org/v2/country/${countryList}/indicator/${indicator}?format=json&per_page=1000&date=2010:2023`;
                
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (!data || !data[1]) {
                        console.log(`No data available for indicator: ${indicator}`);
                        continue;
                    }

                    const insertStmt = db.prepare(`
                        INSERT INTO world_bank_education (
                            category, indicator_code, indicator_name,
                            country, year, value
                        ) VALUES (
                            @category, @indicator_code, @indicator_name,
                            @country, @year, @value
                        )
                    `);

                    const insertMany = db.transaction((rows) => {
                        for (const row of rows) {
                            if (row.value !== null) { 
                                insertStmt.run(row);
                            }
                        }
                    });

                    const rows = data[1].map(item => ({
                        category,
                        indicator_code: indicator,
                        indicator_name: item.indicator.value,
                        country: item.country.value,
                        year: parseInt(item.date),
                        value: parseFloat(item.value)
                    })).filter(row => row.value !== null);

                    if (rows.length > 0) {
                        insertMany(rows);
                    }

                } catch (error) {
                    console.error(`Error fetching ${indicator}:`, error.message);
                }

                // delay to avoid API limit
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        progressBar.stop();
        console.log('\n' + chalk.green.bold('World Bank data loaded successfully!') + '\n');
    } catch (error) {
        console.error('\n' + chalk.red.bold('Failed to fetch World Bank data:'), error + '\n');
        throw error;
    }
}

function getWorldBankData() {
    return db.prepare(`
        SELECT * FROM world_bank_education
        ORDER BY category, year DESC
    `).all();
}

async function getWorldBankData(country) {
    const countryCode = getCountryIsoCode(country);
    const results = {};
    
    for (const [category, indicators] of Object.entries(INDICATORS)) {
        const metrics = await Promise.all(indicators.map(async (indicator) => {
            // fetch data from 2015 to 2023
            const data = await fetchIndicatorData(countryCode, indicator, '2015:2023');
            return {
                indicator,
                values: data.reduce((acc, d) => {
                    acc[d.date] = d.value;
                    return acc;
                }, {})
            };
        }));
        results[category] = metrics;
    }
    return results;
}

async function fetchIndicatorData(countryCode, indicator, dateRange) {
    const url = `http://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&date=${dateRange}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data || !data[1]) return [];
    return data[1].map(item => ({
        date: item.date,
        value: item.value !== null ? parseFloat(item.value) : null
    }));
}

module.exports = {
    fetchWorldBankData,
    getWorldBankData,
    INDICATORS
}; 