import { useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Zap,
  Heart,
  Shield,
  XCircle
} from 'lucide-react';
import BoardingPass from './BoardingPass';

const rewriteStyles = [
  { id: 'short', label: 'Short & Direct', icon: Zap },
  { id: 'warm', label: 'Warm & Human', icon: Heart },
  { id: 'confident', label: 'Confident & Assertive', icon: Shield }
];

export default function ResultsPanel({
  results,
  safetyWarnings,
  onCopy
}) {
  const [activeRewrite, setActiveRewrite] = useState('short');
  const [copiedField, setCopiedField] = useState(null);

  if (!results) return null;

  const { verdict, risks, missing, rewrites, suggested_opener } = results;

  const handleCopy = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    if (onCopy) onCopy();
  };

  return (
    <div className="results-section">
      <div className="results-grid">
        {/* Boarding Pass */}
        <BoardingPass verdict={verdict} />

        {/* Safety Warnings */}
        {safetyWarnings && safetyWarnings.length > 0 && (
          <div className="safety-warning">
            <div className="safety-warning-header">
              <XCircle size={18} />
              Sensitive Information Detected
            </div>
            <p className="safety-warning-text">
              Your message may contain personal information you might not want to share:
            </p>
            <ul className="detected-items">
              {safetyWarnings.map((item, i) => (
                <li key={i} className="detected-item">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Misread Risks */}
        {risks && risks.length > 0 && (
          <div>
            <h3 className="section-title" style={{ fontSize: '1.125rem', marginBottom: '16px' }}>
              <AlertTriangle size={20} />
              Misread Risks
            </h3>
            {risks.map((risk, index) => (
              <div key={index} className="alert-card risk">
                <div className="alert-header">
                  <AlertTriangle size={16} />
                  {risk.issue}
                </div>
                <div className="alert-text">"{risk.text}"</div>
                <p className="alert-explanation">{risk.why}</p>
              </div>
            ))}
          </div>
        )}

        {/* Missing Info */}
        {missing && missing.length > 0 && (
          <div className="missing-info-section">
            <h3 className="missing-info-title">
              <HelpCircle size={18} />
              What readers will ask
            </h3>
            <div className="missing-tags">
              {missing.map((item, index) => (
                <span key={index} className="missing-tag">{item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Opener */}
        {suggested_opener && (
          <div className="opener-section">
            <h3 className="opener-title">
              <MessageSquare size={18} />
              Better Subject / Opener
            </h3>
            <div className="opener-text">
              {suggested_opener}
              <button
                className="btn btn-icon"
                style={{ marginLeft: '12px', color: 'var(--color-xray-blue)' }}
                onClick={() => handleCopy(suggested_opener, 'opener')}
                title="Copy to clipboard"
              >
                {copiedField === 'opener' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Rewrite Options */}
        {rewrites && (
          <div className="rewrite-section">
            <h3 className="rewrite-title">
              <Sparkles size={20} />
              Suggested Rewrites
            </h3>

            <div className="rewrite-tabs">
              {rewriteStyles.map(style => {
                const Icon = style.icon;
                return (
                  <button
                    key={style.id}
                    className={`rewrite-tab ${activeRewrite === style.id ? 'active' : ''}`}
                    onClick={() => setActiveRewrite(style.id)}
                  >
                    <Icon size={16} />
                    {style.label}
                  </button>
                );
              })}
            </div>

            <div className="rewrite-content">
              {rewrites[activeRewrite] || 'No rewrite available for this style.'}
            </div>

            <div className="rewrite-actions">
              <button
                className={`btn btn-secondary ${copiedField === activeRewrite ? 'copy-success' : ''}`}
                onClick={() => handleCopy(rewrites[activeRewrite], activeRewrite)}
              >
                {copiedField === activeRewrite ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Rewrite
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
