import { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Trade, InventoryItem } from '../../types';
import Button from '../ui/Button';
import { formatValue } from '../../utils/tradeRating';

interface TradeOfferCardProps {
  trade: Trade;
  isReceiver: boolean; // Is the current user the receiver of this offer?
  onAccept?: () => void;
  onDecline?: () => void;
  onCounter?: () => void;
}

export default function TradeOfferCard({ 
  trade, 
  isReceiver, 
  onAccept, 
  onDecline, 
  onCounter 
}: TradeOfferCardProps) {
  const navigate = useNavigate();
  
  const myOffer = isReceiver ? trade.offerB : trade.offerA;
  const theirOffer = isReceiver ? trade.offerA : trade.offerB;
  const sender = isReceiver ? trade.fromUser : trade.toUser;
  
  const containerStyles: CSSProperties = {
    background: 'var(--color-surface)',
    border: '3px solid var(--color-brand)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    boxShadow: 'var(--shadow-s2)',
    marginBottom: 'var(--space-3)',
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-3)',
    borderBottom: '2px solid var(--color-border)',
  };

  const statusBadgeStyles = (status: Trade['status']): CSSProperties => {
    const colors = {
      proposed: { bg: 'var(--color-accent-yellow)', text: 'var(--color-text-1)' },
      accepted: { bg: 'var(--color-rating-great-bg)', text: 'var(--color-rating-great-text)' },
      declined: { bg: 'var(--color-rating-bad-bg)', text: 'var(--color-rating-bad-text)' },
      countered: { bg: 'var(--color-accent-blue)', text: 'white' },
      completed: { bg: 'var(--color-rating-great-bg)', text: 'var(--color-rating-great-text)' },
      draft: { bg: 'var(--color-gray-200)', text: 'var(--color-text-2)' },
      canceled: { bg: 'var(--color-gray-200)', text: 'var(--color-text-2)' },
    };
    
    const color = colors[status] || colors.proposed;
    
    return {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 'var(--radius-pill)',
      background: color.bg,
      color: color.text,
      fontSize: 'var(--text-small)',
      fontWeight: 'var(--font-bold)',
      textTransform: 'capitalize',
    };
  };

  const offersGridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
    alignItems: 'center',
  };

  const offerBoxStyles = (color: string): CSSProperties => ({
    background: color,
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3)',
    border: '2px solid var(--color-border)',
  });

  const itemStyles: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
    padding: 'var(--space-2)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: 'var(--space-2)',
    fontSize: 'var(--text-small)',
  };

  const imageStyles: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
    border: '1px solid var(--color-border)',
  };

  const fairnessBarStyles: CSSProperties = {
    width: '100%',
    height: '8px',
    background: 'var(--color-gray-200)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    marginTop: 'var(--space-2)',
  };

  const fairnessColor = trade.fairness.warn
    ? 'var(--color-rating-bad)'
    : trade.fairness.fairness >= 0.9
    ? 'var(--color-rating-great)'
    : 'var(--color-rating-fair)';

  function renderItems(items: InventoryItem[], title: string) {
    return (
      <div>
        <h4 style={{ 
          fontSize: 'var(--text-small)', 
          fontWeight: 'var(--font-bold)', 
          marginBottom: 'var(--space-2)',
          color: 'var(--color-text-1)',
        }}>
          {title}
        </h4>
        {items.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--color-text-2)', 
            fontSize: 'var(--text-small)',
            padding: 'var(--space-3)',
          }}>
            No items
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} style={itemStyles}>
              <img 
                src={item.images[0]} 
                alt={item.title} 
                style={imageStyles}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: '2px' }}>
                  {item.title}
                </div>
                <div style={{ color: 'var(--color-brand-ink)', fontWeight: 'var(--font-bold)' }}>
                  {formatValue(item.valuation.estimate.mid)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <div style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-1)' }}>
            🔄 Trade Offer {isReceiver && 'from'} {isReceiver ? sender.username : trade.toUser.username}
          </div>
          {trade.message && (
            <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-2)', marginTop: 'var(--space-1)' }}>
              "{trade.message}"
            </div>
          )}
        </div>
        <div style={statusBadgeStyles(trade.status)}>
          {trade.status}
        </div>
      </div>

      {/* Trade Details */}
      <div style={offersGridStyles}>
        {/* Their Offer (what they're giving you) */}
        <div style={offerBoxStyles('var(--color-accent-purple)20')}>
          {renderItems(theirOffer.items, isReceiver ? 'They Offer' : 'You Requested')}
          <div style={{ 
            marginTop: 'var(--space-2)', 
            paddingTop: 'var(--space-2)', 
            borderTop: '1px solid var(--color-border)',
            fontWeight: 'var(--font-bold)',
            fontSize: 'var(--text-base)',
          }}>
            Total: {formatValue(theirOffer.totalValue)}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ fontSize: '32px', color: 'var(--color-brand)' }}>
          {isReceiver ? '→' : '←'}
        </div>

        {/* Your Offer (what you're giving them) */}
        <div style={offerBoxStyles('var(--color-accent-blue)20')}>
          {renderItems(myOffer.items, isReceiver ? 'They Requested' : 'You Offer')}
          <div style={{ 
            marginTop: 'var(--space-2)', 
            paddingTop: 'var(--space-2)', 
            borderTop: '1px solid var(--color-border)',
            fontWeight: 'var(--font-bold)',
            fontSize: 'var(--text-base)',
          }}>
            Total: {formatValue(myOffer.totalValue)}
          </div>
        </div>
      </div>

      {/* Fairness Indicator */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--space-2)',
          fontSize: 'var(--text-small)',
        }}>
          <span style={{ fontWeight: 'var(--font-semibold)' }}>Trade Fairness:</span>
          <span style={{ 
            fontWeight: 'var(--font-bold)', 
            color: fairnessColor,
            textTransform: 'uppercase',
          }}>
            {trade.fairness.warn ? 'Unfair' : trade.fairness.fairness >= 0.9 ? 'Great' : 'Fair'}
          </span>
        </div>
        <div style={fairnessBarStyles}>
          <div style={{
            width: `${trade.fairness.fairness * 100}%`,
            height: '100%',
            background: fairnessColor,
            transition: 'width var(--transition-base)',
          }} />
        </div>
      </div>

      {/* Actions */}
      {isReceiver && trade.status === 'proposed' && (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button 
            variant="primary" 
            onClick={onAccept}
            style={{ flex: 1 }}
          >
            ✓ Accept Trade
          </Button>
          <Button 
            variant="secondary" 
            onClick={onCounter}
            style={{ flex: 1 }}
          >
            🔄 Counter Offer
          </Button>
          <Button 
            variant="secondary" 
            onClick={onDecline}
          >
            ✖️ Decline
          </Button>
        </div>
      )}

      {!isReceiver && trade.status === 'proposed' && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-3)', 
          background: 'var(--color-gray-100)', 
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-2)',
        }}>
          ⏳ Waiting for {trade.toUser.username} to respond...
        </div>
      )}

      {trade.status === 'accepted' && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-3)', 
          background: 'var(--color-rating-great-bg)', 
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-rating-great-text)',
          fontWeight: 'var(--font-bold)',
        }}>
          🎉 Trade Accepted! Plan your meetup to complete the trade.
        </div>
      )}

      {trade.status === 'declined' && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-3)', 
          background: 'var(--color-rating-bad-bg)', 
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-rating-bad-text)',
          fontWeight: 'var(--font-semibold)',
        }}>
          Trade was declined
        </div>
      )}
    </div>
  );
}

