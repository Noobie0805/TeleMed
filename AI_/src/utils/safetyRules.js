const applySafetyRules = (analysis = {}) => {
    const emergencyKeywords = [
        "chest pain",
        "cannot breathe",
        "shortness of breath",
        "suicidal",
        "seizure",
        "unconscious",
        "severe bleeding",
        "stroke",
        "heart attack"
    ];

    const textToScan = [
        ...(analysis.possible_causes || []),
        ...(analysis.specialities || [])
    ]
        .join(" ")
        .toLowerCase();

    const isEmergency = emergencyKeywords.some(keyword =>
        textToScan.includes(keyword)
    );

    if (isEmergency) {
        return {
            urgency: "severe",
            specialities: ["Emergency Medicine"],
            possible_causes: [
                "Symptoms may indicate a medical emergency"
            ],
            emergencyOverride: true
        };
    }

    // Normalize safe output
    return {
        urgency: ["mild", "moderate", "severe"].includes(analysis.urgency)
            ? analysis.urgency
            : "mild",

        specialities: Array.isArray(analysis.specialities)
            ? analysis.specialities.slice(0, 3)
            : [],

        possible_causes: Array.isArray(analysis.possible_causes)
            ? analysis.possible_causes
            : [],

        emergencyOverride: false
    };
};

export { applySafetyRules };
