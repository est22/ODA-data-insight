const { db } = require('../models/model');
const { 
    getInvestmentEfficiency,
    getSynergyAnalysis,
    getSustainabilityAnalysis 
} = require('../models/educationAnalysis');
const COUNTRY_MAPPING = require('../data/countryMapping');

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
    async getEfficiencyAnalysis(country) {
        const data = await getInvestmentEfficiency();
        
        // simplified country name mapping (special characters, Republic of, etc.)  
        const simplifiedCountryName = country
            .replace(/Republic of |Democratic |People's |Socialist |State of |/g, '')
            .replace(/['']/g, '')
            .trim();
        
        // find similar country name in the data
        const countryData = data.filter(d => {
            const simplifiedDbCountry = d.country
                .replace(/Republic of |Democratic |People's |Socialist |State of |/g, '')
                .replace(/['']/g, '')
                .trim();
            return simplifiedDbCountry === simplifiedCountryName;
        });


        return {
            metrics: {
                overall: Math.round(countryData.reduce((sum, d) => sum + d.avg_improvement, 0) / countryData.length) || 0,
                costEffectiveness: [
                    {
                        category: "미래역량개발을 위한 디지털교육",
                        score: Math.round(countryData.find(d => d.category === 'digital_education')?.avg_improvement || 0)
                    },
                    {
                        category: "인재양성을 위한 직업·고등교육",
                        score: Math.round(countryData.find(d => d.category === 'higher_education')?.avg_improvement || 0)
                    },
                    {
                        category: "학습성과를 위한 양질의 교육",
                        score: Math.round(countryData.find(d => d.category === 'basic_education')?.avg_improvement || 0)
                    }
                ]
            }
        };
    }

    async getSynergyAnalysis(country) {
        const data = await getSynergyAnalysis();
        const worldBankCountryName = REVERSE_MAPPING[country] || country;
        const countryData = data.find(d => d.country === worldBankCountryName);
        
        if (!countryData) {
            console.log('No data found for country:', country);
            return {
                metrics: { balanceScore: 0 },
                distribution: [
                    { category: "미래역량개발을 위한 디지털교육", percentage: 0 },
                    { category: "인재양성을 위한 직업·고등교육", percentage: 0 },
                    { category: "학습성과를 위한 양질의 교육", percentage: 0 }
                ]
            };
        }

        try {
            const investmentDistribution = JSON.parse(countryData.investment_distribution || '{}');
            const total = Object.values(investmentDistribution).reduce((a, b) => a + Number(b), 0);
            
            const scores = {
                digital: (investmentDistribution['미래역량개발을 위한 디지털교육'] || 0) / total * 100,
                higher: (investmentDistribution['인재양성을 위한 직업·고등교육'] || 0) / total * 100,
                basic: (investmentDistribution['학습성과를 위한 양질의 교육'] || 0) / total * 100
            };

            return {
                metrics: { 
                    balanceScore: Math.round((scores.digital + scores.higher + scores.basic) / 3)
                },
                distribution: [
                    { category: "미래역량개발을 위한 디지털교육", percentage: Math.round(scores.digital) },
                    { category: "인재양성을 위한 직업·고등교육", percentage: Math.round(scores.higher) },
                    { category: "학습성과를 위한 양질의 교육", percentage: Math.round(scores.basic) }
                ]
            };
        } catch (error) {
            console.error('Error parsing synergy data:', error);
            throw new Error('Failed to analyze synergy data');
        }
    }

    async getSustainabilityAnalysis(country) {
        const data = await getSustainabilityAnalysis();
        const worldBankCountryName = REVERSE_MAPPING[country] || country;
        const countryData = data.find(d => d.country === worldBankCountryName);

        // calculate sustainability score
        const calculateSustainabilityScore = (indicators) => {
            if (!indicators) return 0;
            const parsed = JSON.parse(indicators);
            return Object.values(parsed).reduce((acc, curr) => {
                return acc + (curr.sustainability_score || 0);
            }, 0) / Object.keys(parsed).length;
        };

        return {
            metrics: {
                environmental: { 
                    score: Math.round(calculateSustainabilityScore(countryData?.indicators))
                },
                social: { 
                    score: Math.round(countryData?.active_years * 10)
                },
                economic: { 
                    score: Math.round((countryData?.avg_yearly_investment || 0) / 10000)
                }
            }
        };
    }


    async getStrategicInsights(country) {
        const data = await getWorldBankData(country);
        
        return {
            efficiency: {
                // 교육 투자 대비 성과 분석
                roi: calculateROI(data),
                trends: analyzeTrends(data),
                recommendations: generateEfficiencyRecommendations(data)
            },
            synergy: {
                // 교육 분야간 시너지 분석
                crossSectorImpact: analyzeCrossSectorImpact(data),
                integrationScore: calculateIntegrationScore(data),
                recommendations: generateSynergyRecommendations(data)
            },
            sustainability: {
                // 지속가능성 분석
                environmentalImpact: calculateEnvironmentalImpact(data),
                socialEquity: analyzeSocialEquity(data),
                economicViability: assessEconomicViability(data),
                recommendations: generateSustainabilityRecommendations(data)
            }
        };
    }
}

module.exports = new AnalysisService();


