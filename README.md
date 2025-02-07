# ODA  data Analysis on Education

## 1. Project Overview

This project is a full-stack application designed to provide sophisticated analysis of educational development projects, focusing on investment efficiency, synergistic effects, and sustainability of educational initiatives across different countries.




## Table of Contents
- [ODA  data Analysis on Education](#oda--data-analysis-on-education)
  - [1. Project Overview](#1-project-overview)
  - [Table of Contents](#table-of-contents)
  - [2. Setup Instructions](#2-setup-instructions)
  - [3. API Documentation](#3-api-documentation)
    - [Base URL](#base-url)
    - [Endpoints](#endpoints)
      - [A. Investment Efficiency Analysis](#a-investment-efficiency-analysis)
      - [B. Synergy Analysis](#b-synergy-analysis)
      - [C. Sustainability Analysis](#c-sustainability-analysis)
  - [4. Analysis Methodology](#4-analysis-methodology)
    - [1. Data Collection](#1-data-collection)
    - [2. Data Cleaning and Integration](#2-data-cleaning-and-integration)
    - [A. Investment Efficiency Analysis](#a-investment-efficiency-analysis-1)
    - [B. Synergy Analysis](#b-synergy-analysis-1)
    - [C. Sustainability Analysis](#c-sustainability-analysis-1)
  - [5. Dataset Choice Justification](#5-dataset-choice-justification)
    - [📊 Primary Dataset: KOICA SDG Performance Indicators](#-primary-dataset-koica-sdg-performance-indicators)
    - [📊 Secondary Dataset: World Bank Development Indicators](#-secondary-dataset-world-bank-development-indicators)
      - [Basic Education Metrics](#basic-education-metrics)
      - [Digital Education Metrics](#digital-education-metrics)
      - [Higher Education Metrics](#higher-education-metrics)
    - [⚡️ Integration and Synergy](#️-integration-and-synergy)
  - [Acknowledgments](#acknowledgments)
  - [Final Thoughts](#final-thoughts)







## 2. Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/est22/ODA-data-insight.git
   cd ODA-data-insight
   ```

2. **(Backend) Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **(Frontend) Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **(Backend) Run the BE server:**
   ```bash
   cd ../server
   nodemon app.js
   ```


   The following logs, specifically **the successful loading of World Bank data**, must be confirmed before proceeding to the next step.

   ```bash
   Education data loaded successfully

   Initializing World Bank Data...

   Server running on port 8000
   basic_education      |████████████████████████████████████████| 100% || Loading: UIS.LR.AG25T64
   digital_education    |████████████████████████████████████████| 100% || Loading: IP.JRN.ARTC.SC
   higher_education     |████████████████████████████████████████| 100% || Loading: SL.UEM.BASC.ZS

   World Bank data loaded successfully!
   ```

5. **(Frontend) After downloading the World Bank data, Run the client:**
****
   ```bash
   cd ../client
   npm start
   ```

   Implementation Done!


## 3. API Documentation

### Base URL
```html
http://localhost:8000/analysis
```

### Endpoints

#### A. Investment Efficiency Analysis
```http
GET /efficiency
```

**Description**  
Analyzes the effectiveness of education investments by measuring improvement rates against investment amounts.

**Response Format**
```json
{
    "success": true,
    "message": "Analysis of investment efficiency in education projects",
    "data": [
        {
            "country": "string",
            "category": "string",
            "total_investment": "number",
            "project_count": "number",
            "avg_improvement": "number",
            "investment_per_improvement": "number",
            "indicators": {
                "indicator_code": {
                    "name": "string",
                    "improvement_rate": "number"
                }
            }
        }
    ],
    "metadata": {
        "description": "투자 대비 교육 지표 개선율 분석",
        "metrics": {
            "avg_improvement": "전체 지표의 평균 개선율 (%)",
            "investment_per_improvement": "1% 개선당 필요한 투자금액 (USD)",
            "indicators": "각 지표별 세부 개선율"
        }
    }
}
```

#### B. Synergy Analysis
```http
GET /synergy
```

**Description**  
Examines the interrelationships between different education categories and their combined effects.

**Response Format**
```json
{
    "success": true,
    "message": "Analysis of synergistic effects between education categories",
    "data": [
        {
            "country": "string",
            "investment_distribution": "object",
            "basic_edu_score": "number",
            "digital_edu_score": "number",
            "higher_edu_score": "number"
        }
    ],
    "metadata": {
        "description": "교육 분야 간 시너지 효과 분석",
        "metrics": {
            "investment_distribution": "각 분야별 투자 분포",
            "basic_edu_score": "기초교육 성과 점수",
            "digital_edu_score": "디지털교육 성과 점수",
            "higher_edu_score": "고등교육 성과 점수"
        }
    }
}
```

#### C. Sustainability Analysis
```http
GET /sustainability
```

**Description**  
Evaluates the long-term impact and sustainability of education projects after completion.

**Response Format**
```json
{
    "success": true,
    "message": "Analysis of long-term sustainability of education projects",
    "data": [
        {
            "country": "string",
            "category": "string",
            "active_years": "number",
            "avg_yearly_investment": "number",
            "indicators": {
                "indicator_code": {
                    "name": "string",
                    "total_change": "number",
                    "yearly_change": "number",
                    "sustainability_score": "number"
                }
            }
        }
    ],
    "metadata": {
        "description": "교육 프로젝트의 지속가능성 분석",
        "metrics": {
            "active_years": "프로젝트 활동 기간",
            "avg_yearly_investment": "연평균 투자액",
            "indicators": {
                "total_change": "전체 변화량",
                "yearly_change": "연간 변화율",
                "sustainability_score": "지속가능성 점수"
            }
        }
    }
}
```


## 4. Analysis Methodology
### 1. Data Collection  
Education data was collected from [World Bank](https://databank.worldbank.org/source/education-statistics-%5e-all-indicators#) API, ensuring a globally recognized, standardized dataset. [KOICA’s SDG Performance Indicators](https://www.data.go.kr/data/15105461/fileData.do) dataset was also utilized to capture project-specific (education) investment details as in `server/data/한국국제협력단_SDG 분야별 성과지표_20230901.csv`.

### 2. Data Cleaning and Integration  
- Standardized country names and time periods across datasets
- Aligned KOICA’s education initiatives with corresponding World Bank indicators
- Merged investment and outcome datasets to facilitate comparative and correlation analyses

### A. Investment Efficiency Analysis  
- Calculated year-over-year improvement rates for each education indicator 
- Measured investment effectiveness through improvement-to-cost ratios
- Identified the most cost-effective interventions across different education categories  

### B. Synergy Analysis  
- Evaluated cross-category investment distributions  
- Analyzed correlations between different educational outcomes  
- Assessed the impact of **balanced vs. focused** investment strategies  

### C. Sustainability Analysis  
- Tracked post-project educational outcome sustainability  
- Measured the long-term effectiveness of educational interventions  
- Evaluated self-sustaining development potential in recipient countries 


## 5. Dataset Choice Justification  

In the landscape of international development cooperation, education emerges as a particularly compelling focus area, supported by comprehensive data sources and well-defined performance metrics. Our dataset selection was strategically guided by two primary sources that offer complementary perspectives on educational development initiatives.  

### 📊 Primary Dataset: KOICA SDG Performance Indicators  

The first cornerstone of our analysis is derived from KOICA's **SDG Performance Indicators** (original source from https://www.data.go.kr/data/15105461/fileData.do as in `server/data/한국국제협력단_SDG 분야별 성과지표_20230901.csv`). This dataset provides a **strategic classification** of educational initiatives into three core categories:  

1. **Quality Education for Learning Outcomes**  
2. **Digital Education for Future Competency Development**  
3. **Vocational and Higher Education for Human Resource Development**  

This tripartite framework aligns seamlessly with **global SDG standards** and **contemporary educational needs**, making it an invaluable foundation for our study.  

### 📊 Secondary Dataset: World Bank Development Indicators 

To complement KOICA’s **project-specific** data, I carefully curated a set of **World Bank indicators (2015–2023)** that correspond to each strategic objective. The selection ensures alignment with **global development frameworks**, capturing both **de facto outcomes** (real-world impact) and **de jure institutional frameworks** (policy-level readiness).  


#### Basic Education Metrics
```plaintext
- SE.PRM.CMPT.ZS     // Primary completion rate (% of relevant age group) - De Facto
- SE.PRM.ENRR        // School enrollment, primary (% gross) - De Facto
- SE.PRM.TENR        // Trained teachers in primary education (% of total teachers) - De Jure
- SE.XPD.PRIM.PC.ZS  // Government expenditure per student, primary (% of GDP per capita) - De Jure
- SE.PRM.PRSL.ZS     // Persistence to last grade of primary (% of cohort) - De Facto
- SE.SEC.CMPT.LO.ZS  // Lower secondary completion rate (% of relevant age group) - De Facto
- SE.PRM.TCAQ.ZS     // Qualified teachers in primary education (% of total teachers) - De Jure
- UIS.LR.AG25T64     // Literacy rate, population 25-64 years (%) - De Facto
```
#### Digital Education Metrics
```markdown
- IT.NET.USER.ZS     // Individuals using the Internet (% of population) - De Facto
- IT.CEL.SETS.P2     // Mobile cellular subscriptions (per 100 people) - De Facto
- IT.NET.BBND.P2     // Fixed broadband subscriptions (per 100 people) - De Facto
- IT.NET.SECR.P6     // Secure Internet servers (per 1 million people) - De Facto
- GB.XPD.RSDV.GD.ZS  // Research and development expenditure (% of GDP) - De Jure
- IP.JRN.ARTC.SC     // Scientific and technical journal articles - De Facto
```

#### Higher Education Metrics
```markdown
- SE.TER.ENRR        // School enrollment, tertiary (% gross) - De Facto
- SL.UEM.ADVN.ZS     // Unemployment with advanced education - De Facto
- SE.XPD.TERT.PC.ZS  // Government expenditure per student, tertiary (% of GDP per capita) - De Jure
- SE.TER.CUAT.BA.ZS  // Educational attainment, Bachelor's or equivalent (% of population 25+) - De Facto
- SE.TER.CUAT.MS.ZS  // Educational attainment, Master's or equivalent (% of population 25+) - De Facto
- SL.UEM.BASC.ZS     // Unemployment with basic education (% of total labor force) - De Facto
```


### ⚡️ Integration and Synergy
The integration of these datasets creates a unique analytical framework that bridges the gap between development inputs (KOICA's project investments) and outcomes (World Bank indicators). This combination allows for:

1. Direct correlation analysis between investment and impact
2. Cross-country comparative studies within recipient nations
3. Longitudinal tracking of educational development trajectories
4. Multi-dimensional assessment of project effectiveness

The careful selection of both 'De facto' and 'De jure' indicators ensures a balanced view of both actual outcomes and institutional capacity development, providing a comprehensive picture of educational progress in recipient countries.

This thoughtfully constructed dataset enables sophisticated analysis of educational development initiatives, supporting evidence-based decision-making in international development cooperation.

## Acknowledgments  
This analysis was made possible through high-quality data provided by **KOICA**, **OECD**, and the **World Bank**. Their commitment to transparent and accessible data plays a crucial role in advancing global education development efforts.  

I extend my appreciation to these organizations for their contributions to evidence-based policymaking and sustainable development.  


## Final Thoughts
 Hope this analysis contributes valuable insights to global education development efforts. Thank you for your interest!
