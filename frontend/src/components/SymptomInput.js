import React, { useState, useRef, useEffect } from 'react';
import './SymptomInput.css';

const COMMON_SYMPTOMS = [
  'Fever',
  'Cough',
  'Headache',
  'Sore throat',
  'Fatigue',
  'Shortness of breath',
  'Runny nose',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Muscle pain',
  'Loss of taste',
  'Loss of smell',
  'Chest pain',
  'Dizziness',
  'Rash',
  'Chills',
  'Sneezing',
  'Congestion',
  'Back pain',
  'Joint pain',
];

const PLACEHOLDER_EXAMPLES = [
  'e.g. fever, cough, headache...',
  'e.g. sore throat, fatigue...',
  'e.g. shortness of breath, chills...'
];

// Static mapping for AI suggestions (demo)
const SUGGESTIONS_MAP = {
  'Fever': ['Chills', 'Sweating'],
  'Cough': ['Sore throat', 'Congestion'],
  'Headache': ['Nausea', 'Dizziness'],
  'Sore throat': ['Cough', 'Runny nose'],
  'Fatigue': ['Muscle pain', 'Joint pain'],
  'Shortness of breath': ['Chest pain'],
  'Nausea': ['Vomiting', 'Diarrhea'],
  'Back pain': ['Muscle pain', 'Joint pain'],
  'Loss of taste': ['Loss of smell'],
  'Loss of smell': ['Loss of taste'],
};

export default function SymptomInput({ onSubmit }) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const placeholderInterval = useRef(null);

  useEffect(() => {
    placeholderInterval.current = setInterval(() => {
      setPlaceholderIdx(idx => (idx + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 2500);
    return () => clearInterval(placeholderInterval.current);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!symptoms.trim()) {
      setError('Please enter your symptoms.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(symptoms);
      setSymptoms('');
      setSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomClick = (symptom) => {
    const arr = symptoms.split(',').map(s => s.trim()).filter(Boolean);
    if (arr.includes(symptom)) {
      setSymptoms(arr.filter(s => s !== symptom).join(', '));
    } else {
      setSymptoms(arr.length ? arr.join(', ') + ', ' + symptom : symptom);
    }
  };

  const handleClear = () => {
    setSymptoms('');
    setError('');
    setSuccess(false);
  };

  const selectedSymptoms = symptoms.split(',').map(s => s.trim()).filter(Boolean);
  const lastSymptom = selectedSymptoms[selectedSymptoms.length - 1];
  const aiSuggestions = lastSymptom && SUGGESTIONS_MAP[lastSymptom]
    ? SUGGESTIONS_MAP[lastSymptom].filter(s => !selectedSymptoms.includes(s))
    : [];

  return (
    <form className="symptom-input-form" onSubmit={handleSubmit}>
      <label htmlFor="symptoms">Describe your symptoms :</label>
      <div className="common-symptoms-row">
        {COMMON_SYMPTOMS.map((symptom) => {
          const selected = selectedSymptoms.includes(symptom);
          return (
            <button
              type="button"
              className={`common-symptom-btn${selected ? ' selected' : ''}`}
              key={symptom}
              onClick={() => handleSymptomClick(symptom)}
              disabled={selected}
            >
              {selected ? <span className="symptom-icon">✔</span> : <span className="symptom-icon">＋</span>} {symptom}
            </button>
          );
        })}
      </div>
      <div className="symptom-textarea-row">
        <textarea
          id="symptoms"
          value={symptoms}
          onChange={e => { setSymptoms(e.target.value); setError(''); setSuccess(false); }}
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
          required
        />
        <button type="button" className="clear-btn" onClick={handleClear} title="Clear symptoms" aria-label="Clear symptoms">✖</button>
      </div>
      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="ai-suggestions-card">
          <span className="ai-suggestions-label">
            <span className="ai-icon" aria-hidden="true">🤖</span> Related symptoms:
          </span>
          {aiSuggestions.map(s => (
            <button
              type="button"
              className="ai-suggestion-btn"
              key={s}
              onClick={() => handleSymptomClick(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? <span className="spinner" aria-label="Loading"></span> : 'Check with AI'}
      </button>
      {error && <div className="symptom-feedback error">{error}</div>}
      {success && <div className="symptom-feedback success">AI checked your symptoms successfully!</div>}
    </form>
  );
} 