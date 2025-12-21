import React, { useState } from 'react';

function AIResponseDisplay() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const res = await fetch('http://localhost:5000/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.answer) {
        setResponse(data.answer);
      } else if (data[0] && data[0].answer) {
        setResponse(data[0].answer);
      } else {
        setResponse(JSON.stringify(data));
      }
    } catch (err) {
      setError('Error contacting AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-response-section" style={{ maxWidth: 600, margin: '2rem auto', padding: '1.5rem', background: 'rgba(255,255,255,0.95)', borderRadius: '1rem', boxShadow: '0 2px 12px rgba(25, 118, 210, 0.10)' }}>
      <h2 style={{ color: '#00bcd4', marginBottom: '1rem' }}>Ask the AI Specialist</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your medical question..."
          required
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <button type="submit" style={{ background: 'linear-gradient(90deg, #00bcd4 0%, #2196f3 100%)', color: '#fff', border: 'none', borderRadius: '2rem', padding: '0.7rem 2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }} disabled={loading}>
          {loading ? 'Asking...' : 'Ask AI'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      {response && (
        <div style={{ marginTop: '1.5rem', background: '#f0f7fa', padding: '1rem', borderRadius: '0.5rem', color: '#333' }}>
          <strong>AI Response:</strong>
          <div style={{ marginTop: '0.5rem' }}>{response}</div>
        </div>
      )}
    </section>
  );
}

export default AIResponseDisplay; 