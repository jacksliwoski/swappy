import { useState } from 'react';
import { Facts, ValuationResponse } from '../types';

const API_BASE = 'http://localhost:3000';

interface Props {
  facts: Facts;
  valuation: ValuationResponse | null;
  onValuationReceived: (val: ValuationResponse) => void;
  onAddToSide: (value: number, side: 'A' | 'B') => void;
}

export default function ValuationCard({ facts, valuation, onValuationReceived, onAddToSide }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetValuation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/ai/valuation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facts })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const val = await response.json();
      onValuationReceived(val);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get valuation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Valuation</h2>

      {!valuation ? (
        <>
          <p style={{ marginBottom: '12px', color: '#666' }}>
            Get a price estimate based on comparable items and condition.
          </p>
          {error && <div className="error-toast">{error}</div>}
          <button onClick={handleGetValuation} disabled={loading}>
            {loading && <span className="loading" />}
            {loading ? 'Calculating...' : 'Get Valuation'}
          </button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <span className="badge low">LOW: ${valuation.estimate.low}</span>
            <span className="badge mid">MID: ${valuation.estimate.mid}</span>
            <span className="badge high">HIGH: ${valuation.estimate.high}</span>
          </div>

          <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            <strong>Explanation:</strong>
            <p style={{ marginTop: '8px', marginBottom: 0 }}>{valuation.explanation}</p>
          </div>

          <div className="button-group">
            <button onClick={() => onAddToSide(valuation.estimate.mid, 'A')} className="success">
              Use MID as Side A Item
            </button>
            <button onClick={() => onAddToSide(valuation.estimate.mid, 'B')} className="success">
              Use MID as Side B Item
            </button>
            <button onClick={handleGetValuation} className="secondary">
              Recalculate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
