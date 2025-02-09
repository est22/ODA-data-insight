import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';  // use react-query for caching

const CountryAnalysis = ({ countryCode, onClose }) => {
    const { data: efficiencyData, isLoading: efficiencyLoading } = useQuery(
        ['efficiency', countryCode],
        () => fetch(`/analysis/efficiency`).then(res => res.json()),
        { enabled: !!countryCode }
    );

    const { data: synergyData, isLoading: synergyLoading } = useQuery(
        ['synergy', countryCode],
        () => fetch(`/analysis/synergy`).then(res => res.json()),
        { enabled: !!countryCode }
    );

    const { data: sustainabilityData, isLoading: sustainabilityLoading } = useQuery(
        ['sustainability', countryCode],
        () => fetch(`/analysis/sustainability`).then(res => res.json()),
        { enabled: !!countryCode }
    );

    if (efficiencyLoading || synergyLoading || sustainabilityLoading) {
        return <div>Loading analysis...</div>;
    }

    return (
        <div className="country-analysis-overlay">
            <div className="analysis-content">
                {/* efficiency analysis chart */}
                {efficiencyData && (
                    <div className="analysis-section">
                        <h3>Investment Efficiency</h3>
                        {/* efficiency chart component */}
                    </div>
                )}

                {/* synergy analysis chart */}
                {synergyData && (
                    <div className="analysis-section">
                        <h3>Education Synergy</h3>
                        {/* synergy chart component */}
                    </div>
                )}

                {/* sustainability analysis chart */}
                {sustainabilityData && (
                    <div className="analysis-section">
                        <h3>Project Sustainability</h3>
                        {/* sustainability chart component */}
                    </div>
                )}

                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default CountryAnalysis; 