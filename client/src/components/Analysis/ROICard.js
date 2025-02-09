import { Tooltip, Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const tooltipContent = {
  efficiency: `
    Efficiency Score (70%):
    - Annual Improvement: World Bank indicator progress
    - Investment Efficiency: Projects per year vs. Investment
    - Normalized to 0-100 scale
    
    Example: If Internet usage increased from 12.1% to 35.2%
    and 3 projects were implemented over 2 years with optimal 
    investment distribution, efficiency score would be 30%
  `,
  synergy: `
    Synergy Score (20%):
    - Cross-sector investment balance
    - Optimal distribution: 33.3% per sector
    - Score reduces based on deviation
    
    Example: A 40%-30%-30% distribution across sectors
    would result in a 90% synergy score due to 
    relatively balanced allocation
  `,
  sustainability: `
    Sustainability Score (10%):
    - Environmental (30%): Trend stability
    - Social (40%): Institutional capacity
    - Economic (30%): Self-sustaining potential
    
    Example: Strong institutional frameworks and 
    stable improvement trends can result in 
    scores exceeding 100% for long-term impact
  `,
  overallROI: `
    Overall ROI Calculation Examples (Sri Lanka):

    1. Digital Education ROI = 63.3%
    - High efficiency in digital infrastructure improvement
    - Balanced investment distribution
    - Strong institutional sustainability

    2. Basic Education ROI = 10.1%
    - Limited room for improvement in already high baseline
    - Lower investment proportion
    - Focus on system maintenance

    3. Higher Education ROI = 1.3%
    - Minimal improvement in tertiary indicators
    - Limited cross-sector integration
    - Low institutional sustainability

    Formula: (Efficiency × 0.7) + (Synergy × 0.2) + (Sustainability × 0.1)
  `
};

// Korean version for reference
const tooltipContentKo = {
  efficiency: `
    효율성 점수 (70%):
    - 연간 개선율: World Bank 지표 진척도
    - 투자 효율성: 연간 프로젝트 수 대비 투자금액
    - 0-100점으로 정규화
    
    예시: 인터넷 사용률이 12.1%에서 35.2%로 증가하고
    2년간 3개 프로젝트가 최적 투자 분배로 실행된 경우
    효율성 점수는 30%
  `,
  synergy: `
    시너지 점수 (20%):
    - 섹터간 투자 균형도
    - 이상적 분배: 각 섹터 33.3%
    - 편차에 따른 감점
  `,
  sustainability: `
    지속가능성 점수 (10%):
    - 환경적 지속성: 지표 개선 추세
    - 사회적 지속성: 제도적 역량
    - 경제적 지속성: 자립 가능성
  `,
  overallROI: `
    종합 ROI 계산:
    (효율성 × 0.7) + (시너지 × 0.2) + (지속가능성 × 0.1)
    
    예시) 스리랑카 디지털교육:
    (30% × 0.7) + (100% × 0.2) + (223% × 0.1) = 63.3%
  `
};

const ROIBar = ({ efficiency, synergy, sustainability }) => {
  // 각 점수의 기여도 계산
  const efficiencyContribution = efficiency * 0.7;
  const synergyContribution = synergy * 0.2;
  const sustainabilityContribution = sustainability * 0.1;

  return (
    <Box sx={{ width: '100%', height: 24, display: 'flex', borderRadius: 1, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          width: `${efficiencyContribution}%`,
          bgcolor: '#2196f3',  // 파란색
          height: '100%',
          transition: 'width 0.5s ease-in-out'
        }} 
      />
      <Box 
        sx={{ 
          width: `${synergyContribution}%`,
          bgcolor: '#4caf50',  // 초록색
          height: '100%',
          transition: 'width 0.5s ease-in-out'
        }} 
      />
      <Box 
        sx={{ 
          width: `${sustainabilityContribution}%`,
          bgcolor: '#ff9800',  // 주황색
          height: '100%',
          transition: 'width 0.5s ease-in-out'
        }} 
      />
    </Box>
  );
};

const ROIMetric = ({ label, value, tooltip }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography>{label}</Typography>
    <Typography color="primary" variant="h6">{value}%</Typography>
    <Tooltip title={tooltip} placement="top">
      <InfoIcon fontSize="small" color="action" />
    </Tooltip>
  </Box>
);

const getROIStatus = (roi) => {
  if (roi >= 50) return { text: 'Exceptional ROI', color: '#4caf50' };
  if (roi >= 30) return { text: 'Good ROI', color: '#2196f3' };
  return { text: 'Moderate ROI', color: '#ff9800' };
};

const ROICard = ({ sector, data }) => {
  const { efficiency, synergy, sustainability } = data;
  const overallROI = (efficiency * 0.7) + (synergy * 0.2) + (sustainability * 0.1);

  const status = getROIStatus(overallROI);

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>ROI Analysis</Typography>
      
      {/* Metrics with tooltips */}
      <Box sx={{ mb: 2 }}>
        <ROIMetric 
          label="Efficiency" 
          value={efficiency.toFixed(1)} 
          tooltip={tooltipContent.efficiency} 
        />
        <ROIMetric 
          label="Synergy" 
          value={synergy.toFixed(1)} 
          tooltip={tooltipContent.synergy} 
        />
        <ROIMetric 
          label="Sustainability" 
          value={sustainability.toFixed(1)} 
          tooltip={tooltipContent.sustainability} 
        />
      </Box>

      {/* Overall ROI with stacked bar */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography>Overall ROI:</Typography>
          <Typography variant="h6" color="primary">
            {overallROI.toFixed(1)}%
          </Typography>
          <Tooltip title={tooltipContent.overallROI} placement="top">
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>
        
        <ROIBar 
          efficiency={efficiency}
          synergy={synergy}
          sustainability={sustainability}
        />
        
        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#2196f3' }}>■ Efficiency</Typography>
          <Typography variant="caption" sx={{ color: '#4caf50' }}>■ Synergy</Typography>
          <Typography variant="caption" sx={{ color: '#ff9800' }}>■ Sustainability</Typography>
        </Box>

        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: status.color,
            mt: 1 
          }}
        >
          {status.text}
        </Typography>
      </Box>
    </Box>
  );
};

export default ROICard; 