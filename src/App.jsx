import { useState, useEffect } from 'react';
import { Plane, Settings, RotateCcw } from 'lucide-react';
import './App.css';

import MessageInput from './components/MessageInput';
import ScannerAnimation from './components/ScannerAnimation';
import ResultsPanel from './components/ResultsPanel';
import APIKeyModal from './components/APIKeyModal';
import { useChat, CHAT_STATUS } from './hooks/useChat';

// Regex patterns for sensitive data detection
const SENSITIVE_PATTERNS = [
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, label: 'Phone number' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: 'Email address' },
  { pattern: /\b\d{5}(-\d{4})?\b/g, label: 'ZIP code' },
  { pattern: /\b\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|court|ct|boulevard|blvd)\b/gi, label: 'Street address' },
  { pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, label: 'Credit card number' },
  { pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, label: 'SSN' },
];

function detectSensitiveInfo(text) {
  const found = [];
  for (const { pattern, label } of SENSITIVE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      found.push(`${label}: ${matches[0]}`);
    }
  }
  return found;
}

export default function App() {
  const {
    status,
    result,
    error,
    isScanning,
    hasResult,
    hasError,
    isReady,
    apiKey,
    setApiKey,
    hasApiKey,
    selectedModel,
    setSelectedModel,
    submitMessage,
    reset,
  } = useChat();

  const [message, setMessage] = useState('');
  const [safetyCheck, setSafetyCheck] = useState(true);
  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show modal on first load if no API key
  useEffect(() => {
    if (isReady && !hasApiKey) {
      setIsModalOpen(true);
    }
  }, [isReady, hasApiKey]);

  const handleScan = async () => {
    if (!message.trim()) return;

    // Run safety check if enabled
    if (safetyCheck) {
      const warnings = detectSensitiveInfo(message);
      setSafetyWarnings(warnings);
    } else {
      setSafetyWarnings([]);
    }

    await submitMessage(message);
  };

  const handleReset = () => {
    setMessage('');
    setSafetyWarnings([]);
    reset();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Plane size={28} />
            <span className="logo-text">MessageClearance</span>
          </div>
          <p className="tagline">Your message has been cleared for takeoff.</p>
        </div>
        <button
          className="btn btn-icon settings-btn"
          onClick={() => setIsModalOpen(true)}
          title="API Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="main">
        {status === CHAT_STATUS.IDLE && (
          <MessageInput
            message={message}
            setMessage={setMessage}
            onScan={handleScan}
            isScanning={isScanning}
            safetyCheck={safetyCheck}
            setSafetyCheck={setSafetyCheck}
          />
        )}

        {status === CHAT_STATUS.SCANNING && (
          <ScannerAnimation message={message} />
        )}

        {hasResult && (
          <>
            <ResultsPanel
              results={result}
              safetyWarnings={safetyWarnings}
            />
            <div className="reset-container">
              <button className="btn btn-secondary" onClick={handleReset}>
                <RotateCcw size={16} />
                Screen Another Message
              </button>
            </div>
          </>
        )}

        {hasError && (
          <div className="error-container">
            <div className="error-message">
              <p>{error?.message || 'An error occurred'}</p>
              {error?.type === 'INVALID_API_KEY' && (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  Update API Key
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleReset}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      <APIKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={selectedModel}
        setModel={setSelectedModel}
      />
    </div>
  );
}
