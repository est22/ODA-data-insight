const { 
    getInvestmentEfficiency,
    getSynergyAnalysis,
    getSustainabilityAnalysis 
} = require('../models/educationAnalysis');

class AnalysisService {
    async getInvestmentEfficiency() {
        const rawData = await getInvestmentEfficiency();
        return this.processEfficiencyData(rawData);
    }

    processEfficiencyData(data) {
        // investment efficiency analysis
        return data.map(item => ({
            ...item,
            efficiency_score: this.calculateEfficiencyScore(item)
        }));
    }

    async getSynergyAnalysis() {

        const rawData = await getSynergyAnalysis();
        return this.processSynergyData(rawData);
    }

    processSynergyData(data) {
        // synergy analysis
        return data.map(item => ({
            ...item,
            investment_distribution: JSON.parse(item.investment_distribution),
            investment_balance: this.calculateInvestmentBalance(
                JSON.parse(item.investment_distribution)
            ),
            education_balance: this.calculateEducationBalance(item)
        }));
    }

    async getSustainabilityAnalysis() {
        // sustainability analysis
        const rawData = await getSustainabilityAnalysis();
        return this.processSustainabilityData(rawData);
    }

    processSustainabilityData(data) {
        // sustainability analysis
        return data.map(item => ({
            ...item,
            indicators: JSON.parse(item.indicators),
            long_term_impact: this.calculateLongTermImpact(item)
        }));
    }
    // helper methods
    calculateEfficiencyScore(item) {
        return item.avg_improvement / (item.total_investment || 1);
    }

    calculateInvestmentBalance(distribution) {
        // balance of investment
        const values = Object.values(distribution);
        const total = values.reduce((a, b) => a + b, 0);
        return {
            basic_education: distribution['학습성과를 위한 양질의 교육'] / total,
            digital_education: distribution['미래역량개발을 위한 디지털교육'] / total,
            higher_education: distribution['인재양성을 위한 직업·고등교육'] / total
        };
    }

    calculateEducationBalance(item) {
        // balance of education
        const scores = [
            item.basic_edu_score,
            item.digital_edu_score,
            item.higher_edu_score
        ];
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    calculateLongTermImpact(item) {
        // long term impact
        return (item.total_change / item.active_years) * 
               (item.years_since_last_project > 2 ? 1.5 : 1);
    }
}

module.exports = new AnalysisService(); 