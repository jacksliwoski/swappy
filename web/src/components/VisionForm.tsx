import { useState } from 'react';
import { Facts } from '../types';

const API_BASE = 'http://localhost:3000';

interface Props {
  onFactsExtracted: (facts: Facts) => void;
}

export default function VisionForm({ onFactsExtracted }: Props) {
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }
    setImages(files);
    setError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imagesBase64 = await Promise.all(images.map(fileToBase64));

      const response = await fetch(`${API_BASE}/ai/vision-facts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagesBase64, description: description || undefined })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const facts = await response.json();
      onFactsExtracted(facts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract facts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Vision → Item Facts</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Upload Images (1-4)</label>
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            disabled={loading}
          />
          {images.length > 0 && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {images.length} image{images.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any additional details about the item..."
            disabled={loading}
          />
        </div>

        {error && <div className="error-toast">{error}</div>}

        <button type="submit" disabled={loading || images.length === 0}>
          {loading && <span className="loading" />}
          {loading ? 'Extracting Facts...' : 'Extract Facts'}
        </button>
      </form>
    </div>
  );
}
