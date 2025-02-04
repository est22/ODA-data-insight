const axios = require('axios');

const DIGITAL_INDICATORS = {
    internet: 'IT.NET.USER.ZS',    // internet usage rate
    mobile: 'IT.CEL.SETS.P2',      // mobile penetration rate
    tech_exports: 'TX.VAL.TECH.MF.ZS'  // technology exports share
};

// World Bank API service
class WorldBankService {
    constructor() {
        this.baseUrl = 'http://api.worldbank.org/v2';
    }

    // get digital data
    async getDigitalData(country, indicator, year) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/country/${country}/indicator/${indicator}`, {
                    params: {
                        date: year,
                        format: 'json'
                    }
                }
            );
            return response.data[1]?.[0]?.value || null;
        } catch (error) {
            console.error(`Error fetching World Bank data: ${error.message}`);
            throw error;
        }
    }

    // get country digital profile
    async getCountryDigitalProfile(country, year) {
        try {
            const results = {};
            for (const [key, indicator] of Object.entries(DIGITAL_INDICATORS)) {
                results[key] = await this.getDigitalData(country, indicator, year);
            }
            return results;
        } catch (error) {
            console.error(`Error fetching digital profile: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new WorldBankService(); 