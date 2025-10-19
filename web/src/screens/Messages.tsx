import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ai, api } from '../utils/api';
import UserAvatar from '../components/cards/UserAvatar';
import SafetyBanner from '../components/ui/SafetyBanner';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MeetupAssistant, { MeetupDetails } from '../components/meetup/MeetupAssistant';
import TradeOfferCard from '../components/trade/TradeOfferCard';
import { detectMeetupIntent, detectUnsafeBehavior } from '../utils/meetupDetection';
import type { Conversation, Message, User, ModerationResult } from '../types';

export default function Messages() {
  const { conversationId: paramConversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(paramConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<ModerationResult | null>(null);
  const [showMeetupAssistant, setShowMeetupAssistant] = useState(false);
  const [showPlanMeetupButton, setShowPlanMeetupButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user first, then load conversations
    api.auth.me().then(res => {
      if (res.ok && res.user) {
        setCurrentUser(res.user);
        loadConversations(res.user.id);
      }
    }).catch(err => {
      console.error('Failed to get current user:', err);
      setLoading(false);
    });
  }, []);

  // Reload conversations when route conversation ID changes
  useEffect(() => {
    if (paramConversationId && currentUser && conversations.length === 0) {
      console.log('[Messages] Route param changed, reloading for conversation:', paramConversationId);
      loadConversations(currentUser.id).then(() => {
        setSelectedConvId(paramConversationId);
      });
    } else if (paramConversationId && conversations.length > 0) {
      console.log('[Messages] Setting selected conversation from route:', paramConversationId);
      setSelectedConvId(paramConversationId);
    }
  }, [paramConversationId, currentUser]);

  useEffect(() => {
    if (selectedConvId && currentUser) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Watch for meetup intent
  useEffect(() => {
    if (newMessage || messages.length > 0) {
      const hasIntent = detectMeetupIntent(newMessage) || 
        messages.filter(msg => msg.text).some(msg => detectMeetupIntent(msg.text));
      const hasUnsafe = detectUnsafeBehavior(newMessage);

      if (hasUnsafe) {
        setModerationWarning({
          action: 'warn',
          reason: 'Do not share payment or contact info. Stay on the platform.',
          severity: 'medium',
          tip: 'Keep all transactions within the platform for your safety.',
          tags: ['payment', 'contact'],
        });
      }

      if (hasIntent && !hasUnsafe) {
        setShowMeetupAssistant(true);
      }
    }
  }, [newMessage, messages]);

  async function loadConversations(userId: string) {
    setLoading(true);
    try {
      console.log('[Messages] Loading conversations for user:', userId);
      const data = await api.messages.getConversations(userId);
      console.log('[Messages] Received conversations RAW:', data);
      console.log('[Messages] Type of data:', typeof data);
      console.log('[Messages] Keys in data:', Object.keys(data || {}));
      console.log('[Messages] data.conversations:', data?.conversations);
      console.log('[Messages] Conversations array:', data?.conversations);
      console.log('[Messages] Conversations count:', data?.conversations?.length || 0);
      
      if (data && data.conversations) {
        setConversations(data.conversations);
      } else {
        console.error('[Messages] Invalid response format:', data);
        console.error('[Messages] Expected { ok: true, conversations: [...] }');
        setConversations([]);
      }
      
      if (!selectedConvId && !paramConversationId && data?.conversations?.length > 0) {
        setSelectedConvId(data.conversations[0].id);
      }
      
      return data;
    } catch (error) {
      console.error('[Messages] Failed to load conversations:', error);
      return { conversations: [] };
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(convId: string) {
    if (!currentUser) return;
    
    try {
      const data = await api.messages.getMessages(currentUser.id, convId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Fallback to lastMessage from conversation
      const conv = conversations.find(c => c.id === convId);
      if (conv && conv.lastMessage) {
        setMessages([conv.lastMessage]);
      }
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedConvId || sending) return;

    setSending(true);
    setModerationWarning(null);

    try {
      // AI Moderation is temporarily disabled
      // Uncomment below to re-enable when AI server is available
      
      /* 
      try {
        const response = await ai.moderateStream(newMessage);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResult = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                fullResult += line.slice(6);
              }
            }
          }

          const moderationResult: ModerationResult = JSON.parse(fullResult);
          
          if (moderationResult.action === 'block') {
            setModerationWarning(moderationResult);
            setSending(false);
            return;
          }

          if (moderationResult.action === 'warn') {
            setModerationWarning(moderationResult);
          }
        }
      } catch (moderationError) {
        console.warn('Moderation check failed, proceeding with message send:', moderationError);
      }
      */

      // Send message
      const conv = conversations.find(c => c.id === selectedConvId);
      const otherUser = conv?.participants.find(p => p.id !== currentUser?.id);
      
      if (otherUser && currentUser) {
        await api.messages.send(selectedConvId, currentUser.id, otherUser.id, newMessage);
        
        // Add to local state
        const newMsg: Message = {
          id: Date.now().toString(),
          conversationId: selectedConvId,
          fromUserId: currentUser.id,
          toUserId: otherUser.id,
          text: newMessage,
          sentAt: new Date().toISOString(),
          read: false,
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function insertMeetupLink() {
    setNewMessage(prev => prev + '\n📍 Let\'s meet at a safe public spot! Check out Safe Meetup for suggestions.');
  }

  function insertTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setNewMessage(prev => prev + `\n🕐 How about ${timeStr}?`);
  }

  function handleInsertMeetupToChat(message: string) {
    setNewMessage(message);
    setShowMeetupAssistant(false);
    setShowPlanMeetupButton(true);
  }

  function handleDismissMeetupAssistant() {
    setShowMeetupAssistant(false);
    setShowPlanMeetupButton(true);
  }

  async function handleAcceptTrade(tradeId: string) {
    if (!confirm('Accept this trade offer? This will mark the trade as accepted and you can arrange a meetup.')) {
      return;
    }

    try {
      await api.trades.accept(tradeId);
      // Reload both conversations and messages to show updated status
      if (currentUser && selectedConvId) {
        await loadConversations(currentUser.id);
        await loadMessages(selectedConvId);
      }
      alert('Trade accepted! You can now plan your meetup.');
    } catch (error) {
      console.error('Failed to accept trade:', error);
      alert('Failed to accept trade. Please try again.');
    }
  }

  async function handleDeclineTrade(tradeId: string) {
    if (!confirm('Decline this trade offer?')) {
      return;
    }

    try {
      await api.trades.decline(tradeId);
      // Reload both conversations and messages to show updated status
      if (currentUser && selectedConvId) {
        await loadConversations(currentUser.id);
        await loadMessages(selectedConvId);
      }
    } catch (error) {
      console.error('Failed to decline trade:', error);
      alert('Failed to decline trade. Please try again.');
    }
  }

  function handleCounterTrade(tradeId: string) {
    // Navigate to trade builder with the original trade to counter
    navigate(`/trades?counter=${tradeId}`);
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>💬 Messages</h1>
        <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-6)' }}>
          No messages yet. Start trading to connect with others!
        </p>
        <Button 
          variant="primary" 
          onClick={() => currentUser && loadConversations(currentUser.id)}
        >
          🔄 Reload Messages
        </Button>
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const otherUser = selectedConv?.participants.find(p => p.id !== currentUser?.id);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 80px)' }}>
      {/* Left Sidebar: Conversations */}
      <div style={{
        borderRight: '2px solid var(--color-gray-200)',
        overflowY: 'auto',
        background: 'var(--color-white)',
      }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '2px solid var(--color-gray-200)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>💬 Messages</h2>
        </div>
        
        {conversations.map(conv => {
          const otherParticipant = conv.participants.find(p => p.id !== currentUser?.id);
          if (!otherParticipant) return null;

          return (
            <div
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              style={{
                padding: 'var(--space-4)',
                borderBottom: '1px solid var(--color-gray-200)',
                cursor: 'pointer',
                background: selectedConvId === conv.id ? 'var(--color-gray-100)' : 'transparent',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (selectedConvId !== conv.id) {
                  e.currentTarget.style.background = 'var(--color-gray-50)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedConvId !== conv.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <UserAvatar user={otherParticipant} size="sm" showLevel />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-base)' }}>
                    {otherParticipant.username}
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <div style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-bold)',
                  }}>
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              {conv.lastMessage && (
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-gray-600)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {conv.lastMessage.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Panel: Chat Interface */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-gray-50)' }}>
        {selectedConv && otherUser ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: 'var(--space-4)',
              borderBottom: '2px solid var(--color-gray-200)',
              background: 'var(--color-white)',
            }}>
              <UserAvatar user={otherUser} showLevel showUsername />
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}>
              {messages.map(msg => {
                const isMe = msg.fromUserId === currentUser?.id;
                
                // Render trade offer message
                if (msg.tradeOffer) {
                  return (
                    <div key={msg.id} style={{ width: '100%' }}>
                      <TradeOfferCard
                        trade={msg.tradeOffer.trade}
                        isReceiver={!isMe}
                        onAccept={() => handleAcceptTrade(msg.tradeOffer!.trade.id)}
                        onDecline={() => handleDeclineTrade(msg.tradeOffer!.trade.id)}
                        onCounter={() => handleCounterTrade(msg.tradeOffer!.trade.id)}
                      />
                    </div>
                  );
                }
                
                // Render normal text message
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      background: isMe ? 'var(--color-brand)' : '#f3f4f6',
                      color: isMe ? 'white' : '#1f2937',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}>
                      <div style={{ marginBottom: 'var(--space-1)', color: isMe ? 'white' : '#1f2937' }}>{msg.text}</div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        opacity: 0.7,
                        textAlign: 'right',
                        color: isMe ? 'white' : '#4b5563',
                      }}>
                        {new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Moderation Warning */}
            {moderationWarning && (
              <div style={{ padding: '0 var(--space-4) var(--space-2)' }}>
                <SafetyBanner
                  type={moderationWarning.action === 'block' ? 'error' : 'warning'}
                  message={moderationWarning.tip}
                  tags={moderationWarning.tags}
                />
              </div>
            )}

            {/* Meetup Assistant */}
            {showMeetupAssistant && (
              <div style={{ padding: '0 var(--space-4) var(--space-2)' }}>
                <MeetupAssistant
                  isUnder18={currentUser.hasGuardian}
                  onInsertToChat={handleInsertMeetupToChat}
                  onDismiss={handleDismissMeetupAssistant}
                />
              </div>
            )}

            {/* Plan Meetup Button */}
            {showPlanMeetupButton && !showMeetupAssistant && (
              <div style={{ padding: '0 var(--space-4) var(--space-2)' }}>
                <Button
                  variant="secondary"
                  onClick={() => setShowMeetupAssistant(true)}
                  style={{ width: '100%' }}
                >
                  📍 Plan meet-up
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{
              padding: 'var(--space-2) var(--space-4)',
              display: 'flex',
              gap: 'var(--space-2)',
              background: 'var(--color-white)',
              borderTop: '1px solid var(--color-gray-200)',
            }}>
              <Button variant="secondary" size="sm" onClick={insertMeetupLink}>
                📍 Suggest Meetup
              </Button>
              <Button variant="secondary" size="sm" onClick={insertTime}>
                🕐 Share Time
              </Button>
            </div>

            {/* Input */}
            <div style={{
              padding: 'var(--space-4)',
              background: 'var(--color-white)',
              borderTop: '2px solid var(--color-gray-200)',
            }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message... (Press Enter to send)"
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: 'var(--space-3)',
                    fontSize: 'var(--text-base)',
                    border: '2px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-md)',
                    resize: 'vertical',
                    minHeight: '60px',
                  }}
                />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? <LoadingSpinner /> : '📤 Send'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-gray-600)',
          }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

