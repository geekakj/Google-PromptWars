import React, { useState, useRef, useEffect } from 'react';

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
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const handleSelect = (id, name) => {
    setSelected(id);
    if(isScreenReaderActive) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Selected ${name}. Press cast vote to confirm.`));
    }
  };

  const handleVote = async () => {
    if(!selected) return;
    setLoading(true);
    setError('');
    
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
        if(isScreenReaderActive) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Vote cast successfully. Your contribution to democracy is registered. Logging out."));
        setTimeout(onLogout, 5000); // Auto logout after 5 seconds
      } else {
        const msg = data.detail || data.message || "Failed to submit vote. Please try again.";
        setError(msg);
        if(isScreenReaderActive) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Error: " + msg));
      }
    } catch(err) {
      setError("Communication error with the ballot server. Please alert a poll worker.");
    } finally {
      setLoading(false);
    }
  };

  if(voted) {
    return (
      <div className="glass-card fade-in" aria-live="polite">
        <h1>Vote Submitted ✔️</h1>
        <div className="success-message">
          Your secure, registered vote has been successfully cast. 
          <br/><br/>
          <strong style={{color: 'white'}}>Security Note:</strong> Your session will be cleared automatically in 5 seconds to protect your privacy.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card fade-in">
      <h1 id="evm-title">Electronic Voting Machine</h1>
      <p>Select your preferred candidate. Choices are 256-bit encrypted and anonymous.</p>
      
      <div className="candidate-list" role="radiogroup" aria-labelledby="evm-title">
        {CANDIDATES.map((c) => (
          <div 
            key={c.id} 
            className={`candidate-card ${selected === c.id ? 'selected' : ''}`}
            onClick={() => handleSelect(c.id, c.name)}
            role="radio"
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(c.id, c.name); } }}
            aria-checked={selected === c.id}
            aria-label={`${c.name} from ${c.party}`}
          >
            <div style={{textAlign: 'left'}}>
              <h3 style={{margin: '0', fontSize: '1.25rem', color: selected === c.id ? '#fff' : '#f1f5f9'}}>{c.name}</h3>
              <span style={{color: '#94a3b8', fontSize: '0.95rem'}}>{c.party}</span>
            </div>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', 
              border: `2px solid ${selected === c.id ? 'var(--primary)' : 'var(--glass-border)'}`,
              background: selected === c.id ? 'var(--primary)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}>
                {selected === c.id && <div style={{width: '12px', height: '12px', background: 'white', borderRadius: '50%'}} />}
            </div>
          </div>
        ))}
      </div>

      <div aria-live="assertive">
        {error && <div className="error-message" role="alert" tabIndex="-1" ref={errorRef}>{error}</div>}
      </div>

      <div style={{marginTop: '2.5rem'}}>
        <button onClick={handleVote} disabled={!selected || loading} aria-busy={loading} aria-describedby={selected ? undefined : "select-hint"}>
          {loading ? 'Submitting encrypted ballot...' : 'Cast Vote Securely'}
        </button>
        {!selected && <p id="select-hint" style={{fontSize: '0.85rem', marginTop: '0.5rem', color: '#64748b'}}>Please make a selection to enable voting.</p>}
      </div>
    </div>
  );
};

export default VotingMachine;
