import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBarChart2,
  FiAlertTriangle,
  FiClock,
  FiSearch,
  FiCalendar,
  FiDownload,
} from "react-icons/fi";
import { MdMedicalServices, MdLocalHospital, MdInfo } from "react-icons/md";
import api from "../../services/api";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import "./SymptomResults.css";

export default function SymptomResults({ result }) {
  const [showBookFlow, setShowBookFlow] = useState(false);
  const [referredDoctors, setReferredDoctors] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState("");
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(null);
  const [scheduleError, setScheduleError] = useState("");

  if (!result) return null;

  const sessionId = result?.sessionId;
  const urgency = result?.analysis?.urgency || result?.urgency;
  const suggested = result?.analysis?.suggestedSpecialities || result?.suggestedSpecialities || [];
  const possibleCauses = result?.analysis?.possible_causes || result?.possible_causes || [];
  const disclaimer = result?.analysis?.disclaimer || result?.disclaimer;
  const emergency = Boolean(
    result?.analysis?.emergency || result?.emergency || result?.analysis?.emergencyOverride
  );

  const getUrgencyColor = (level) => {
    if (!level) return "neutral";
    const lower = level.toLowerCase();
    if (lower.includes("emergency") || lower.includes("critical") || lower.includes("severe"))
      return "emergency";
    if (lower.includes("urgent") || lower.includes("high")) return "urgent";
    if (lower.includes("moderate")) return "moderate";
    return "mild";
  };

  const urgencyLevel = getUrgencyColor(urgency);

  const fetchDoctorReferrals = async () => {
    if (!suggested?.length) {
      setReferralsError("No specialties to match. Try checking symptoms again.");
      return;
    }
    setShowBookFlow(true);
    setReferralsError("");
    setReferralsLoading(true);
    setReferredDoctors([]);
    try {
      const specialtiesParam = suggested.map((s) => encodeURIComponent(s)).join(",");
      const urgencyParam = urgency ? `&urgency=${encodeURIComponent(urgency)}` : "";
      const { data } = await api.get(
        `/ai/doctorReferrals?specialties=${specialtiesParam}${urgencyParam}`
      );
      const payload = data?.data || {};
      setReferredDoctors(Array.isArray(payload.doctors) ? payload.doctors : []);
      if (payload.doctors?.length) setBookingDoctorId(payload.doctors[0]._id || "");
    } catch (err) {
      setReferralsError(err?.response?.data?.message || "Failed to load recommended doctors");
    } finally {
      setReferralsLoading(false);
    }
  };

  const submitScheduleFromReferral = async (e) => {
    e.preventDefault();
    if (!sessionId || !bookingDoctorId || !preferredDate || !startTime) {
      setScheduleError("Please select a doctor, date, and time.");
      return;
    }
    setScheduleError("");
    setScheduleSubmitting(true);
    setScheduleSuccess(null);
    try {
      const { data } = await api.post("/ai/schedule", {
        doctorId: bookingDoctorId,
        symptomSessionId: sessionId,
        preferredDate: preferredDate.replace(/\//g, "-"),
        startTime: startTime.length === 5 ? startTime : `${startTime}:00`,
      });
      setScheduleSuccess(data?.data || {});
    } catch (err) {
      setScheduleError(err?.response?.data?.message || "Failed to book appointment");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const minDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const timeSlots = [];
  for (let h = 9; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeSlots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  return (
    <div className="results-container">
      <div className={`results-card results-card--${urgencyLevel}`}>
        <div className="results-header">
          <div className="results-header-content">
            <h2 className="results-title">
              <FiBarChart2 size={24} aria-hidden /> Analysis Results
            </h2>
            <p className="results-subtitle">Based on your symptoms and medical history</p>
          </div>
        </div>

        {emergency && (
          <div className="results-emergency-banner">
            <span className="emergency-icon" aria-hidden>
              <FiAlertTriangle size={24} />
            </span>
            <span className="emergency-text">
              This requires immediate medical attention. Please seek emergency care.
            </span>
          </div>
        )}

        <div className="results-content">
          <div className="results-section results-urgency">
            <div className="section-header">
              <h3 className="section-title">
                <FiClock size={20} aria-hidden /> Urgency Level
              </h3>
            </div>
            <div className={`urgency-badge urgency-badge--${urgencyLevel}`}>
              <span className="urgency-label">{urgency || "Unknown"}</span>
              {emergency && <span className="urgency-tag">Emergency</span>}
            </div>
          </div>

          {Array.isArray(possibleCauses) && possibleCauses.length > 0 && (
            <div className="results-section">
              <div className="section-header">
                <h3 className="section-title">
                  <FiSearch size={20} aria-hidden /> Possible Causes
                </h3>
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

          {Array.isArray(suggested) && suggested.length > 0 && (
            <div className="results-section">
              <div className="section-header">
                <h3 className="section-title">
                  <MdMedicalServices size={20} aria-hidden /> Recommended Specialists
                </h3>
                <p className="section-subtitle">Specialists who can help</p>
              </div>
              <div className="specialists-grid">
                {suggested.map((specialist, idx) => (
                  <div key={`${specialist}-${idx}`} className="specialist-card">
                    <div className="specialist-icon" aria-hidden>
                      <MdLocalHospital size={24} />
                    </div>
                    <div className="specialist-name">{specialist}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {disclaimer && (
            <div className="results-section results-disclaimer-section">
              <div className="disclaimer-banner">
                <span className="disclaimer-icon" aria-hidden>
                  <MdInfo size={20} />
                </span>
                <div className="disclaimer-content">
                  <p className="disclaimer-title">Important Disclaimer</p>
                  <p className="disclaimer-text">{disclaimer}</p>
                </div>
              </div>
            </div>
          )}

          <div className="results-actions">
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={fetchDoctorReferrals}
              disabled={!sessionId || suggested?.length === 0}
            >
              <FiCalendar size={18} aria-hidden /> Book an Appointment
            </button>
            <button
              type="button"
              className="action-btn action-btn--secondary"
              onClick={() => window.print()}
            >
              <FiDownload size={18} aria-hidden /> Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Book from referral panel */}
      {showBookFlow && (
        <div className="results-book-panel">
          <h3 className="results-book-panel__title">
            <FiCalendar size={20} aria-hidden /> Book with a recommended doctor
          </h3>
          {referralsLoading ? (
            <LoadingSpinner text="Finding doctors..." />
          ) : referralsError ? (
            <p className="error">{referralsError}</p>
          ) : scheduleSuccess ? (
            <div className="results-book-success">
              <p>Appointment booked successfully.</p>
              <Link to="/appointments" className="action-btn action-btn--primary">
                View my appointments
              </Link>
            </div>
          ) : (
            <>
              {referredDoctors.length === 0 ? (
                <p className="results-book-panel__empty">
                  No doctors available for these specialties right now. You can still{" "}
                  <Link to="/doctors">browse all doctors</Link> to book.
                </p>
              ) : (
                <form onSubmit={submitScheduleFromReferral} className="results-book-form">
                  <label className="results-book-form__label">
                    <span>Choose doctor</span>
                    <select
                      value={bookingDoctorId}
                      onChange={(e) => setBookingDoctorId(e.target.value)}
                      className="results-book-form__select"
                      required
                    >
                      {referredDoctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc?.profile?.name || "Doctor"} – {doc?.profile?.specialty || "General"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="results-book-form__label">
                    <span>Preferred date</span>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={minDate()}
                      className="results-book-form__input"
                      required
                    />
                  </label>
                  <label className="results-book-form__label">
                    <span>Preferred time</span>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="results-book-form__select"
                    >
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                  {scheduleError && <p className="error">{scheduleError}</p>}
                  <div className="results-book-form__actions">
                    <button
                      type="button"
                      className="action-btn action-btn--secondary"
                      onClick={() => setShowBookFlow(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={scheduleSubmitting}
                      className="action-btn action-btn--primary"
                    >
                      {scheduleSubmitting ? "Booking..." : "Confirm booking"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
