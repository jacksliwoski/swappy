import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ai, api } from '../utils/api';
import UserAvatar from '../components/cards/UserAvatar';
import SafetyBanner from '../components/ui/SafetyBanner';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Conversation, Message, User, ModerationResult } from '../types';

export default function Messages() {
  const { conversationId: paramConversationId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(paramConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<ModerationResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser: User = {
    id: 'user-1',
    username: 'You',
    avatar: '😊',
    level: 1,
    xp: 0,
    xpToNextLevel: 50,
    hasGuardian: true,
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadConversations() {
    setLoading(true);
    try {
      const data = await api.messages.getConversations('user-1');
      setConversations(data.conversations || []);
      
      if (!selectedConvId && data.conversations?.length > 0) {
        setSelectedConvId(data.conversations[0].id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(convId: string) {
    try {
      const conv = conversations.find(c => c.id === convId);
      if (conv && conv.lastMessage) {
        // Mock: In a real app, fetch full message history
        setMessages([conv.lastMessage]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedConvId || sending) return;

    setSending(true);
    setModerationWarning(null);

    try {
      // Check moderation first
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

      // Send message
      const conv = conversations.find(c => c.id === selectedConvId);
      const otherUser = conv?.participants.find(p => p.id !== 'user-1');
      
      if (otherUser) {
        await api.messages.send(selectedConvId, 'user-1', otherUser.id, newMessage);
        
        // Add to local state
        const newMsg: Message = {
          id: Date.now().toString(),
          conversationId: selectedConvId,
          fromUserId: 'user-1',
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
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const otherUser = selectedConv?.participants.find(p => p.id !== 'user-1');

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
          const otherParticipant = conv.participants.find(p => p.id !== 'user-1');
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
                const isMe = msg.fromUserId === 'user-1';
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
                      background: isMe ? 'var(--color-primary)' : 'var(--color-white)',
                      color: isMe ? 'white' : 'var(--color-gray-800)',
                    }}>
                      <div style={{ marginBottom: 'var(--space-1)' }}>{msg.text}</div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        opacity: 0.7,
                        textAlign: 'right',
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

