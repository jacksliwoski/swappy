import { useState, useEffect, CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Bounty {
  id: string;
  userId: string;
  status: string;
  bountyType: 'lost_item' | 'treasure_hunt';
  treasureHunt?: any;
  lostItem?: any;
  rewardType: string;
  monetaryReward?: any;
  creator?: any;
  treasureStats?: any;
  viewCount: number;
  createdAt: string;
}

export default function BountyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimDescription, setClaimDescription] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadBounty();
    loadCurrentUser();
  }, [id]);

  async function loadCurrentUser() {
    try {
      const result = await api.auth.me();
      if (result.ok && result.user) {
        setCurrentUser(result.user);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  }

  async function loadBounty() {
    if (!id) return;
    
    setLoading(true);
    try {
      const result = await api.bounties.get(id);
      setBounty(result.bounty);
    } catch (error) {
      console.error('Failed to load bounty:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim() {
    if (!bounty || !id) return;
    
    setClaiming(true);
    try {
      const claimData = {
        proofOfPossession: {
          images: [],
          description: claimDescription,
          location: bounty.bountyType === 'treasure_hunt' 
            ? bounty.treasureHunt.huntArea.address 
            : bounty.lostItem.lastSeenLocation.address,
          foundDate: new Date().toISOString()
        }
      };

      const result = await api.bounties.claim(id, claimData);
      
      if (result.ok) {
        alert('🎉 Claim submitted! The bounty creator will review it.');
        navigate('/lost-and-found');
      }
    } catch (error: any) {
      alert('Failed to submit claim: ' + error.message);
    } finally {
      setClaiming(false);
    }
  }

  const containerStyles: CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: 'var(--space-6)',
  };

  const headerStyles: CSSProperties = {
    marginBottom: 'var(--space-6)',
  };

  const cardStyles: CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    border: '2px solid var(--color-border)',
    boxShadow: 'var(--shadow-s2)',
    marginBottom: 'var(--space-4)',
  };

  const badgeStyles = (type: string): CSSProperties => ({
    display: 'inline-block',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    background: type === 'treasure_hunt' ? 'var(--color-accent-purple)20' : 'var(--color-accent-blue)20',
    color: type === 'treasure_hunt' ? 'var(--color-accent-purple)' : 'var(--color-accent-blue)',
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--font-bold)',
    marginBottom: 'var(--space-4)',
  });

  const rewardBoxStyles: CSSProperties = {
    padding: 'var(--space-4)',
    background: 'var(--color-accent-yellow)20',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-accent-yellow)',
    textAlign: 'center',
    marginBottom: 'var(--space-4)',
  };

  const clueBoxStyles: CSSProperties = {
    background: 'var(--color-bg)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-3)',
    border: '2px solid var(--color-border)',
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-10)' }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div style={containerStyles}>
        <div style={cardStyles}>
          <h2>Bounty not found</h2>
          <Button onClick={() => navigate('/lost-and-found')}>
            Back to Bounties
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && bounty.userId === currentUser.id;
  const isTreasureHunt = bounty.bountyType === 'treasure_hunt';
  const data = isTreasureHunt ? bounty.treasureHunt : bounty.lostItem;

  return (
    <div style={containerStyles}>
      <Button
        onClick={() => navigate('/lost-and-found')}
        variant="secondary"
        style={{ marginBottom: 'var(--space-4)' }}
      >
        ← Back
      </Button>

      <div style={cardStyles}>
        {/* Badge */}
        <div style={badgeStyles(bounty.bountyType)}>
          {isTreasureHunt ? '🎮 TREASURE HUNT' : '📦 LOST ITEM'}
        </div>

        {/* Status Badge */}
        {bounty.status !== 'active' && (
          <div style={{
            display: 'inline-block',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: bounty.status === 'completed' ? 'var(--color-success)20' : 'var(--color-error)20',
            color: bounty.status === 'completed' ? 'var(--color-success)' : 'var(--color-error)',
            fontSize: 'var(--text-small)',
            fontWeight: 'var(--font-bold)',
            marginLeft: 'var(--space-2)',
          }}>
            {bounty.status.toUpperCase()}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontSize: 'var(--text-h1)',
          fontWeight: 'var(--font-bold)',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-text-1)',
        }}>
          {data.title}
        </h1>

        {/* Creator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-text-2)',
        }}>
          <span style={{ fontSize: '24px' }}>{bounty.creator?.avatar}</span>
          <span>{bounty.creator?.username}</span>
          <span>• Lv{bounty.creator?.level}</span>
          <span>• 👁️ {bounty.viewCount} views</span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 'var(--text-body)',
          lineHeight: '1.6',
          marginBottom: 'var(--space-6)',
          color: 'var(--color-text-1)',
        }}>
          {data.description}
        </p>

        {/* Location */}
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
        }}>
          <h3 style={{ marginBottom: 'var(--space-2)', color: 'var(--color-text-1)' }}>
            📍 {isTreasureHunt ? 'Hunt Area' : 'Last Seen'}
          </h3>
          <p style={{ color: 'var(--color-text-2)' }}>
            {isTreasureHunt ? data.huntArea.address : data.lastSeenLocation.address}
          </p>
          {isTreasureHunt && (
            <p style={{ color: 'var(--color-text-2)', marginTop: 'var(--space-1)' }}>
              Radius: {data.huntArea.radiusMiles} miles
            </p>
          )}
        </div>

        {/* Treasure Hunt Clues */}
        {isTreasureHunt && data.clues && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-1)' }}>
              🗺️ Clues
            </h3>
            {data.clues.map((clue: any, index: number) => {
              const isUnlocked = clue.unlockAt === 'immediate' || new Date(clue.unlockAt) <= new Date();
              
              return (
                <div key={clue.id} style={clueBoxStyles}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-2)',
                  }}>
                    <strong style={{ color: 'var(--color-text-1)' }}>Clue {index + 1}</strong>
                    {isUnlocked ? (
                      <span style={{ color: 'var(--color-success)', fontSize: 'var(--text-small)' }}>
                        🔓 Unlocked
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-small)' }}>
                        🔒 Locked
                      </span>
                    )}
                  </div>
                  <p style={{ color: isUnlocked ? 'var(--color-text-1)' : 'var(--color-text-2)' }}>
                    {isUnlocked ? clue.text : 'Will unlock later...'}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Reward */}
        <div style={rewardBoxStyles}>
          <h3 style={{ marginBottom: 'var(--space-2)', color: 'var(--color-text-1)' }}>
            💰 Reward
          </h3>
          <div style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-1)' }}>
            {bounty.rewardType === 'monetary' 
              ? `$${bounty.monetaryReward.amount} ${bounty.monetaryReward.currency}`
              : 'Inventory Trade'}
          </div>
          <p style={{ fontSize: 'var(--text-small)', marginTop: 'var(--space-2)', color: 'var(--color-text-2)' }}>
            {bounty.rewardType === 'monetary' 
              ? '⚡ Instant payout via Visa Direct'
              : '🔄 Choose from available items'}
          </p>
        </div>

        {/* Active Hunters (Treasure Hunt) */}
        {isTreasureHunt && bounty.treasureStats && (
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-accent-blue)20',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            marginBottom: 'var(--space-4)',
          }}>
            <span style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-bold)' }}>
              🏃 {bounty.treasureStats.activeHunters} hunters searching right now!
            </span>
          </div>
        )}

        {/* Claim Form */}
        {!isOwner && bounty.status === 'active' && (
          <div>
            {!showClaimForm ? (
              <Button
                onClick={() => setShowClaimForm(true)}
                variant="primary"
                style={{ width: '100%' }}
              >
                {isTreasureHunt ? '🎯 I Found It!' : '📦 I Have This Item'}
              </Button>
            ) : (
              <div style={{
                padding: 'var(--space-4)',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--color-brand)',
              }}>
                <h3 style={{ marginBottom: 'var(--space-3)' }}>Submit Your Claim</h3>
                
                <textarea
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  placeholder="Describe where you found it, any details that prove it's yours..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--color-border)',
                    fontFamily: 'inherit',
                    fontSize: 'var(--text-body)',
                    marginBottom: 'var(--space-3)',
                  }}
                />

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <Button
                    onClick={() => setShowClaimForm(false)}
                    variant="secondary"
                    disabled={claiming}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleClaim}
                    variant="primary"
                    disabled={claiming || !claimDescription}
                    style={{ flex: 1 }}
                  >
                    {claiming ? <LoadingSpinner /> : 'Submit Claim'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {isOwner && (
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--color-accent-purple)20',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}>
            <p style={{ fontWeight: 'var(--font-semibold)' }}>
              This is your bounty. You'll be notified when someone claims it!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

