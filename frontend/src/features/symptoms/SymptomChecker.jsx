import React, { useState } from 'react';
import api from '../../services/api';
import './SymptomChecker.css';

const SymptomChecker = () => {
    const [symptoms, setSymptoms] = useState([{ name: '', severity: 1 }]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const addSymptom = () => setSymptoms([...symptoms, { name: '', severity: 1 }]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/ai/symptomChecker', { symptoms });
            setResult(data.response);  // { urgency, suggestedSpecialities, disclaimer }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="symptom-checker">
            <h2>Tell us your symptoms</h2>
            <form onSubmit={handleSubmit}>
                {symptoms.map((s, i) => (
                    <div key={i} className="symptom-row">
                        <input placeholder="e.g., headache" value={s.name} onChange={(e) => {
                            const newSyms = [...symptoms];
                            newSyms[i].name = e.target.value;
                            setSymptoms(newSyms);
                        }} />
                        <input type="range" min="1" max="10" value={s.severity} onChange={(e) => {
                            const newSyms = [...symptoms];
                            newSyms[i].severity = Number(e.target.value);
                            setSymptoms(newSyms);
                        }} />
                        <span>{s.severity}/10</span>
                    </div>
                ))}
                <button type="button" onClick={addSymptom}>Add Symptom</button>
                <button type="submit" disabled={loading}>Check</button>
            </form>
            {result && (
                <div className="result">
                    <h3>{result.urgency}</h3>
                    <p>{result.response}</p>
                    {result.suggestedSpecialities?.map((spec, i) => <div key={i}>{spec}</div>)}
                    <p className="disclaimer">{result.disclaimer}</p>
                </div>
            )}
        </div>
    );
};

export default SymptomChecker;
