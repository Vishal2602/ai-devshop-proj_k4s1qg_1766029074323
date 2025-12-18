import { useState } from 'react';
import { Settings, Key, X, ExternalLink } from 'lucide-react';

const MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Recommended)', tier: 'quality' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Fast & Cheap)', tier: 'fast' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Budget)', tier: 'fast' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Premium)', tier: 'quality' }
];

export default function APIKeyModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  model,
  setModel,
  onSave
}) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(model || MODELS[0].id);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey);
    setModel(tempModel);
    localStorage.setItem('openrouter_api_key', tempKey);
    localStorage.setItem('openrouter_model', tempModel);
    if (onSave) onSave();
    onClose();
  };

  const handleClear = () => {
    setTempKey('');
    setApiKey('');
    localStorage.removeItem('openrouter_api_key');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <Key size={24} />
          </div>
          <div>
            <h2 className="modal-title">API Settings</h2>
          </div>
          <button
            className="btn btn-icon"
            onClick={onClose}
            style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <p className="modal-description">
          Enter your OpenRouter API key to analyze messages. Your key is stored
          locally in your browser and never sent to our servers.
          {' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
          >
            Get a key <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />
          </a>
        </p>

        <input
          type="password"
          className="api-key-input"
          placeholder="sk-or-v1-..."
          value={tempKey}
          onChange={(e) => setTempKey(e.target.value)}
          autoComplete="off"
        />

        <div className="model-selector">
          <label>Model Selection</label>
          <select
            className="model-select"
            value={tempModel}
            onChange={(e) => setTempModel(e.target.value)}
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-footer">
          {tempKey && (
            <button className="btn btn-ghost" onClick={handleClear}>
              Clear Key
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!tempKey.trim()}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
