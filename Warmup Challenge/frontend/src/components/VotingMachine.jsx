import React, { useState } from 'react';

const CANDIDATES = [
  { id: 'c1', name: 'Candidate A', party: 'Party Alpha' },
  { id: 'c2', name: 'Candidate B', party: 'Party Beta' },
  { id: 'c3', name: 'NOTA', party: 'None of the Above' },
];

const VotingMachine = ({ token, isScreenReaderActive, onLogout }) => {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (id, name) => {
    setSelected(id);
    if(isScreenReaderActive) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Selected ${name}. Press cast vote to confirm.`));
    }
  };

  const handleVote = async () => {
    if(!selected) return;
    setLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/vote/cast`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ candidate_id: selected })
      });
      const data = await res.json();
      
      if(res.ok && data.success) {
        setVoted(true);
        if(isScreenReaderActive) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Vote cast successfully. Thank you for voting."));
        setTimeout(onLogout, 5000); // Auto logout after 5 seconds
      } else {
        setError(data.detail || data.message || "Failed to submit vote");
        if(isScreenReaderActive) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Failed to submit vote: " + (data.detail || data.message)));
      }
    } catch(err) {
      setError("Network or server error.");
    } finally {
      setLoading(false);
    }
  };

  if(voted) {
    return (
      <div className="glass-card" aria-live="polite">
        <h1>Vote Submitted ✔️</h1>
        <div className="success-message">
          Your secure, registered vote has been successfully cast. 
          <br/>The system will log you out automatically in 5 seconds.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" aria-live="polite">
      <h1>Electronic Voting Machine</h1>
      <p>Please select your preferred candidate. Your choice is encrypted and anonymous.</p>
      
      <div className="candidate-list">
        {CANDIDATES.map((c) => (
          <div 
            key={c.id} 
            className={`candidate-card ${selected === c.id ? 'selected' : ''}`}
            onClick={() => handleSelect(c.id, c.name)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if(e.key === 'Enter') handleSelect(c.id, c.name); }}
            aria-pressed={selected === c.id}
          >
            <div style={{textAlign: 'left'}}>
              <h3 style={{margin: '0', fontSize: '1.2rem', color: selected === c.id ? '#fff' : '#e2e8f0'}}>{c.name}</h3>
              <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>{c.party}</span>
            </div>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%', 
              border: `2px solid ${selected === c.id ? 'var(--primary)' : 'var(--glass-border)'}`,
              background: selected === c.id ? 'var(--primary)' : 'transparent',
              transition: 'all 0.2s'
            }}></div>
          </div>
        ))}
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}

      <div style={{marginTop: '2rem'}}>
        <button onClick={handleVote} disabled={!selected || loading} aria-busy={loading}>
          {loading ? 'Submitting...' : 'Cast Vote Securely'}
        </button>
      </div>
    </div>
  );
};

export default VotingMachine;
