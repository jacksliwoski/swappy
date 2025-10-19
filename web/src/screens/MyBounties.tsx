import { useState, useEffect, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

interface Bounty {
  id: string;
  userId: string;
  status: string;
  bountyType: 'lost_item' | 'treasure_hunt';
  treasureHunt?: {
    title: string;
    description: string;
  };
  lostItem?: {
    title: string;
    description: string;
  };
  rewardType: 'monetary' | 'inventory';
  monetaryReward?: {
    amount: number;
    currency: string;
  };
  viewCount: number;
  claimCount: number;
  createdAt: string;
}

export default function MyBounties() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyBounties();
  }, []);

  async function loadMyBounties() {
    setLoading(true);
    try {
      const result = await api.bounties.getMyBounties();
      setBounties(result.bounties || []);
    } catch (error) {
      console.error('Failed to load my bounties:', error);
      setBounties([]);
    } finally {
      setLoading(false);
    }
  }

  const containerStyles: CSSProperties = {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: 'var(--container-gutter)',
    paddingTop: 'var(--space-6)',
  };

  const headerStyles: CSSProperties = {
    marginBottom: 'var(--space-6)',
  };

  const titleContainerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-2)',
  };

  const titleGroupStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  };

  const iconStyles: CSSProperties = {
    fontSize: '32px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-2)',
  };

  const titleStyles: CSSProperties = {
    fontSize: 'var(--text-h1)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-text-1)',
    margin: 0,
  };

  const subtitleStyles: CSSProperties = {
    fontSize: 'var(--text-body)',
    color: 'var(--color-text-2)',
    fontWeight: 'var(--font-medium)',
  };

  const bountyListStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  };

  const bountyCardStyles: CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    border: '2px solid var(--color-border)',
    boxShadow: 'var(--shadow-s1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const emptyStyles: CSSProperties = {
    textAlign: 'center',
    padding: 'var(--space-10)',
    color: 'var(--color-text-2)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-border)',
  };

  const statusBadgeStyles = (status: string): CSSProperties => ({
    display: 'inline-block',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-pill)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-bold)',
    background:
      status === 'active' ? 'var(--color-accent-green)20' :
      status === 'completed' ? 'var(--color-accent-blue)20' :
      status === 'in_verification' ? 'var(--color-accent-yellow)20' :
      'var(--color-border)',
    color:
      status === 'active' ? 'var(--color-accent-green)' :
      status === 'completed' ? 'var(--color-accent-blue)' :
      status === 'in_verification' ? 'var(--color-accent-yellow)' :
      'var(--color-text-2)',
  });

  const notificationBadgeStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-2) var(--space-3)',
    background: 'var(--color-accent-coral)20',
    color: 'var(--color-accent-coral)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--font-bold)',
  };

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={titleContainerStyles}>
          <div style={titleGroupStyles}>
            <span style={iconStyles}>📋</span>
            <h1 style={titleStyles}>My Bounties</h1>
          </div>
          <Button
            onClick={() => navigate('/lost-and-found')}
            variant="secondary"
          >
            ← Back to All Bounties
          </Button>
        </div>
        <p style={subtitleStyles}>
          View and manage your posted bounties
        </p>
      </div>

      {/* Bounty List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-10)' }}>
          <LoadingSpinner />
        </div>
      ) : bounties.length === 0 ? (
        <div style={emptyStyles}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>
            📦
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No bounties yet</h3>
          <p style={{ marginBottom: 'var(--space-4)' }}>Create your first bounty to get started!</p>
          <Button
            onClick={() => navigate('/create-bounty')}
            variant="primary"
          >
            + Create Bounty
          </Button>
        </div>
      ) : (
        <div style={bountyListStyles}>
          {bounties.map(bounty => (
            <div
              key={bounty.id}
              style={bountyCardStyles}
              onClick={() => navigate(`/bounty/${bounty.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--color-brand)';
                e.currentTarget.style.boxShadow = 'var(--shadow-s3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-s1)';
              }}
            >
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div style={{ flex: 1 }}>
                  {/* Type Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    background: bounty.bountyType === 'treasure_hunt' ? 'var(--color-accent-purple)20' : 'var(--color-accent-blue)20',
                    color: bounty.bountyType === 'treasure_hunt' ? 'var(--color-accent-purple)' : 'var(--color-accent-blue)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-bold)',
                    marginBottom: 'var(--space-2)',
                    marginRight: 'var(--space-2)',
                  }}>
                    {bounty.bountyType === 'treasure_hunt' ? '🎮 TREASURE HUNT' : '📦 LOST ITEM'}
                  </div>

                  {/* Status Badge */}
                  <div style={statusBadgeStyles(bounty.status)}>
                    {bounty.status.toUpperCase().replace('_', ' ')}
                  </div>
                </div>

                {/* Notification Badge */}
                {bounty.claimCount > 0 && (
                  <div style={notificationBadgeStyles}>
                    🔔 {bounty.claimCount} {bounty.claimCount === 1 ? 'Claim' : 'Claims'}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: 'var(--text-h3)',
                fontWeight: 'var(--font-bold)',
                marginBottom: 'var(--space-2)',
                color: 'var(--color-text-1)',
              }}>
                {bounty.bountyType === 'treasure_hunt' ? bounty.treasureHunt?.title : bounty.lostItem?.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-2)',
                marginBottom: 'var(--space-3)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {bounty.bountyType === 'treasure_hunt' ? bounty.treasureHunt?.description : bounty.lostItem?.description}
              </p>

              {/* Stats Row */}
              <div style={{
                display: 'flex',
                gap: 'var(--space-4)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-text-2)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  💰 {bounty.rewardType === 'monetary'
                    ? `$${bounty.monetaryReward?.amount} ${bounty.monetaryReward?.currency}`
                    : 'Inventory Trade'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  👁️ {bounty.viewCount} views
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  📅 {new Date(bounty.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
