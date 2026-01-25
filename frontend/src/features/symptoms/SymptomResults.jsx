import React from "react";

export default function SymptomResults({ result }) {
  if (!result) return null;

  const urgency = result?.analysis?.urgency || result?.urgency;
  const suggested = result?.analysis?.suggestedSpecialities || result?.suggestedSpecialities || [];
  const possibleCauses = result?.analysis?.possible_causes || result?.possible_causes || [];
  const disclaimer = result?.analysis?.disclaimer || result?.disclaimer;
  const emergency = Boolean(result?.analysis?.emergency || result?.emergency || result?.analysis?.emergencyOverride);

  return (
    <div className="result">
      <h3>Result</h3>

      <div style={{ marginBottom: 8 }}>
        <strong>Urgency:</strong> {urgency || "unknown"} {emergency ? "(emergency)" : ""}
      </div>

      {Array.isArray(suggested) && suggested.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <strong>Suggested specialties:</strong>
          <ul>
            {suggested.map((s, i) => (
              <li key={`${s}-${i}`}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(possibleCauses) && possibleCauses.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <strong>Possible causes:</strong>
          <ul>
            {possibleCauses.map((c, i) => (
              <li key={`${c}-${i}`}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {disclaimer && <p className="disclaimer">{disclaimer}</p>}
    </div>
  );
}

