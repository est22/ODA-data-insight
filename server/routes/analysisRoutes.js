const express = require('express');
const router = express.Router();
const { 
    getInvestmentEfficiency, 
    getSynergyAnalysis, 
    getSustainabilityAnalysis 
} = require('../models/educationAnalysis');

// 1. Investment Efficiency Analysis
// GET /analysis/efficiency
router.get('/efficiency', (req, res) => {
    try {
        const efficiency = getInvestmentEfficiency();
        res.json({
            success: true,
            message: 'Analysis of investment efficiency in education projects',
            data: efficiency,
            metadata: {
                description: '투자 대비 교육 지표 개선율 분석',
                metrics: {
                    avg_improvement: '전체 지표의 평균 개선율 (%)',
                    investment_per_improvement: '1% 개선당 필요한 투자금액 (USD)',
                    indicators: '각 지표별 세부 개선율'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 2. Synergy Analysis
// GET /analysis/synergy
router.get('/synergy', (req, res) => {
    try {
        const synergy = getSynergyAnalysis();
        res.json({
            success: true,
            message: 'Analysis of synergistic effects between education categories',
            data: synergy,
            metadata: {
                description: '교육 분야 간 시너지 효과 분석',
                metrics: {
                    investment_distribution: '각 분야별 투자 분포',
                    basic_edu_score: '기초교육 성과 점수',
                    digital_edu_score: '디지털교육 성과 점수',
                    higher_edu_score: '고등교육 성과 점수'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 3. Sustainability Analysis
// GET /analysis/sustainability
router.get('/sustainability', (req, res) => {
    try {
        const sustainability = getSustainabilityAnalysis();
        res.json({
            success: true,
            message: 'Analysis of long-term sustainability of education projects',
            data: sustainability,
            metadata: {
                description: '교육 프로젝트의 지속가능성 분석',
                metrics: {
                    active_years: '프로젝트 활동 기간',
                    avg_yearly_investment: '연평균 투자액',
                    indicators: {
                        total_change: '전체 변화량',
                        yearly_change: '연간 변화율',
                        sustainability_score: '지속가능성 점수 (프로젝트 종료 후 효과 지속성)'
                    }
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router; 