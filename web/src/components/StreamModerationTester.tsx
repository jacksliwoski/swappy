import { useState } from 'react';
import { ModerationResult } from '../types';

const API_BASE = 'http://localhost:3000';

export default function StreamModerationTester() {
  const [message, setMessage] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [result, setResult] = useState<ModerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStreamModeration = async () => {
    if (!message.trim()) {
      setError('Please enter a message to moderate');
      return;
    }

    setStreaming(true);
    setStreamedText('');
    setResult(null);
    setError(null);

    try {
      const encodedMsg = encodeURIComponent(message);
      const response = await fetch(`${API_BASE}/ai/moderate/stream?msg=${encodedMsg}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              setStreaming(false);
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              // Check if it's a chunk or final result
              if (parsed.chunk) {
                setStreamedText((prev) => prev + parsed.chunk);
              } else if (parsed.tags && parsed.action && parsed.tip) {
                // Final moderation result
                setResult(parsed);
              }
            } catch (e) {
              // Ignore JSON parse errors for partial chunks
            }
          }
        }
      }

      setStreaming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate message');
      setStreaming(false);
    }
  };

  const getBannerClass = () => {
    if (!result) return '';
    if (result.action === 'block') return 'warning-banner block';
    if (result.action === 'warn') return 'warning-banner';
    return '';
  };

  return (
    <div className="card">
      <h2>Chat Safety Moderation (Optional)</h2>

      <div className="form-group">
        <label>Type a chat message to test moderation</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., 'Send me a $50 Venmo deposit before we meet'"
          disabled={streaming}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleStreamModeration();
            }
          }}
        />
      </div>

      {error && <div className="error-toast">{error}</div>}

      <button onClick={handleStreamModeration} disabled={streaming || !message.trim()}>
        {streaming && <span className="loading" />}
        {streaming ? 'Streaming...' : 'Stream Moderation'}
      </button>

      {streamedText && (
        <div className="debug-panel">
          <strong>Streamed Content:</strong>
          <pre>{streamedText}</pre>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>Moderation Result</h3>

          <div style={{ marginBottom: '12px' }}>
            <strong>Tags:</strong>{' '}
            {result.tags.map((tag, i) => (
              <span key={i} style={{
                background: '#e9ecef',
                padding: '4px 8px',
                borderRadius: '4px',
                marginRight: '6px',
                fontSize: '13px'
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>Action:</strong>{' '}
            <span style={{
              textTransform: 'uppercase',
              fontWeight: 'bold',
              color: result.action === 'block' ? '#dc3545' : result.action === 'warn' ? '#ffc107' : '#28a745'
            }}>
              {result.action}
            </span>
          </div>

          {result.action !== 'allow' && (
            <div className={getBannerClass()}>
              <strong>{result.action === 'block' ? '🚫 Blocked' : '⚠️ Warning'}</strong>
              <p style={{ marginTop: '8px', marginBottom: 0 }}>{result.tip}</p>
            </div>
          )}

          {result.action === 'allow' && (
            <div style={{
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              padding: '12px',
              color: '#155724'
            }}>
              <strong>✓ Allowed</strong>
              <p style={{ marginTop: '8px', marginBottom: 0 }}>{result.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
