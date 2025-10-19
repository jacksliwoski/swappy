import { useState } from 'react';
import { FairnessResponse } from '../types';

const API_BASE = 'http://localhost:3000';

interface Props {
  sideA: number[];
  sideB: number[];
  onUpdateSideA: (items: number[]) => void;
  onUpdateSideB: (items: number[]) => void;
}

export default function FairnessTester({ sideA, sideB, onUpdateSideA, onUpdateSideB }: Props) {
  const [result, setResult] = useState<FairnessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItemA, setNewItemA] = useState('');
  const [newItemB, setNewItemB] = useState('');

  const handleScoreFairness = async () => {
    if (sideA.length === 0 || sideB.length === 0) {
      setError('Both sides need at least one item');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/ai/uneven-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sideA, sideB })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const fairness = await response.json();
      setResult(fairness);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to score fairness');
    } finally {
      setLoading(false);
    }
  };

  const addItemToSide = (side: 'A' | 'B') => {
    const value = parseFloat(side === 'A' ? newItemA : newItemB);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    if (side === 'A') {
      onUpdateSideA([...sideA, value]);
      setNewItemA('');
    } else {
      onUpdateSideB([...sideB, value]);
      setNewItemB('');
    }
    setError(null);
  };

  const removeItem = (side: 'A' | 'B', index: number) => {
    if (side === 'A') {
      onUpdateSideA(sideA.filter((_, i) => i !== index));
    } else {
      onUpdateSideB(sideB.filter((_, i) => i !== index));
    }
  };

  const roundToNearest = (num: number, multiple: number) => {
    return Math.round(num / multiple) * multiple;
  };

  return (
    <div className="card">
      <h2>Fairness Tester</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
        <div>
          <h3>Side A Items</h3>
          <div className="item-list">
            {sideA.map((item, i) => (
              <div key={i} className="item-chip">
                ${item}
                <button
                  onClick={() => removeItem('A', i)}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    fontSize: '12px',
                    background: '#dc3545'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {sideA.length === 0 && <span style={{ color: '#999' }}>No items</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="number"
              placeholder="Enter value"
              value={newItemA}
              onChange={(e) => setNewItemA(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItemToSide('A')}
              style={{ marginBottom: 0 }}
            />
            <button onClick={() => addItemToSide('A')} className="secondary">Add</button>
          </div>
        </div>

        <div>
          <h3>Side B Items</h3>
          <div className="item-list">
            {sideB.map((item, i) => (
              <div key={i} className="item-chip">
                ${item}
                <button
                  onClick={() => removeItem('B', i)}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    fontSize: '12px',
                    background: '#dc3545'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {sideB.length === 0 && <span style={{ color: '#999' }}>No items</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="number"
              placeholder="Enter value"
              value={newItemB}
              onChange={(e) => setNewItemB(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItemToSide('B')}
              style={{ marginBottom: 0 }}
            />
            <button onClick={() => addItemToSide('B')} className="secondary">Add</button>
          </div>
        </div>
      </div>

      {error && <div className="error-toast">{error}</div>}

      <button onClick={handleScoreFairness} disabled={loading || sideA.length === 0 || sideB.length === 0}>
        {loading && <span className="loading" />}
        {loading ? 'Scoring...' : 'Score Fairness'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>Fairness Result</h3>
          <div style={{ marginBottom: '12px' }}>
            <strong>Side A Total:</strong> ${result.A} <br />
            <strong>Side B Total:</strong> ${result.B} <br />
            <strong>Difference:</strong> ${result.diff}
          </div>

          <div className="fairness-meter">
            <div
              className="fairness-meter-fill"
              style={{ width: `${result.fairness * 100}%` }}
            >
              {Math.round(result.fairness * 100)}%
            </div>
          </div>

          {result.warn && (
            <div className="warning-banner">
              <strong>⚠️ Uneven Trade Warning</strong>
              <p style={{ marginTop: '8px', marginBottom: 0 }}>
                To balance, add ~${roundToNearest(result.diff, result.diff >= 50 ? 10 : 5)} or another item valued around ${roundToNearest(result.diff, result.diff >= 50 ? 10 : 5)}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
