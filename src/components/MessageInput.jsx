import { useState } from 'react';
import { Send, ShieldCheck } from 'lucide-react';

export default function MessageInput({
  message,
  setMessage,
  onScan,
  isScanning,
  safetyCheck,
  setSafetyCheck
}) {
  const maxChars = 5000;
  const charCount = message.length;

  return (
    <div className="input-section">
      <h2 className="section-title">
        <Send size={24} />
        Screen Your Message
      </h2>
      <p className="section-subtitle">
        Paste your email, Slack message, DM, or any text you want to check before sending.
      </p>

      <textarea
        className="message-textarea"
        placeholder="Paste your message here...

Example: 'Hey, just following up on my last email. Not sure if you saw it but I really need that report ASAP. Let me know.'"
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
        disabled={isScanning}
      />

      <div className="safety-toggle">
        <div
          className={`toggle-switch ${safetyCheck ? 'active' : ''}`}
          onClick={() => setSafetyCheck(!safetyCheck)}
          role="switch"
          aria-checked={safetyCheck}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSafetyCheck(!safetyCheck)}
        />
        <span className="toggle-label">
          <ShieldCheck size={16} />
          Safety Check — detect sensitive info (phone, email, addresses)
        </span>
      </div>

      <div className="input-actions">
        <span className="char-count">
          {charCount} / {maxChars} characters
        </span>
        <button
          className="btn btn-primary"
          onClick={onScan}
          disabled={!message.trim() || isScanning}
        >
          {isScanning ? (
            <>
              <div className="loading-dots">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </div>
              Scanning...
            </>
          ) : (
            <>
              <Send size={18} />
              Screen Message
            </>
          )}
        </button>
      </div>
    </div>
  );
}
