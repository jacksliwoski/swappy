import { useState, useEffect, CSSProperties } from 'react';
import { api } from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface GuardianAlert {
  id: string;
  type: 'trade_unfair' | 'chat_safety' | 'meetup_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  childUsername: string;
  childUserId: string;
  title: string;
  description: string;
  details: any;
  acknowledged: boolean;
}

export default function GuardianDashboard() {
  const [alerts, setAlerts] = useState<GuardianAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trade_unfair' | 'chat_safety' | 'meetup_detected'>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserAndAlerts();
  }, []);

  async function loadUserAndAlerts() {
    try {
      const userRes = await api.auth.me();
      if (userRes.ok && userRes.user) {
        setCurrentUser(userRes.user);
        await loadAlerts(userRes.user.id);
      }
    } catch (error) {
      console.error('[Guardian] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAlerts(guardianId: string) {
    try {
      const result = await api.guardian.getAlerts(guardianId);
      setAlerts(result.alerts || []);
    } catch (error) {
      console.error('[Guardian] Failed to load alerts:', error);
      setAlerts([]);
    }
  }

  async function handleAcknowledge(alertId: string) {
    try {
      await api.guardian.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, acknowledged: true } : a
      ));
    } catch (error) {
      console.error('[Guardian] Failed to acknowledge alert:', error);
    }
  }

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filter);

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  // Styles
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
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-2)',
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

  const statsRowStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-6)',
  };

  const statCardStyles: CSSProperties = {
    background: 'var(--color-surface)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    boxShadow: 'var(--shadow-s1)',
  };

  const statLabelStyles: CSSProperties = {
    fontSize: 'var(--text-small)',
    color: 'var(--color-text-2)',
    fontWeight: 'var(--font-semibold)',
    marginBottom: 'var(--space-1)',
  };

  const statValueStyles: CSSProperties = {
    fontSize: '32px',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-text-1)',
  };

  const filterRowStyles: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-6)',
    flexWrap: 'wrap',
  };

  const filterButtonStyles = (isActive: boolean): CSSProperties => ({
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-pill)',
    border: '2px solid',
    borderColor: isActive ? 'var(--color-brand)' : 'var(--color-border)',
    background: isActive ? 'var(--color-brand-tint)' : 'var(--color-surface)',
    color: isActive ? 'var(--color-brand)' : 'var(--color-text-2)',
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--font-semibold)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const alertsListStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  };

  const emptyStateStyles: CSSProperties = {
    textAlign: 'center',
    padding: 'var(--space-10) var(--space-6)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-border)',
    boxShadow: 'var(--shadow-s1)',
  };

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'trade_unfair': return '⚖️';
      case 'chat_safety': return '🛡️';
      case 'meetup_detected': return '📍';
      default: return '🔔';
    }
  }

  function getTypeName(type: string) {
    switch (type) {
      case 'trade_unfair': return 'Unfair Trade Alert';
      case 'chat_safety': return 'Chat Safety Flag';
      case 'meetup_detected': return 'Meetup Discussion';
      default: return 'Alert';
    }
  }

  function renderAlertCard(alert: GuardianAlert) {
    const severityColor = getSeverityColor(alert.severity);
    
    const cardStyles: CSSProperties = {
      background: 'var(--color-surface)',
      border: `2px solid ${alert.acknowledged ? 'var(--color-border)' : severityColor}`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      boxShadow: alert.acknowledged ? 'var(--shadow-s1)' : `0 4px 12px ${severityColor}40`,
      opacity: alert.acknowledged ? 0.7 : 1,
      transition: 'all 0.3s ease',
    };

    const headerRowStyles: CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 'var(--space-3)',
    };

    const typeTagStyles: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      padding: 'var(--space-1) var(--space-3)',
      background: `${severityColor}20`,
      color: severityColor,
      borderRadius: 'var(--radius-pill)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--font-bold)',
    };

    const timestampStyles: CSSProperties = {
      fontSize: 'var(--text-xs)',
      color: 'var(--color-text-3)',
      fontWeight: 'var(--font-medium)',
    };

    const titleTextStyles: CSSProperties = {
      fontSize: 'var(--text-h4)',
      fontWeight: 'var(--font-bold)',
      color: 'var(--color-text-1)',
      marginBottom: 'var(--space-2)',
    };

    const descriptionStyles: CSSProperties = {
      fontSize: 'var(--text-body)',
      color: 'var(--color-text-2)',
      lineHeight: '1.6',
      marginBottom: 'var(--space-3)',
    };

    const detailsBoxStyles: CSSProperties = {
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3)',
      marginBottom: 'var(--space-3)',
      fontSize: 'var(--text-small)',
    };

    const buttonStyles: CSSProperties = {
      padding: 'var(--space-2) var(--space-4)',
      background: alert.acknowledged ? 'var(--color-border)' : 'var(--color-brand)',
      color: alert.acknowledged ? 'var(--color-text-3)' : 'white',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--text-small)',
      fontWeight: 'var(--font-semibold)',
      cursor: alert.acknowledged ? 'default' : 'pointer',
      transition: 'all 0.2s ease',
    };

    return (
      <div key={alert.id} style={cardStyles}>
        <div style={headerRowStyles}>
          <span style={typeTagStyles}>
            {getSeverityIcon(alert.severity)} {getTypeName(alert.type)}
          </span>
          <span style={timestampStyles}>
            {new Date(alert.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div style={titleTextStyles}>
          {getTypeIcon(alert.type)} {alert.title}
        </div>

        <div style={descriptionStyles}>{alert.description}</div>

        {alert.details && (
          <div style={detailsBoxStyles}>
            <div style={{ fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
              Details:
            </div>
            {alert.type === 'trade_unfair' && (
              <div>
                <div>• Fairness Score: {Math.round((alert.details.fairness || 0) * 100)}%</div>
                <div>• {alert.childUsername}'s Items Value: ${alert.details.childValue || 0}</div>
                <div>• Other User's Items Value: ${alert.details.otherValue || 0}</div>
                <div>• Trading With: {alert.details.otherUsername}</div>
              </div>
            )}
            {alert.type === 'chat_safety' && (
              <div>
                <div>• Moderation Action: <strong>{alert.details.action?.toUpperCase()}</strong></div>
                <div>• Tags: {alert.details.tags?.join(', ')}</div>
                <div>• AI Tip: {alert.details.tip}</div>
                {alert.details.otherUsername && (
                  <div>• Conversation With: {alert.details.otherUsername}</div>
                )}
              </div>
            )}
            {alert.type === 'meetup_detected' && (
              <div>
                <div>• Message: "{alert.details.message}"</div>
                <div>• Conversation With: {alert.details.otherUsername}</div>
                {alert.details.keywords && (
                  <div>• Keywords Detected: {alert.details.keywords.join(', ')}</div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => !alert.acknowledged && handleAcknowledge(alert.id)}
          style={buttonStyles}
          disabled={alert.acknowledged}
        >
          {alert.acknowledged ? '✓ Acknowledged' : 'Acknowledge'}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...containerStyles, display: 'flex', justifyContent: 'center', padding: 'var(--space-10)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={titleContainerStyles}>
          <span style={iconStyles}>👨‍👩‍👧</span>
          <h1 style={titleStyles}>Guardian Dashboard</h1>
        </div>
        <p style={subtitleStyles}>
          Monitor your child's activity and safety alerts
        </p>
      </div>

      {/* Stats Row */}
      <div style={statsRowStyles}>
        <div style={statCardStyles}>
          <div style={statLabelStyles}>Total Alerts</div>
          <div style={statValueStyles}>{alerts.length}</div>
        </div>
        <div style={statCardStyles}>
          <div style={statLabelStyles}>Needs Attention</div>
          <div style={{ ...statValueStyles, color: unacknowledgedCount > 0 ? '#ef4444' : 'var(--color-success)' }}>
            {unacknowledgedCount}
          </div>
        </div>
        <div style={statCardStyles}>
          <div style={statLabelStyles}>Monitoring</div>
          <div style={statValueStyles}>{currentUser?.childUsername || 'anderson'}</div>
        </div>
      </div>

      {/* Filter Row */}
      <div style={filterRowStyles}>
        <button
          onClick={() => setFilter('all')}
          style={filterButtonStyles(filter === 'all')}
        >
          🔔 All ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('trade_unfair')}
          style={filterButtonStyles(filter === 'trade_unfair')}
        >
          ⚖️ Unfair Trades ({alerts.filter(a => a.type === 'trade_unfair').length})
        </button>
        <button
          onClick={() => setFilter('chat_safety')}
          style={filterButtonStyles(filter === 'chat_safety')}
        >
          🛡️ Safety Flags ({alerts.filter(a => a.type === 'chat_safety').length})
        </button>
        <button
          onClick={() => setFilter('meetup_detected')}
          style={filterButtonStyles(filter === 'meetup_detected')}
        >
          📍 Meetup Talk ({alerts.filter(a => a.type === 'meetup_detected').length})
        </button>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div style={emptyStateStyles}>
          <div style={{ fontSize: '56px', marginBottom: 'var(--space-4)' }}>✅</div>
          <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
            All Clear!
          </h2>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-2)' }}>
            No {filter === 'all' ? '' : getTypeName(filter)} alerts at the moment.
          </p>
        </div>
      ) : (
        <div style={alertsListStyles}>
          {filteredAlerts.map(alert => renderAlertCard(alert))}
        </div>
      )}
    </div>
  );
}

