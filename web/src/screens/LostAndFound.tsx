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
    category: string;
    huntArea: {
      address: string;
      radiusMiles: number;
    };
    startTime: string;
    endTime: string;
    difficulty: string;
    clues: any[];
  };
  lostItem?: {
    title: string;
    description: string;
    category: string;
    lastSeenLocation: {
      address: string;
    };
  };
  rewardType: 'monetary' | 'inventory';
  monetaryReward?: {
    amount: number;
    currency: string;
  };
  creator?: {
    username: string;
    avatar: string;
    level: number;
  };
  treasureStats?: {
    activeHunters: number;
  };
  viewCount: number;
  createdAt: string;
}

export default function LostAndFound() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'lost' | 'treasure'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadBounties();
  }, [tab]);

  async function loadBounties() {
    setLoading(true);
    try {
      const filters: any = { status: 'active' };
      if (tab === 'lost') filters.bountyType = 'lost_item';
      if (tab === 'treasure') filters.bountyType = 'treasure_hunt';
      
      const result = await api.bounties.list(filters);
      setBounties(result.bounties || []);
    } catch (error) {
      console.error('Failed to load bounties:', error);
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
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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

  const tabsStyles: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-4)',
    borderBottom: '2px solid var(--color-border)',
  };

  const tabButtonStyles = (active: boolean): CSSProperties => ({
    padding: 'var(--space-3) var(--space-4)',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 'var(--text-body)',
    fontWeight: active ? 'var(--font-bold)' : 'var(--font-medium)',
    color: active ? 'var(--color-brand)' : 'var(--color-text-2)',
    borderBottom: active ? '2px solid var(--color-brand)' : '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s ease',
  });

  const bountyGridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
  };

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={titleContainerStyles}>
          <div style={titleGroupStyles}>
            <span style={iconStyles}>🔍</span>
            <h1 style={titleStyles}>Lost & Found Bounty</h1>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              onClick={() => navigate('/my-bounties')}
              variant="secondary"
            >
              📋 My Bounties
            </Button>
            <Button
              onClick={() => navigate('/create-bounty')}
              variant="primary"
            >
              + Create Bounty
            </Button>
          </div>
        </div>
        <p style={subtitleStyles}>
          Find lost items or hunt for hidden treasures!
        </p>
      </div>

      {/* Tabs */}
      <div style={tabsStyles}>
        <button
          style={tabButtonStyles(tab === 'all')}
          onClick={() => setTab('all')}
        >
          🌟 All Bounties
        </button>
        <button
          style={tabButtonStyles(tab === 'treasure')}
          onClick={() => setTab('treasure')}
        >
          🎮 Treasure Hunts
        </button>
        <button
          style={tabButtonStyles(tab === 'lost')}
          onClick={() => setTab('lost')}
        >
          📦 Lost Items
        </button>
      </div>

      {/* Bounty List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-10)' }}>
          <LoadingSpinner />
        </div>
      ) : bounties.length === 0 ? (
        <div style={emptyStyles}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>
            {tab === 'treasure' ? '🎯' : tab === 'lost' ? '📦' : '🔍'}
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No bounties yet</h3>
          <p>Be the first to create one!</p>
        </div>
      ) : (
        <div style={bountyGridStyles}>
          {bounties.map(bounty => (
            <div
              key={bounty.id}
              style={bountyCardStyles}
              onClick={() => navigate(`/bounty/${bounty.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--color-brand)';
                e.currentTarget.style.boxShadow = 'var(--shadow-s3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-s1)';
              }}
            >
              {/* Type Badge */}
              <div style={{
                display: 'inline-block',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-md)',
                background: bounty.bountyType === 'treasure_hunt' ? 'var(--color-accent-purple)20' : 'var(--color-accent-blue)20',
                color: bounty.bountyType === 'treasure_hunt' ? 'var(--color-accent-purple)' : 'var(--color-accent-blue)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-bold)',
                marginBottom: 'var(--space-3)',
              }}>
                {bounty.bountyType === 'treasure_hunt' ? '🎮 TREASURE HUNT' : '📦 LOST ITEM'}
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

              {/* Location */}
              <div style={{
                fontSize: 'var(--text-small)',
                color: 'var(--color-text-2)',
                marginBottom: 'var(--space-3)',
              }}>
                📍 {bounty.bountyType === 'treasure_hunt' 
                  ? `${bounty.treasureHunt?.huntArea.address} (${bounty.treasureHunt?.huntArea.radiusMiles} mi)`
                  : bounty.lostItem?.lastSeenLocation.address}
              </div>

              {/* Reward */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3)',
                background: 'var(--color-accent-yellow)20',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-3)',
              }}>
                <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-text-1)' }}>
                  💰 {bounty.rewardType === 'monetary' 
                    ? `$${bounty.monetaryReward?.amount} ${bounty.monetaryReward?.currency}`
                    : 'Inventory Trade'}
                </span>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-2)',
              }}>
                <span>{bounty.creator?.avatar} {bounty.creator?.username}</span>
                <span>👁️ {bounty.viewCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

