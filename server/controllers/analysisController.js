const AnalysisService = require('../services/analysisService');


const analysisController = {
    async getEfficiencyAnalysis(req, res) {
        try {
            const efficiency = await AnalysisService.getInvestmentEfficiency();
            res.json({
                success: true,
                message: 'Analysis of investment efficiency in education projects',
                data: efficiency,
                metadata: {
                    description: '투자 대비 교육 지표 개선율 분석',
                    metrics: {
                        avg_improvement: '전체 지표의 평균 개선율 (%)',
                        investment_per_improvement: '1% 개선당 필요한 투자금액 (USD)',
                        efficiency_score: '투자 효율성 점수'
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    },
    
    async getSynergyAnalysis(req, res) {
        try {
            const synergy = await AnalysisService.getSynergyAnalysis();
            res.json({
                success: true,
                message: 'Analysis of synergy between KOICA and World Bank',
                data: synergy
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    async getSustainabilityAnalysis(req, res) {
        try {
            const sustainability = await AnalysisService.getSustainabilityAnalysis();
            res.json({
                success: true,
                message: 'Analysis of sustainability of education projects',
                data: sustainability
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = analysisController; 