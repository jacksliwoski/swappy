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

interface Claim {
  id: string;
  bountyId: string;
  claimerId: string;
  status: string;
  proofOfPossession: {
    images: string[];
    description: string;
    location: string;
    foundDate: string;
  };
  claimer?: {
    id: string;
    username: string;
    avatar: string;
    level: number;
  };
  createdAt: string;
}

export default function MyBounties() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [processing, setProcessing] = useState(false);
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

  async function viewClaims(bounty: Bounty, e: React.MouseEvent) {
    e.stopPropagation();
    if (bounty.claimCount === 0) return;

    setSelectedBounty(bounty);
    setLoadingClaims(true);
    try {
      const result = await api.bounties.getClaims(bounty.id);
      setClaims(result.claims || []);
    } catch (error) {
      console.error('Failed to load claims:', error);
      setClaims([]);
    } finally {
      setLoadingClaims(false);
    }
  }

  async function handleVerifyClaim(claim: Claim, confirmed: boolean) {
    if (!selectedBounty) return;

    const action = confirmed ? 'approve and send payment' : 'reject';
    if (!confirm(`Are you sure you want to ${action} for this claim?`)) return;

    setProcessing(true);
    try {
      const result = await api.bounties.verify(selectedBounty.id, {
        claimId: claim.id,
        confirmed,
        rating: confirmed ? 5 : undefined,
        review: confirmed ? 'Thank you!' : 'Does not match requirements'
      });

      if (result.ok) {
        alert(confirmed
          ? '✅ Payment sent! The bounty is now completed.'
          : '❌ Claim rejected.');
        setSelectedBounty(null);
        setClaims([]);
        loadMyBounties(); // Refresh bounties
      }
    } catch (error: any) {
      alert('Failed to process claim: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleOpenChat(claim: Claim) {
    if (!claim.claimer) return;
    try {
      // Ensure conversation exists between current user (me) and claimer
      const meRes = await api.auth.me();
      if (!meRes.ok || !meRes.user) return;
      const myId = meRes.user.id;

      const ensure = await api.messages.ensureConversation(myId, claim.claimer.id);
      const convId = ensure.conversationId || ensure.id || ensure.convId;
      if (convId) {
        // Navigate to messages screen for that conversation
        navigate(`/messages/${convId}`);
      } else {
        console.warn('No conversation id returned from ensureConversation', ensure);
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  }

  async function handleCloseClaim(claim: Claim) {
    if (!selectedBounty) return;
    if (!confirm('Delete this claim? This cannot be undone.')) return;
    setProcessing(true);
    try {
      const res = await api.bounties.deleteClaim(selectedBounty.id, claim.id);
      if (res.ok) {
        alert('Claim deleted');
        // refresh claims
        const result = await api.bounties.getClaims(selectedBounty.id);
        setClaims(result.claims || []);
        loadMyBounties();
      } else {
        alert('Failed to delete claim: ' + (res.error || 'unknown'));
      }
    } catch (err: any) {
      alert('Failed to delete claim: ' + err.message);
    } finally {
      setProcessing(false);
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
    cursor: 'pointer',
  };

  const modalOverlayStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 'var(--space-4)',
  };

  const modalContentStyles: CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '2px solid var(--color-border)',
    boxShadow: 'var(--shadow-s3)',
  };

  const claimCardStyles: CSSProperties = {
    background: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
    border: '2px solid var(--color-border)',
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
              onClick={() => bounty.claimCount > 0 ? null : navigate(`/bounty/${bounty.id}`)}
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

                {/* Notification Badge - Clickable to view claims */}
                {bounty.claimCount > 0 && (
                  <div
                    style={notificationBadgeStyles}
                    onClick={(e) => viewClaims(bounty, e)}
                  >
                    🔔 {bounty.claimCount} {bounty.claimCount === 1 ? 'Claim' : 'Claims'} - Click to Review
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

      {/* Claims Modal */}
      {selectedBounty && (
        <div style={modalOverlayStyles} onClick={() => setSelectedBounty(null)}>
          <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                Claims for: {selectedBounty.bountyType === 'treasure_hunt' ? selectedBounty.treasureHunt?.title : selectedBounty.lostItem?.title}
              </h2>
              <p style={{ color: 'var(--color-text-2)' }}>
                Review and approve claims to send instant payment via Visa Direct
              </p>
            </div>

            {loadingClaims ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-10)' }}>
                <LoadingSpinner />
              </div>
            ) : claims.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-2)' }}>
                No claims yet
              </p>
            ) : (
              claims.map(claim => (
                <div key={claim.id} style={claimCardStyles}>
                  {/* Claimer Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontSize: '24px' }}>{claim.claimer?.avatar || '😊'}</span>
                    <div>
                      <div style={{ fontWeight: 'var(--font-bold)' }}>{claim.claimer?.username || 'Unknown'}</div>
                      <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-2)' }}>
                        Level {claim.claimer?.level || 1} • {new Date(claim.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div style={{
                      marginLeft: 'auto',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-bold)',
                      background: claim.status === 'verified' ? 'var(--color-accent-green)20' : 'var(--color-accent-yellow)20',
                      color: claim.status === 'verified' ? 'var(--color-accent-green)' : 'var(--color-accent-yellow)',
                    }}>
                      {claim.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Proof Details */}
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>📝 Description:</div>
                    <p style={{ color: 'var(--color-text-2)', marginBottom: 'var(--space-2)' }}>
                      {claim.proofOfPossession.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--text-small)' }}>
                      <div>
                        <strong>📍 Location:</strong> {claim.proofOfPossession.location}
                      </div>
                      <div>
                        <strong>📅 Found:</strong> {new Date(claim.proofOfPossession.foundDate).toLocaleString()}
                      </div>
                    </div>

                    {claim.proofOfPossession.images && claim.proofOfPossession.images.length > 0 && (
                      <div style={{ marginTop: 'var(--space-2)' }}>
                        <strong>📸 Images:</strong> {claim.proofOfPossession.images.length} attached
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                    <Button
                      onClick={() => handleOpenChat(claim)}
                      variant="primary"
                      disabled={processing}
                      style={{ flex: 1 }}
                    >
                      💬 Open
                    </Button>

                    <Button
                      onClick={() => handleCloseClaim(claim)}
                      variant="secondary"
                      disabled={processing}
                      style={{ flex: 1 }}
                    >
                      🗑️ Close
                    </Button>
                  </div>
                </div>
              ))
            )}

            {/* Close Button */}
            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
              <Button onClick={() => setSelectedBounty(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
