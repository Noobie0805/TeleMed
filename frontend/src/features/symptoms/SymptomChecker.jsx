import React, { useState } from "react";
import api from "../../services/api";
import "./SymptomChecker.css";
import SymptomResults from "./SymptomResults";
import PageHeader from "../../components/layout/PageHeader";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import Chat from "../ai/Chat";
import { BiSolidError } from "react-icons/bi";


const SymptomChecker = () => {
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("male");
  const [duration, setDuration] = useState("");
  const [existingConditions, setExistingConditions] = useState("");
  const [symptoms, setSymptoms] = useState([{ name: "", severity: 1 }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSymptom = () =>
    setSymptoms([...symptoms, { name: "", severity: 1 }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/ai/symptomChecker", {
        age: Number(age),
        gender,
        symptoms: symptoms.filter((s) => s.name?.trim()),
        duration: duration || undefined,
        existingConditions: existingConditions || undefined,
      });

      // Backend wraps payload under ApiResponse.data
      setResult(data?.data || null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err?.response?.data?.message || "Symptom check failed");
    }
    setLoading(false);
  };

  return (
    <div className="symptom-page">
      <PageHeader
        title="AI symptom checker"
        subtitle="Describe your symptoms to get quick, AI-powered insights."
      />

      <section className="symptom-chat-section">
        <h3 className="symptom-section-title">Chat with AI Assistant</h3>
        <div className="symptom-chat-wrapper">
          <Chat />
        </div>
      </section>

      <div className="symptom-layout">
        <section className="symptom-form-card">
          <h3 className="symptom-section-title">Tell us your symptoms</h3>

          <form onSubmit={handleSubmit} className="symptom-form">
            <div className="symptom-row">
              <label className="symptom-field">
                <span className="symptom-label">Age</span>
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </label>
              <label className="symptom-field">
                <span className="symptom-label">Gender</span>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <div className="symptom-row">
              <label className="symptom-field">
                <span className="symptom-label">Overall duration</span>
                <input
                  placeholder="e.g., 2 days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </label>
            </div>

            <div className="symptom-row">
              <label className="symptom-field">
                <span className="symptom-label">Existing conditions (optional)</span>
                <input
                  placeholder="e.g., diabetes, hypertension"
                  value={existingConditions}
                  onChange={(e) => setExistingConditions(e.target.value)}
                />
              </label>
            </div>

            {symptoms.map((s, i) => (
              <div key={i} className="symptom-row symptom-row--symptom">
                <label className="symptom-field symptom-field--symptom">
                  <span className="symptom-label">Symptom</span>
                  <input
                    placeholder="e.g., headache"
                    value={s.name}
                    onChange={(e) => {
                      const newSyms = [...symptoms];
                      newSyms[i].name = e.target.value;
                      setSymptoms(newSyms);
                    }}
                  />
                </label>

                <label className="symptom-field symptom-field--severity">
                  <span className="symptom-label">Severity</span>
                  <div className="symptom-severity">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={s.severity}
                      onChange={(e) => {
                        const newSyms = [...symptoms];
                        newSyms[i].severity = Number(e.target.value);
                        setSymptoms(newSyms);
                      }}
                    />
                    <span className="symptom-severity-value">
                      {s.severity}/10
                    </span>
                  </div>
                </label>
              </div>
            ))}

            <div className="symptom-actions">
              <button
                type="button"
                onClick={addSymptom}
                className="symptom-btn symptom-btn--secondary"
              >
                Add symptom
              </button>
              <button
                type="submit"
                disabled={loading}
                className="symptom-btn symptom-btn--primary"
              >
                {loading ? "Checking..." : "Check symptoms"}
              </button>
            </div>

            {error && <p className="error">{error}</p>}
          </form>
        </section>

        <aside className="symptom-info-card">
          <h3 className="symptom-section-title">Tips for better results</h3>
          <ul className="symptom-tips">
            <li>Be specific about when each symptom started.</li>
            <li>Describe severity as you feel it right now.</li>
            <li>
              Include important conditions like diabetes, heart disease, or
              pregnancy.
            </li>
          </ul>

          <h4 className="symptom-subtitle">Common symptoms</h4>
          <div className="symptom-chips">
            {["Headache", "Fever", "Cough", "Fatigue", "Nausea", "Dizziness"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  className="symptom-chip"
                  onClick={() => {
                    const updated = [...symptoms];
                    const idx = updated.findIndex((s) => !s.name.trim());
                    if (idx >= 0) {
                      updated[idx].name = label.toLowerCase();
                    } else {
                      updated.push({ name: label.toLowerCase(), severity: 5 });
                    }
                    setSymptoms(updated);
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>

          <div className="symptom-disclaimer">
            <BiSolidError className="symptom-disclaimer-icon" /> This tool does not replace professional medical advice. Always
            contact a doctor in an emergency.
          </div>
        </aside>
      </div>

      <div className="symptom-results">
        {loading && result == null && (
          <LoadingSpinner text="Analyzing your symptoms..." />
        )}
        {result && !loading && <SymptomResults result={result} />}
      </div>
    </div>
  );
};

export default SymptomChecker;
