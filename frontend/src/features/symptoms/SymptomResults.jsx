import React from "react";
import { FiBarChart2, FiAlertTriangle, FiClock, FiSearch, FiCalendar, FiDownload } from "react-icons/fi";
import { MdMedicalServices, MdLocalHospital, MdInfo } from "react-icons/md";
import "./SymptomResults.css";

export default function SymptomResults({ result }) {
  if (!result) return null;

  const urgency = result?.analysis?.urgency || result?.urgency;
  const suggested = result?.analysis?.suggestedSpecialities || result?.suggestedSpecialities || [];
  const possibleCauses = result?.analysis?.possible_causes || result?.possible_causes || [];
  const disclaimer = result?.analysis?.disclaimer || result?.disclaimer;
  const emergency = Boolean(result?.analysis?.emergency || result?.emergency || result?.analysis?.emergencyOverride);

  const getUrgencyColor = (level) => {
    if (!level) return "neutral";
    const lower = level.toLowerCase();
    if (lower.includes("emergency") || lower.includes("critical") || lower.includes("severe")) return "emergency";
    if (lower.includes("urgent") || lower.includes("high")) return "urgent";
    if (lower.includes("moderate")) return "moderate";
    return "mild";
  };

  const urgencyLevel = getUrgencyColor(urgency);

  return (
    <div className="results-container">
      <div className={`results-card results-card--${urgencyLevel}`}>
        <div className="results-header">
          <div className="results-header-content">
            <h2 className="results-title"><FiBarChart2 size={24} aria-hidden /> Analysis Results</h2>
            <p className="results-subtitle">Based on your symptoms and medical history</p>
          </div>
        </div>

        {emergency && (
          <div className="results-emergency-banner">
            <span className="emergency-icon" aria-hidden><FiAlertTriangle size={24} /></span>
            <span className="emergency-text">This requires immediate medical attention. Please seek emergency care.</span>
          </div>
        )}

        <div className="results-content">
          {/* Urgency Section */}
          <div className="results-section results-urgency">
            <div className="section-header">
              <h3 className="section-title"><FiClock size={20} aria-hidden /> Urgency Level</h3>
            </div>
            <div className={`urgency-badge urgency-badge--${urgencyLevel}`}>
              <span className="urgency-label">{urgency || "Unknown"}</span>
              {emergency && <span className="urgency-tag">Emergency</span>}
            </div>
          </div>

          {/* Possible Causes Section */}
          {Array.isArray(possibleCauses) && possibleCauses.length > 0 && (
            <div className="results-section">
              <div className="section-header">
                <h3 className="section-title"><FiSearch size={20} aria-hidden /> Possible Causes</h3>
                <p className="section-subtitle">{possibleCauses.length} condition(s) identified</p>
              </div>
              <div className="causes-list">
                {possibleCauses.map((cause, idx) => (
                  <div key={`${cause}-${idx}`} className="cause-item">
                    <div className="cause-number">{idx + 1}</div>
                    <div className="cause-content">
                      <p className="cause-text">{cause}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Specialties Section */}
          {Array.isArray(suggested) && suggested.length > 0 && (
            <div className="results-section">
              <div className="section-header">
                <h3 className="section-title"><MdMedicalServices size={20} aria-hidden /> Recommended Specialists</h3>
                <p className="section-subtitle">Specialists who can help</p>
              </div>
              <div className="specialists-grid">
                {suggested.map((specialist, idx) => (
                  <div key={`${specialist}-${idx}`} className="specialist-card">
                    <div className="specialist-icon" aria-hidden><MdLocalHospital size={24} /></div>
                    <div className="specialist-name">{specialist}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer Section */}
          {disclaimer && (
            <div className="results-section results-disclaimer-section">
              <div className="disclaimer-banner">
                <span className="disclaimer-icon" aria-hidden><MdInfo size={20} /></span>
                <div className="disclaimer-content">
                  <p className="disclaimer-title">Important Disclaimer</p>
                  <p className="disclaimer-text">{disclaimer}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="results-actions">
            <button className="action-btn action-btn--primary">
              <FiCalendar size={18} aria-hidden /> Book an Appointment
            </button>
            <button className="action-btn action-btn--secondary">
              <FiDownload size={18} aria-hidden /> Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

