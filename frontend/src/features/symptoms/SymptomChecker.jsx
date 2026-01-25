import React, { useState } from 'react';
import api from '../../services/api';
import './SymptomChecker.css';
import SymptomResults from "./SymptomResults";

const SymptomChecker = () => {
    const [age, setAge] = useState(30);
    const [gender, setGender] = useState("male");
    const [duration, setDuration] = useState("");
    const [existingConditions, setExistingConditions] = useState("");
    const [symptoms, setSymptoms] = useState([{ name: '', severity: 1 }]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const addSymptom = () => setSymptoms([...symptoms, { name: '', severity: 1 }]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await api.post('/ai/symptomChecker', {
                age: Number(age),
                gender,
                symptoms: symptoms.filter(s => s.name?.trim()),
                duration: duration || undefined,
                existingConditions: existingConditions || undefined,
            });

            // Backend wraps payload under ApiResponse.data
            setResult(data?.data || null);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Symptom check failed");
        }
        setLoading(false);
    };

    return (
        <div className="symptom-checker">
            <h2>Tell us your symptoms</h2>
            <form onSubmit={handleSubmit}>
                <div className="symptom-row">
                    <input
                        type="number"
                        min="0"
                        max="120"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        style={{ maxWidth: 120 }}
                        required
                    />
                    <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="symptom-row">
                    <input
                        placeholder="Overall duration (e.g., 2 days)"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />
                </div>

                <div className="symptom-row">
                    <input
                        placeholder="Existing conditions (optional)"
                        value={existingConditions}
                        onChange={(e) => setExistingConditions(e.target.value)}
                    />
                </div>

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
            {error && <p className="error">{error}</p>}
            {result && <SymptomResults result={result} />}
        </div>
    );
};

export default SymptomChecker;
