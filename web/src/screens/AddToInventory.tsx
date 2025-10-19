import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ai, api } from '../utils/api';
import Confetti from '../components/ui/Confetti';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Facts, ValuationResponse } from '../types';

export default function AddToInventory() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [facts, setFacts] = useState<Facts | null>(null);
  const [valuation, setValuation] = useState<ValuationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user on mount
  useEffect(() => {
    api.auth.me().then(res => {
      if (res.ok && res.user) {
        setCurrentUser(res.user);
      }
    }).catch(err => console.error('Failed to get current user:', err));
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Step 1: Photo Upload
  const handlePhotoSubmit = async () => {
    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const base64Images = await Promise.all(images.map(fileToBase64));
      setImagesBase64(base64Images);
      
      // Proceed to facts extraction
      const extractedFacts = await ai.visionFacts(base64Images, description || undefined);
      setFacts(extractedFacts);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract facts');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Review Facts
  const handleFactsConfirm = async () => {
    if (!facts) return;
    setLoading(true);
    setError(null);
    try {
      const val = await ai.valuation(facts);
      setValuation(val);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get valuation');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save to Inventory
  const handleSave = async () => {
    if (!facts || !valuation || !currentUser) return;
    setLoading(true);
    setError(null);
    try {
      // Convert base64 images to data URLs for display
      const imageUrls = imagesBase64.map(b64 => `data:image/jpeg;base64,${b64}`);
      
      const newItem = {
        images: imageUrls,
        title: `${facts.brand} ${facts.model}`,
        description: description || facts.notes,
        facts,
        valuation,
        category: facts.category,
        condition: facts.condition,
      };

      await api.users.addInventoryItem(currentUser.id, newItem);

      setShowConfetti(true);
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '800px', margin: '0 auto' }}>
      {showConfetti && <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />}

      {/* Progress Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {[1, 2, 3].map(num => (
          <div
            key={num}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: step >= num ? 'var(--color-primary)' : 'var(--color-gray-300)',
              transition: 'background var(--transition-fast)',
            }}
          />
        ))}
      </div>

      <h1 style={{ fontSize: 'var(--text-3xl)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        ➕ Add to Your Toy Box
      </h1>

      {error && (
        <div style={{
          background: 'var(--color-red-light)',
          color: 'var(--color-red-dark)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Photos */}
      {step === 1 && (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>📸 Step 1: Add Photos</h2>
          <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)' }}>
            Upload 1-4 clear photos of your item. More photos = better valuation! 🎯
          </p>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
              Upload Images (1-4)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 4) {
                  setError('Maximum 4 images allowed');
                  return;
                }
                setImages(files);
                setError(null);
              }}
              disabled={loading}
            />
            {images.length > 0 && (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', marginTop: 'var(--space-2)' }}>
                {images.length} image{images.length > 1 ? 's' : ''} selected
                {images.length >= 3 && ' ✨ +5 XP for quality photos!'}
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any special details about your item..."
              disabled={loading}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: 'var(--space-3)',
                fontSize: 'var(--text-base)',
                border: '2px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handlePhotoSubmit}
            disabled={loading || images.length === 0}
            style={{ width: '100%' }}
          >
            {loading ? <LoadingSpinner /> : 'Next: Extract Facts ✨'}
          </Button>
        </div>
      )}

      {/* Step 2: Facts */}
      {step === 2 && facts && (
        <div>
          <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>✨ Step 2: Magic Facts</h2>
            <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)' }}>
              We analyzed your photos! Review and edit if needed.
            </p>

            <div style={{
              background: 'var(--color-gray-50)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)',
            }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong>Category:</strong> {facts.category}
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong>Brand:</strong> {facts.brand}
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong>Model:</strong> {facts.model}
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong>Condition:</strong> {facts.condition}
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong>Year/Edition:</strong> {facts.year_or_edition}
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong>Attributes:</strong> {facts.attributes.join(', ')}
              </div>
              {facts.notes && (
                <div>
                  <strong>Notes:</strong> {facts.notes}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
              ← Back
            </Button>
            <Button
              variant="primary"
              onClick={handleFactsConfirm}
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? <LoadingSpinner /> : 'Next: Get Valuation 💰'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Valuation & Save */}
      {step === 3 && valuation && facts && (
        <div>
          <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>💰 Step 3: Valuation</h2>
            <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)' }}>
              Here's what your item is worth:
            </p>

            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              flexWrap: 'wrap',
            }}>
              <div style={{
                flex: 1,
                minWidth: '100px',
                background: 'var(--color-gray-100)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>Low</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-700)' }}>
                  ${valuation.estimate.low}
                </div>
              </div>
              <div style={{
                flex: 1,
                minWidth: '100px',
                background: 'var(--color-teal-light)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-teal-dark)' }}>Mid</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-teal-dark)' }}>
                  ${valuation.estimate.mid}
                </div>
              </div>
              <div style={{
                flex: 1,
                minWidth: '100px',
                background: 'var(--color-gray-100)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>High</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-700)' }}>
                  ${valuation.estimate.high}
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--color-blue-light)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
            }}>
              <strong style={{ color: 'var(--color-blue-dark)' }}>Explanation:</strong>
              <p style={{ marginTop: 'var(--space-2)', marginBottom: 0, color: 'var(--color-blue-dark)' }}>
                {valuation.explanation}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
              ← Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading || !currentUser}
              style={{ flex: 2 }}
            >
              {loading ? <LoadingSpinner /> : !currentUser ? 'Loading...' : '✨ Add to Toy Box!'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

