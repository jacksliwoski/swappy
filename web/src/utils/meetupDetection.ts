/**
 * Meetup intent detection utility
 * Detects phrases indicating the user wants to arrange a meetup
 */

const MEETUP_KEYWORDS = [
  'meet',
  'meet up',
  'meetup',
  'where should we meet',
  'where works',
  'address',
  'location',
  'library',
  'police station',
  'mall',
  'coffee shop',
  'at ',  // catches "at 5pm", "at the library"
  'today at',
  'tomorrow at',
  'this afternoon',
  'swing by',
  'pick up',
  'drop off',
];

/**
 * Check if a message contains meetup intent
 */
export function detectMeetupIntent(message: string | null | undefined): boolean {
  if (!message) return false;
  
  const lowerMessage = message.toLowerCase();

  return MEETUP_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Check if recent messages contain meetup intent
 */
export function detectMeetupIntentInMessages(messages: Array<{ text: string }>): boolean {
  // Check last 5 messages
  const recentMessages = messages.slice(-5);

  return recentMessages.some(msg => detectMeetupIntent(msg.text));
}

/**
 * Check for deposit/off-app mentions (safety concern)
 */
export function detectUnsafeBehavior(message: string | null | undefined): boolean {
  if (!message) return false;
  
  const lowerMessage = message.toLowerCase();

  const unsafeKeywords = [
    'deposit',
    'send money',
    'venmo',
    'paypal',
    'cashapp',
    'zelle',
    'wire transfer',
    'off app',
    'off-app',
    'text me',
    'call me',
    'whatsapp',
    'telegram',
    'signal',
  ];

  return unsafeKeywords.some(keyword => lowerMessage.includes(keyword));
}
