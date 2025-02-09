const { db } = require('../models/model');


const COUNTRY_ISO_MAPPING = {
    'Afghanistan': 'AFG',
    'Algeria': 'DZA',
    'Angola': 'AGO',
    'Azerbaijan': 'AZE',
    'Bangladesh': 'BGD',
    'Benin': 'BEN',
    'Bhutan': 'BTN',
    'Bolivia': 'BOL',
    'Burkina Faso': 'BFA',
    'Burundi': 'BDI',
    'Cambodia': 'KHM',
    'Cameroon': 'CMR',
    'Colombia': 'COL',
    'Comoros': 'COM',
    'Congo': 'COG',
    'Costa Rica': 'CRI',
    "Côte d'Ivoire": 'CIV',
    'Dominican Republic': 'DOM',
    'Ecuador': 'ECU',
    'Egypt': 'EGY',
    'El Salvador': 'SLV',
    'Ethiopia': 'ETH',
    'Ghana': 'GHA',
    'Guatemala': 'GTM',
    'Guinea': 'GIN',
    'Haiti': 'HTI',
    'Honduras': 'HND',
    'India': 'IND',
    'Indonesia': 'IDN',
    'Iraq': 'IRQ',
    'Jordan': 'JOR',
    'Kenya': 'KEN',
    'Kyrgyzstan': 'KGZ',
    'Laos': 'LAO',
    'Lebanon': 'LBN',
    'Liberia': 'LBR',
    'Libya': 'LBY',
    'Madagascar': 'MDG',
    'Malawi': 'MWI',
    'Malaysia': 'MYS',
    'Mali': 'MLI',
    'Mauritania': 'MRT',
    'Mexico': 'MEX',
    'Moldova': 'MDA',
    'Mongolia': 'MNG',
    'Morocco': 'MAR',
    'Mozambique': 'MOZ',
    'Myanmar': 'MMR',
    'Nepal': 'NPL',
    'Nicaragua': 'NIC',
    'Niger': 'NER',
    'Nigeria': 'NGA',
    'Pakistan': 'PAK',
    'Palestine': 'PSE',
    'Panama': 'PAN',
    'Papua New Guinea': 'PNG',
    'Paraguay': 'PRY',
    'Peru': 'PER',
    'Philippines': 'PHL',
    'Rwanda': 'RWA',
    'Senegal': 'SEN',
    'Sierra Leone': 'SLE',
    'Somalia': 'SOM',
    'South Sudan': 'SSD',
    'Sri Lanka': 'LKA',
    'Sudan': 'SDN',
    'Syria': 'SYR',
    'Tajikistan': 'TJK',
    'Tanzania': 'TZA',
    'Thailand': 'THA',
    'Timor-Leste': 'TLS',
    'Togo': 'TGO',
    'Tunisia': 'TUN',
    'Turkey': 'TUR',
    'Uganda': 'UGA',
    'Ukraine': 'UKR',
    'Uzbekistan': 'UZB',
    'Venezuela': 'VEN',
    'Vietnam': 'VNM',
    'Yemen': 'YEM',
    'Zambia': 'ZMB',
    'Zimbabwe': 'ZWE',
    'Viet Nam': 'VNM',
    'Korea': 'KOR',
    'Lao PDR': 'LAO',
    'Russian Federation': 'RUS',
    'Slovak Republic': 'SVK',
    'United States': 'USA',
    'Other regions or multiple countries (unassigned)': null
};

// normalize country name function
function normalizeCountryName(country) {
    const normalizations = {
        'Vietnam': 'Viet Nam',
        'Laos': 'Lao PDR',
        'Burma': 'Myanmar',
        
    };
    return normalizations[country] || country;
}

function getCountryIsoCode(country) {
    const normalizedName = normalizeCountryName(country);
    return COUNTRY_ISO_MAPPING[normalizedName];
}

module.exports = {
    COUNTRY_ISO_MAPPING,
    getCountryIsoCode
}; 