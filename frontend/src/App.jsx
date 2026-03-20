import React, { useState } from 'react';
import BiometricVerification from './components/BiometricVerification';
import VotingMachine from './components/VotingMachine';

function App() {
  const [token, setToken] = useState(null);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  const toggleAccessibility = () => {
    setIsScreenReaderActive(!isScreenReaderActive);
    if (!isScreenReaderActive) {
      const msg = new SpeechSynthesisUtterance("Accessibility mode activated. Welcome to the polling booth.");
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <>
      <div className="nav-bar">
        <div style={{fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent)'}}>
           GenAI EVM
        </div>
        <button className="accessibility-btn" onClick={toggleAccessibility} aria-label="Toggle Accessibility Assistant">
          <span>{isScreenReaderActive ? "🔊 Gemini Assistant On" : "🔈 Assistant Off"}</span>
        </button>
      </div>

      {!token ? (
        <BiometricVerification onVerified={setToken} isScreenReaderActive={isScreenReaderActive} />
      ) : (
        <VotingMachine token={token} isScreenReaderActive={isScreenReaderActive} onLogout={() => setToken(null)} />
      )}
    </>
  );
}

export default App;
