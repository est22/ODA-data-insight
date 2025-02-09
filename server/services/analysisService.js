const { db } = require('../models/model');
const { 
    getInvestmentEfficiency,
    getSynergyAnalysis,
    getSustainabilityAnalysis 
} = require('../models/educationAnalysis');
const COUNTRY_MAPPING = require('../data/countryMapping');
const worldBankQueries = require('../models/worldBankQueries');
const koicaQueries = require('./koicaQueries');

// create reverse mapping for KOICA -> World Bank
const REVERSE_MAPPING = Object.entries(COUNTRY_MAPPING).reduce((acc, [wb, koica]) => {
    acc[koica] = wb;
    return acc;
}, {});

const SECTOR_MAPPING = {
    '미래역량개발을 위한 디지털교육': 'digital_education',
    '인재양성을 위한 직업·고등교육': 'higher_education',
    '학습성과를 위한 양질의 교육': 'basic_education'
};

class AnalysisService {
    // A. Investment Efficiency Analysis
    async getEfficiencyAnalysis(country) {
        const worldBankData = await worldBankQueries.getWorldBankData(country);
        const koicaProjects = await koicaQueries.getKoicaProjects(country);

        const analysis = {};
        for (const sector of ['basic_education', 'digital_education', 'higher_education']) {
            const metrics = worldBankData[sector];
            const projects = koicaProjects[sector];

            // 1. Year-over-year improvement rates
            const yearlyImprovement = this.calculateYearlyImprovement(metrics);
            
            // 2. Investment effectiveness
            const investmentEfficiency = this.calculateInvestmentEfficiency(projects);

            // 3. Cost-effectiveness score
            const efficiencyScore = this.computeEfficiencyScore(yearlyImprovement, investmentEfficiency);

            analysis[sector] = {
                efficiency_score: Math.round(efficiencyScore),
                improvement_rate: Math.round(yearlyImprovement),
                investment_efficiency: Math.round(investmentEfficiency)
            };
        }
        return analysis;
    }

    calculateYearlyImprovement(metrics) {
        if (!metrics?.length) return 0;
        return metrics.map(m => {
            const years = Object.keys(m.values).sort();
            if (years.length < 2) return 0;
            const oldest = m.values[years[0]] || 0;
            const latest = m.values[years[years.length - 1]] || 0;
            return oldest === 0 ? 0 : ((latest - oldest) / oldest) * 100;
        }).reduce((sum, rate, _, arr) => sum + rate / arr.length, 0);
    }

    calculateInvestmentEfficiency(projects) {
        if (!projects?.length) return 0;
        
        const totalInvestment = projects.reduce((sum, p) => sum + p.amount, 0);
        const years = new Set(projects.map(p => p.year)).size;
        
        // calculate average investment per year and projects per year
        const averageInvestmentPerYear = totalInvestment / years;
        const projectsPerYear = projects.length / years;
        
        // normalize to 100 points
        return Math.min(100, (projectsPerYear / averageInvestmentPerYear) * 50);
    }

    computeEfficiencyScore(improvement, efficiency) {
        const IMPROVEMENT_WEIGHT = 0.7;
        const EFFICIENCY_WEIGHT = 0.3;
        
        // normalize to 100 points
        const normalizedImprovement = Math.min(100, Math.max(0, improvement));
        const normalizedEfficiency = Math.min(100, Math.max(0, efficiency));
        
        return (normalizedImprovement * IMPROVEMENT_WEIGHT) + 
               (normalizedEfficiency * EFFICIENCY_WEIGHT);
    }

    // B. Synergy Analysis
    async getSynergyAnalysis(country) {
        const koicaProjects = await koicaQueries.getKoicaProjects(country);
        
        // 1. Cross-category investment distribution
        const distribution = Object.entries(koicaProjects).reduce((acc, [sector, projects]) => {
            const totalInvestment = projects.reduce((sum, p) => sum + p.amount, 0);
            acc[sector] = totalInvestment;
            return acc;
        }, {});

        // 2. Calculate balance score
        const totalInvestment = Object.values(distribution).reduce((a, b) => a + b, 0);
        const balanceScore = this.calculateBalanceScore(distribution, totalInvestment);

        // 3. Evaluate investment strategy
        const strategyAnalysis = this.evaluateStrategy(distribution, totalInvestment);

        return {
            metrics: { balanceScore },
            distribution: Object.entries(distribution).map(([category, amount]) => ({
                category,
                percentage: totalInvestment ? (amount / totalInvestment) * 100 : 0
            })),
            strategy_recommendation: strategyAnalysis
        };
    }

    calculateBalanceScore(distribution, total) {
        if (!total) return 0;
        const idealShare = 1 / Object.keys(distribution).length;
        const variance = Object.values(distribution).reduce((acc, value) => {
            const share = value / total;
            return acc + Math.pow(share - idealShare, 2);
        }, 0);
        return Math.round((1 - Math.sqrt(variance)) * 100);
    }

    evaluateStrategy(distribution, total) {
        if (!total) return {};

        const shares = Object.entries(distribution).map(([sector, amount]) => ({
            sector,
            share: (amount / total) * 100
        }));

        // analyze investment strategy
        const maxShare = Math.max(...shares.map(s => s.share));
        const minShare = Math.min(...shares.map(s => s.share));
        const gap = maxShare - minShare;

        // strategy recommendation
        if (gap > 50) {
            return {
                type: 'Focused',
                description: 'Currently focused on specific sectors.',
                recommendation: 'Consider balancing investments across sectors.'
            };
        } else if (gap < 20) {
            return {
                type: 'Balanced',
                description: 'Currently has a balanced investment strategy.',
                recommendation: 'Maintain the current balanced approach.'
            };
        } else {
            return {
                type: 'Moderate',
                description: 'Currently has a moderate investment strategy.',
                recommendation: 'Consider adjusting based on key performance areas.'
            };
        }
    }

    // C. Sustainability Analysis
    async getSustainabilityAnalysis(country) {
        const worldBankData = await worldBankQueries.getWorldBankData(country);
        const koicaProjects = await koicaQueries.getKoicaProjects(country);

        // 1. Track post-project sustainability
        const sustainabilityMetrics = this.calculateSustainabilityMetrics(worldBankData);

        // 2. Long-term effectiveness
        const longTermScore = this.evaluateLongTermEffectiveness(koicaProjects);

        // 3. Self-sustaining potential
        const selfSustainingScore = this.calculateSelfSustainingPotential(worldBankData);

        return {
            metrics: {
                environmental: { score: sustainabilityMetrics.environmental },
                social: { score: longTermScore },
                economic: { score: selfSustainingScore }
            }
        };
    }

    calculateSustainabilityMetrics(worldBankData) {
        const metrics = {
            environmental: 0,
            social: 0,
            economic: 0
        };

        // analyze improvement sustainability
        Object.entries(worldBankData).forEach(([sector, indicators]) => {
            const improvements = this.calculateYearlyImprovement(indicators);
            const stability = this.calculateStabilityScore(indicators);
            
            metrics.environmental += improvements * 0.3;
            metrics.social += stability * 0.4;
            metrics.economic += (improvements + stability) * 0.3;
        });

        return {
            environmental: Math.round(metrics.environmental),
            social: Math.round(metrics.social),
            economic: Math.round(metrics.economic)
        };
    }

    evaluateLongTermEffectiveness(koicaProjects) {
        if (!Object.values(koicaProjects).some(projects => projects.length > 0)) {
            return 0;
        }

        let totalScore = 0;
        let totalProjects = 0;

        Object.values(koicaProjects).forEach(projects => {
            if (!projects.length) return;

            // analyze project duration
            const years = new Set(projects.map(p => p.year));
            const duration = Math.max(...years) - Math.min(...years) + 1;
            
            // investment continuity score
            const continuityScore = duration * 20; // 5 years or more is 100 points
            
            totalScore += Math.min(100, continuityScore);
            totalProjects++;
        });

        return totalProjects ? Math.round(totalScore / totalProjects) : 0;
    }

    calculateSelfSustainingPotential(worldBankData) {
        if (!worldBankData) return 0;

        const potentialScores = Object.entries(worldBankData).map(([sector, indicators]) => {
            // 1. indicator improvement trend
            const trend = this.calculateYearlyImprovement(indicators);
            
            // 2. indicator stability
            const stability = this.calculateStabilityScore(indicators);
            
            // 3. overall score
            return (trend * 0.6 + stability * 0.4);
        });

        return Math.round(potentialScores.reduce((sum, score) => sum + score, 0) / potentialScores.length);
    }

    calculateStabilityScore(indicators) {
        if (!indicators?.length) return 0;
        
        return indicators.map(indicator => {
            const values = Object.values(indicator.values).filter(v => v !== null);
            if (values.length < 2) return 0;
            
            const variance = this.calculateVariance(values);
            return 100 / (1 + variance);
        }).reduce((sum, score) => sum + score, 0) / indicators.length;
    }

    // calculate variance
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squareDiffs = values.map(val => Math.pow(val - mean, 2));
        return squareDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    async getStrategicInsights(country) {
        const data = await getWorldBankData(country);
        
        return {
            efficiency: {
                // analyze education investment results
                roi: calculateROI(data),
                trends: analyzeTrends(data),
                recommendations: generateEfficiencyRecommendations(data)
            },
            synergy: {
                // analyze cross-sector synergy
                crossSectorImpact: analyzeCrossSectorImpact(data),
                integrationScore: calculateIntegrationScore(data),
                recommendations: generateSynergyRecommendations(data)
            },
            sustainability: {
                // analyze sustainability
                environmentalImpact: calculateEnvironmentalImpact(data),
                socialEquity: analyzeSocialEquity(data),
                economicViability: assessEconomicViability(data),
                recommendations: generateSustainabilityRecommendations(data)
            }
        };
    }
}

module.exports = new AnalysisService();



