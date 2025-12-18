import { ScanLine, FileText, AlertTriangle, MessageSquare } from 'lucide-react';

export default function ScannerAnimation({ message }) {
  // Truncate message for display
  const displayMessage = message.length > 300
    ? message.slice(0, 300) + '...'
    : message;

  return (
    <div className="scanner-container">
      <div className="x-ray-container">
        <div className="scanner-beam" />
        <pre className="x-ray-text">{displayMessage}</pre>
      </div>

      <div className="scanner-labels">
        <div className="scanner-label">
          <ScanLine size={14} />
          Tone
        </div>
        <div className="scanner-label">
          <FileText size={14} />
          Clarity
        </div>
        <div className="scanner-label">
          <MessageSquare size={14} />
          Ask
        </div>
        <div className="scanner-label">
          <AlertTriangle size={14} />
          Risk
        </div>
      </div>

      <div className="conveyor-belt" />
    </div>
  );
}
