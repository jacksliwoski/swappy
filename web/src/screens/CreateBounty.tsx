import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function CreateBounty() {
  const [bountyType, setBountyType] = useState<'lost_item' | 'treasure_hunt'>('treasure_hunt');
  const [rewardType, setRewardType] = useState<'monetary' | 'inventory'>('monetary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [monetaryAmount, setMonetaryAmount] = useState('25');
  
  // Treasure hunt specific
  const [radiusMiles, setRadiusMiles] = useState('0.5');
  const [clue1, setClue1] = useState('');
  const [clue2, setClue2] = useState('');
  const [clue3, setClue3] = useState('');
  const [duration, setDuration] = useState('4');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const bountyData: any = {
        bountyType,
        rewardType,
      };

      if (bountyType === 'treasure_hunt') {
        bountyData.treasureHunt = {
          title,
          description,
          category: category || 'gaming',
          prizeImages: [],
          huntArea: {
            address: location,
            coordinates: { lat: 47.6062, lng: -122.3321 }, // Default Seattle
            radiusMiles: parseFloat(radiusMiles)
          },
          clues: [
            { id: 'clue_1', text: clue1, unlockAt: 'immediate', revealedAt: new Date().toISOString() },
            clue2 && { id: 'clue_2', text: clue2, unlockAt: new Date(Date.now() + 2*60*60*1000).toISOString(), revealedAt: null },
            clue3 && { id: 'clue_3', text: clue3, unlockAt: new Date(Date.now() + 4*60*60*1000).toISOString(), revealedAt: null },
          ].filter(Boolean),
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + parseFloat(duration) * 60 * 60 * 1000).toISOString(),
          difficulty: 'medium',
          isPublicEvent: true,
          maxHunters: 50,
          huntRules: [
            'Must post photo with item to claim',
            'Public property only',
            'Be respectful of the area'
          ]
        };
      } else {
        bountyData.lostItem = {
          title,
          description,
          category: category || 'other',
          images: [],
          lastSeenLocation: {
            address: location,
            coordinates: { lat: 47.6062, lng: -122.3321 }
          },
          lastSeenDate: new Date().toISOString(),
          identifyingFeatures: []
        };
      }

      if (rewardType === 'monetary') {
        bountyData.monetaryReward = {
          amount: parseFloat(monetaryAmount),
          currency: 'USD',
          paymentMethod: {
            cardNumber: '4111111111111111', // Demo card
            cvv: '123',
            expiry: '1226'
          }
        };
      } else {
        bountyData.inventoryReward = {
          offeredItems: [],
          totalValue: 0,
          finderCanChoose: true,
          maxItems: 1
        };
      }

      bountyData.xpReward = bountyType === 'treasure_hunt' ? 750 : 500;
      bountyData.badgeEligible = true;

      const result = await api.bounties.create(bountyData);
      
      if (result.ok) {
        navigate(`/bounty/${result.bounty.id}`);
      } else {
        setError('Failed to create bounty');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create bounty');
    } finally {
      setLoading(false);
    }
  }

  const containerStyles: CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: 'var(--space-6)',
  };

  const headerStyles: CSSProperties = {
    marginBottom: 'var(--space-6)',
  };

  const formStyles: CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    border: '2px solid var(--color-border)',
  };

  const sectionStyles: CSSProperties = {
    marginBottom: 'var(--space-6)',
  };

  const labelStyles: CSSProperties = {
    display: 'block',
    marginBottom: 'var(--space-2)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-1)',
  };

  const inputStyles: CSSProperties = {
    width: '100%',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--color-border)',
    fontSize: 'var(--text-body)',
    fontFamily: 'inherit',
  };

  const textareaStyles: CSSProperties = {
    ...inputStyles,
    minHeight: '100px',
    resize: 'vertical',
  };

  const toggleStyles: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-4)',
  };

  const toggleButtonStyles = (active: boolean): CSSProperties => ({
    flex: 1,
    padding: 'var(--space-3)',
    border: `2px solid ${active ? 'var(--color-brand)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    background: active ? 'var(--color-brand)20' : 'transparent',
    cursor: 'pointer',
    fontWeight: active ? 'var(--font-bold)' : 'var(--font-medium)',
    color: active ? 'var(--color-brand)' : 'var(--color-text-2)',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: 'var(--space-2)' }}>
          Create Bounty
        </h1>
        <p style={{ color: 'var(--color-text-2)' }}>
          Post a lost item bounty or create a treasure hunt!
        </p>
      </div>

      <form onSubmit={handleSubmit} style={formStyles}>
        {/* Bounty Type */}
        <div style={sectionStyles}>
          <label style={labelStyles}>Bounty Type</label>
          <div style={toggleStyles}>
            <button
              type="button"
              style={toggleButtonStyles(bountyType === 'treasure_hunt')}
              onClick={() => setBountyType('treasure_hunt')}
            >
              🎮 Treasure Hunt
            </button>
            <button
              type="button"
              style={toggleButtonStyles(bountyType === 'lost_item')}
              onClick={() => setBountyType('lost_item')}
            >
              📦 Lost Item
            </button>
          </div>
        </div>

        {/* Title */}
        <div style={sectionStyles}>
          <label style={labelStyles}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={bountyType === 'treasure_hunt' ? "Epic GameBoy Money Drop!" : "Lost iPhone 14 Pro"}
            required
            style={inputStyles}
          />
        </div>

        {/* Description */}
        <div style={sectionStyles}>
          <label style={labelStyles}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={bountyType === 'treasure_hunt' 
              ? "I've hidden a classic GameBoy with cash inside! Solve the clues and claim your prize!"
              : "Lost at Central Park near the fountain. Black case with cracked screen protector."}
            required
            style={textareaStyles}
          />
        </div>

        {/* Location */}
        <div style={sectionStyles}>
          <label style={labelStyles}>
            {bountyType === 'treasure_hunt' ? 'Hunt Area' : 'Last Seen Location'}
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Downtown Seattle, WA"
            required
            style={inputStyles}
          />
        </div>

        {/* Treasure Hunt Specific */}
        {bountyType === 'treasure_hunt' && (
          <>
            <div style={sectionStyles}>
              <label style={labelStyles}>Search Radius (miles)</label>
              <input
                type="number"
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(e.target.value)}
                min="0.1"
                max="5"
                step="0.1"
                style={inputStyles}
              />
            </div>

            <div style={sectionStyles}>
              <label style={labelStyles}>Duration (hours)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                max="24"
                style={inputStyles}
              />
            </div>

            <div style={sectionStyles}>
              <label style={labelStyles}>Clue 1 (Immediate)</label>
              <input
                type="text"
                value={clue1}
                onChange={(e) => setClue1(e.target.value)}
                placeholder="Near the place where tech giants were born 🏢"
                required
                style={inputStyles}
              />
            </div>

            <div style={sectionStyles}>
              <label style={labelStyles}>Clue 2 (Unlocks after 2 hours)</label>
              <input
                type="text"
                value={clue2}
                onChange={(e) => setClue2(e.target.value)}
                placeholder="Look for the red bench facing the waterfront 🌊"
                style={inputStyles}
              />
            </div>

            <div style={sectionStyles}>
              <label style={labelStyles}>Clue 3 (Unlocks after 4 hours)</label>
              <input
                type="text"
                value={clue3}
                onChange={(e) => setClue3(e.target.value)}
                placeholder="Behind the 3rd trash can from the coffee shop ☕"
                style={inputStyles}
              />
            </div>
          </>
        )}

        {/* Reward Type */}
        <div style={sectionStyles}>
          <label style={labelStyles}>Reward Type</label>
          <div style={toggleStyles}>
            <button
              type="button"
              style={toggleButtonStyles(rewardType === 'monetary')}
              onClick={() => setRewardType('monetary')}
            >
              💰 Cash Reward
            </button>
            <button
              type="button"
              style={toggleButtonStyles(rewardType === 'inventory')}
              onClick={() => setRewardType('inventory')}
            >
              🔄 Inventory Trade
            </button>
          </div>
        </div>

        {/* Monetary Amount */}
        {rewardType === 'monetary' && (
          <div style={sectionStyles}>
            <label style={labelStyles}>Reward Amount (USD)</label>
            <input
              type="number"
              value={monetaryAmount}
              onChange={(e) => setMonetaryAmount(e.target.value)}
              min="5"
              max="200"
              step="5"
              required
              style={inputStyles}
            />
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-2)', marginTop: 'var(--space-2)' }}>
              💳 Payment will be validated. Payout happens instantly via Visa Direct when verified.
            </p>
          </div>
        )}

        {error && (
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-error)20',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/lost-and-found')}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? <LoadingSpinner /> : `Create ${bountyType === 'treasure_hunt' ? 'Treasure Hunt' : 'Bounty'}`}
          </Button>
        </div>
      </form>
    </div>
  );
}

