const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// In-memory store for guardian alerts (in production, use a database)
const alertsStore = new Map();

// Initialize demo alerts for Anderson's guardian
function initializeDemoAlerts() {
  const demoAlerts = [
    {
      id: 'alert_1',
      type: 'trade_unfair',
      severity: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      childUsername: 'anderson',
      childUserId: 'u_demo_2',
      guardianId: 'guardian_anderson',
      title: 'Highly Unbalanced Trade Proposed',
      description: 'Anderson proposed a trade where they would give away items worth $45 and receive items worth only $8. This trade appears heavily unfair.',
      details: {
        fairness: 0.18,
        childValue: 45,
        otherValue: 8,
        otherUsername: 'jack',
        tradeId: 'trade_demo_1',
      },
      acknowledged: false,
    },
    {
      id: 'alert_2',
      type: 'chat_safety',
      severity: 'critical',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
      childUsername: 'anderson',
      childUserId: 'u_demo_2',
      guardianId: 'guardian_anderson',
      title: 'Message Blocked by Safety Filter',
      description: 'A message was blocked because it contained concerning content. Our AI detected potential requests for personal information.',
      details: {
        action: 'block',
        tags: ['PERSONAL_INFO_REQUEST', 'SUSPICIOUS'],
        tip: 'Never share personal information like your address, phone number, or school name with people you meet online.',
        otherUsername: 'stranger_user',
        conversationId: 'conv_demo_1',
      },
      acknowledged: false,
    },
    {
      id: 'alert_3',
      type: 'meetup_detected',
      severity: 'medium',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      childUsername: 'anderson',
      childUserId: 'u_demo_2',
      guardianId: 'guardian_anderson',
      title: 'In-Person Meetup Discussion Detected',
      description: 'Anderson discussed meeting in person to complete a trade. Please review the conversation and ensure proper safety protocols are followed.',
      details: {
        message: 'Can we meet at the park tomorrow to trade?',
        otherUsername: 'jack',
        conversationId: 'conv_demo_2',
        keywords: ['meet', 'park', 'tomorrow'],
      },
      acknowledged: false,
    },
    {
      id: 'alert_4',
      type: 'chat_safety',
      severity: 'medium',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      childUsername: 'anderson',
      childUserId: 'u_demo_2',
      guardianId: 'guardian_anderson',
      title: 'Safety Warning Issued',
      description: 'A message was flagged for review. It contained language that may be inappropriate.',
      details: {
        action: 'warn',
        tags: ['INAPPROPRIATE_LANGUAGE'],
        tip: 'Remember to keep conversations friendly and respectful. Inappropriate language can make others uncomfortable.',
        otherUsername: 'jack',
        conversationId: 'conv_demo_3',
      },
      acknowledged: true,
    },
    {
      id: 'alert_5',
      type: 'trade_unfair',
      severity: 'low',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      childUsername: 'anderson',
      childUserId: 'u_demo_2',
      guardianId: 'guardian_anderson',
      title: 'Slightly Unbalanced Trade Completed',
      description: 'A trade was completed where Anderson received slightly less value ($22 vs $28). This may be acceptable if Anderson was happy with the items.',
      details: {
        fairness: 0.79,
        childValue: 22,
        otherValue: 28,
        otherUsername: 'ToyCollector',
        tradeId: 'trade_demo_2',
      },
      acknowledged: true,
    },
  ];

  // Store alerts by guardian ID
  alertsStore.set('guardian_anderson', demoAlerts);
  
  console.log('[Guardian] Initialized demo alerts for Anderson\'s guardian');
}

// Initialize demo alerts on server start
initializeDemoAlerts();

// Helper function to create a new alert
function createAlert(alertData) {
  const guardianId = alertData.guardianId || 'guardian_anderson';
  const alerts = alertsStore.get(guardianId) || [];
  
  const newAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    ...alertData,
  };
  
  alerts.unshift(newAlert); // Add to beginning
  alertsStore.set(guardianId, alerts);
  
  console.log('[Guardian] Created new alert:', newAlert.type, 'for', guardianId);
  return newAlert;
}

// GET /api/guardian/:guardianId/alerts
// Get all alerts for a guardian
router.get('/:guardianId/alerts', requireAuth, (req, res) => {
  const { guardianId } = req.params;
  
  console.log('[Guardian] Fetching alerts for guardian:', guardianId);
  
  const alerts = alertsStore.get(guardianId) || [];
  
  // Sort by timestamp (newest first)
  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  res.json({
    ok: true,
    alerts: sortedAlerts,
    unacknowledgedCount: sortedAlerts.filter(a => !a.acknowledged).length,
  });
});

// POST /api/guardian/alerts/:alertId/acknowledge
// Mark an alert as acknowledged
router.post('/alerts/:alertId/acknowledge', requireAuth, (req, res) => {
  const { alertId } = req.params;
  
  console.log('[Guardian] Acknowledging alert:', alertId);
  
  // Find and update the alert across all guardians
  let found = false;
  for (const [guardianId, alerts] of alertsStore.entries()) {
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    if (alertIndex !== -1) {
      alerts[alertIndex].acknowledged = true;
      alerts[alertIndex].acknowledgedAt = new Date().toISOString();
      alertsStore.set(guardianId, alerts);
      found = true;
      break;
    }
  }
  
  if (!found) {
    return res.status(404).json({ ok: false, error: 'Alert not found' });
  }
  
  res.json({ ok: true });
});

// POST /api/guardian/alerts/create
// Create a new alert (called by other parts of the system)
router.post('/alerts/create', (req, res) => {
  const alertData = req.body;
  
  const newAlert = createAlert(alertData);
  
  res.json({ ok: true, alert: newAlert });
});

// Export the createAlert function for use in other routes
module.exports = router;
module.exports.createAlert = createAlert;
