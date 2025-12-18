import { Plane, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const verdictConfig = {
  good_to_send: {
    class: 'cleared',
    label: 'CLEARED',
    icon: CheckCircle,
    message: 'Your message looks good! It reads clearly and professionally.'
  },
  needs_edit: {
    class: 'review',
    label: 'REVIEW',
    icon: AlertTriangle,
    message: 'Your message could use some adjustments. Check the suggestions below.'
  },
  high_risk: {
    class: 'flagged',
    label: 'FLAGGED',
    icon: XCircle,
    message: 'Caution! This message has potential issues that could cause misunderstandings.'
  }
};

export default function BoardingPass({ verdict, flightNumber = 'MC-2024' }) {
  const config = verdictConfig[verdict] || verdictConfig.needs_edit;
  const VerdictIcon = config.icon;

  return (
    <div className="boarding-pass">
      <div className="boarding-pass-header">
        <div>
          <div className="boarding-pass-title">
            <Plane size={18} style={{ marginRight: '8px' }} />
            Message Clearance
          </div>
          <div className="boarding-pass-flight">Flight {flightNumber}</div>
        </div>
      </div>

      <div className={`verdict-stamp ${config.class}`}>
        <VerdictIcon size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
        {config.label}
      </div>

      <p className="verdict-message">{config.message}</p>
    </div>
  );
}
