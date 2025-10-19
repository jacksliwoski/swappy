import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ai, api } from '../utils/api';
import ItemCard from '../components/cards/ItemCard';
import OfferItemCard from '../components/trade/OfferItemCard';
import EventLog from '../components/trade/EventLog';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Confetti from '../components/ui/Confetti';
import type { InventoryItem, FairnessResponse, User } from '../types';

type TradeEvent = {
  id: string;
  type: 'item_add' | 'item_remove' | 'confirmed';
  message: string;
  timestamp: Date;
};

export default function TradeBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedItemId = searchParams.get('item');

  // Data
  const [myInventory, setMyInventory] = useState<InventoryItem[]>([]);
  const [theirInventory, setTheirInventory] = useState<InventoryItem[]>([]);
  const [myUser, setMyUser] = useState<User | null>(null);
  const [theirUser, setTheirUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Offers
  const [myOffer, setMyOffer] = useState<string[]>([]);
  const [theirOffer, setTheirOffer] = useState<string[]>([]);

  // UI state
  const [fairness, setFairness] = useState<FairnessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [events, setEvents] = useState<TradeEvent[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  
  // Mobile tabs
  const [mobileInventoryTab, setMobileInventoryTab] = useState<'mine' | 'theirs'>('mine');
  const [mobileOfferTab, setMobileOfferTab] = useState<'mine' | 'theirs'>('mine');

  // Refs for keyboard navigation
  const myInventoryRef = useRef<HTMLDivElement>(null);
  const theirInventoryRef = useRef<HTMLDivElement>(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ id: string; source: 'mine' | 'theirs' } | null>(null);

  useEffect(() => {
    // Get current user first, then load data
    api.auth.me().then(res => {
      if (res.ok && res.user) {
        loadData(res.user.id);
      }
    }).catch(err => {
      console.error('Failed to get current user:', err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (preselectedItemId && myInventory.length > 0) {
      addToMyOffer(preselectedItemId);
    }
  }, [preselectedItemId, myInventory]);

  useEffect(() => {
    calculateFairness();
  }, [myOffer, theirOffer]);

  async function loadData(userId: string) {
    setLoading(true);
    try {
      const [myData, userData] = await Promise.all([
        api.users.getInventory(userId),
        api.users.get(userId),
      ]);

      setMyInventory(myData.items || []);
      const userObj = userData.user || userData;
      setMyUser(userObj);

      // Load mock available users (in real app, fetch from /api/users)
      const mockUsers: User[] = [
        {
          id: 'u_demo_2',
          username: 'Anderson',
        avatar: '🎮',
          level: 5,
          xp: 820,
          xpToNextLevel: 1000,
          hasGuardian: true,
          createdAt: '2025-01-10T14:30:00.000Z',
        },
        {
          id: 'user-3',
          username: 'TradingBuddy',
          avatar: '🚀',
        level: 3,
        xp: 250,
        xpToNextLevel: 500,
        hasGuardian: true,
        createdAt: new Date().toISOString(),
        },
        {
          id: 'user-4',
          username: 'CoolTrader',
          avatar: '🎨',
          level: 4,
          xp: 450,
          xpToNextLevel: 700,
          hasGuardian: true,
          createdAt: new Date().toISOString(),
        },
      ];
      
      // Filter out current user
      setAvailableUsers(mockUsers.filter(u => u.id !== userId));
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserInventory(userId: string) {
    try {
      const userData = await api.users.get(userId);
      const inventoryData = await api.users.getInventory(userId);
      
      const userObj = userData.user || userData;
      setTheirUser(userObj);
      setTheirInventory(inventoryData.items || []);
      
      // Clear offers when switching users
      setTheirOffer([]);
    } catch (error) {
      console.error('Failed to load user inventory:', error);
      // Set mock data
      setTheirInventory([]);
      setTheirUser({
        id: userId,
        username: 'User',
        avatar: '😊',
        level: 1,
        xp: 0,
        xpToNextLevel: 50,
        hasGuardian: true,
        createdAt: new Date().toISOString(),
      });
    }
  }

  useEffect(() => {
    if (selectedUserId) {
      loadUserInventory(selectedUserId);
    }
  }, [selectedUserId]);

  async function calculateFairness() {
    // Only skip if BOTH sides are empty
    if (myOffer.length === 0 && theirOffer.length === 0) {
      setFairness(null);
      return;
    }

    setCalculating(true);
    try {
      const myValues = myOffer.map(id => {
        const item = myInventory.find(i => i.id === id);
        return item?.valuation.estimate.mid || 0;
      });
      const theirValues = theirOffer.map(id => {
        const item = theirInventory.find(i => i.id === id);
        return item?.valuation.estimate.mid || 0;
      });

      // Skip AI fairness check for giveaways (one side empty)
      if (myOffer.length === 0 || theirOffer.length === 0) {
        const totalA = myValues.reduce((sum, v) => sum + v, 0);
        const totalB = theirValues.reduce((sum, v) => sum + v, 0);
        setFairness({
          fairness: 1.0,
          warn: false,
          A: totalA,
          B: totalB,
          diff: totalB - totalA,
        });
        setCalculating(false);
        return;
      }

      const result = await ai.unevenScore(myValues, theirValues);
      setFairness(result);

      // Auto-save draft
      await api.trades.saveDraft({
        fromUserId: 'user-1',
        toUserId: 'user-2',
        offerA: {
          items: myOffer.map(id => myInventory.find(i => i.id === id)).filter(Boolean),
          totalValue: myValues.reduce((sum, v) => sum + v, 0),
        },
        offerB: {
          items: theirOffer.map(id => theirInventory.find(i => i.id === id)).filter(Boolean),
          totalValue: theirValues.reduce((sum, v) => sum + v, 0),
        },
      });
    } catch (error) {
      console.error('Failed to calculate fairness:', error);
    } finally {
      setCalculating(false);
    }
  }

  function addEvent(type: TradeEvent['type'], message: string) {
    setEvents(prev => [...prev, {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    }]);
  }

  function addToMyOffer(itemId: string) {
    if (myOffer.includes(itemId)) {
      // Highlight already added (visual feedback)
      const element = document.querySelector(`[data-offer-item="${itemId}"]`);
      if (element) {
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 500);
      }
      return;
    }
    
    setMyOffer(prev => [...prev, itemId]);
    const item = myInventory.find(i => i.id === itemId);
    if (item) {
      addEvent('item_add', `You added: ${item.title}`);
    }
  }

  function removeFromMyOffer(itemId: string) {
    setMyOffer(prev => prev.filter(id => id !== itemId));
    const item = myInventory.find(i => i.id === itemId);
    if (item) {
      addEvent('item_remove', `You removed: ${item.title}`);
    }
  }

  function addToTheirOffer(itemId: string) {
    if (theirOffer.includes(itemId)) {
      const element = document.querySelector(`[data-offer-item="${itemId}"]`);
      if (element) {
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 500);
      }
      return;
    }
    
    setTheirOffer(prev => [...prev, itemId]);
    const item = theirInventory.find(i => i.id === itemId);
    if (item) {
      addEvent('item_add', `They added: ${item.title}`);
    }
  }

  function removeFromTheirOffer(itemId: string) {
    setTheirOffer(prev => prev.filter(id => id !== itemId));
    const item = theirInventory.find(i => i.id === itemId);
    if (item) {
      addEvent('item_remove', `They removed: ${item.title}`);
    }
  }

  // Drag and drop handlers
  function handleDragStart(itemId: string, source: 'mine' | 'theirs') {
    setDraggedItem({ id: itemId, source });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDropToMyOffer(e: React.DragEvent) {
    e.preventDefault();
    if (draggedItem && draggedItem.source === 'mine') {
      addToMyOffer(draggedItem.id);
    }
    setDraggedItem(null);
  }

  function handleDropToTheirOffer(e: React.DragEvent) {
    e.preventDefault();
    if (draggedItem && draggedItem.source === 'theirs') {
      addToTheirOffer(draggedItem.id);
    }
    setDraggedItem(null);
  }

  async function handleConfirmTrade() {
    if (!fairness || !myUser || !theirUser) return;

    // Show confirmation dialog
    const message = prompt(
      'Add a message with your trade offer (optional):',
      `Hi! I'd like to trade with you.`
    );
    
    // User canceled
    if (message === null) return;

    try {
      const tradeOffer = {
        fromUserId: myUser.id,
        toUserId: theirUser.id,
        fromUser: myUser,
        toUser: theirUser,
        offerA: {
          items: myOffer.map(id => myInventory.find(i => i.id === id)).filter(Boolean),
          totalValue: fairness.A,
        },
        offerB: {
          items: theirOffer.map(id => theirInventory.find(i => i.id === id)).filter(Boolean),
          totalValue: fairness.B,
        },
        fairness,
        message: message || undefined,
        status: 'proposed' as const,
      };

      await api.trades.propose(tradeOffer);

      addEvent('confirmed', 'Trade offer sent!');
      setShowConfetti(true);
      setTimeout(() => {
        navigate('/messages');
      }, 2000);
    } catch (error) {
      console.error('Failed to send trade offer:', error);
      alert('Failed to send trade offer. Please try again.');
    }
  }

  // Allow offers even if one side is empty (for giveaways)
  const hasAnyItems = myOffer.length > 0 || theirOffer.length > 0;
  const canSendOffer = hasAnyItems && !calculating && confirmed;

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only handle if not in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Enter: send trade offer if valid
      if (e.key === 'Enter' && canSendOffer) {
        e.preventDefault();
        handleConfirmTrade();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSendOffer]);

  if (loading || !myUser) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-4)', minHeight: '100vh' }}>
      {showConfetti && <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />}

      <h1 style={{
        fontSize: 'var(--text-3xl)',
        marginBottom: 'var(--space-4)',
        textAlign: 'center',
        fontFamily: 'var(--font-family-display)',
      }}>
        🔄 Trading Room
      </h1>

      {/* User Selector */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto var(--space-6)',
        background: 'var(--color-surface)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--color-border)',
        boxShadow: 'var(--shadow-s1)',
      }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: 'var(--space-3)',
          color: 'var(--color-text-1)',
        }}>
          👤 Select who you want to trade with:
        </label>
        
        {/* Search Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username..."
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            fontSize: 'var(--text-base)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-3)',
          }}
        />

        {/* User List */}
        <div style={{
          display: 'grid',
          gap: 'var(--space-2)',
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          {availableUsers
            .filter(user => 
              user.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                style={{
                  padding: 'var(--space-3)',
                  background: selectedUserId === user.id ? 'var(--color-brand-tint)' : 'var(--color-gray-100)',
                  border: selectedUserId === user.id ? '2px solid var(--color-brand)' : '2px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (selectedUserId !== user.id) {
                    e.currentTarget.style.background = 'var(--color-gray-200)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedUserId !== user.id) {
                    e.currentTarget.style.background = 'var(--color-gray-100)';
                  }
                }}
              >
                <div style={{
                  fontSize: '32px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-brand-tint)',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid var(--color-brand)',
                }}>
                  {user.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'var(--font-bold)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-1)',
                  }}>
                    {user.username}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-text-2)',
                  }}>
                    Level {user.level} • {user.xp} XP
                  </div>
                </div>
                {selectedUserId === user.id && (
                  <div style={{
                    fontSize: '20px',
                    color: 'var(--color-brand)',
                  }}>
                    ✓
        </div>
      )}
              </div>
            ))}
        </div>

        {selectedUserId && theirUser && (
          <div style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            background: 'var(--color-rating-great-bg)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-rating-great-text)',
            fontSize: 'var(--text-small)',
            fontWeight: 'var(--font-semibold)',
            textAlign: 'center',
          }}>
            ✓ Trading with {theirUser.username}
          </div>
        )}
      </div>

      {/* No user selected or user data loading */}
      {!selectedUserId && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--color-text-2)',
          fontSize: 'var(--text-lg)',
        }}>
          👆 Please select a user above to start trading
        </div>
      )}

      {/* Loading selected user's data */}
      {selectedUserId && !theirUser && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--color-text-2)',
        }}>
          <LoadingSpinner />
          <p style={{ marginTop: 'var(--space-4)' }}>Loading inventory...</p>
        </div>
      )}

      {/* Trading UI - only show when user is selected and loaded */}
      {selectedUserId && theirUser && (
        <>
      {/* Desktop Layout */}
      <div className="desktop-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 480px 1fr', gap: 'var(--space-6)' }}>
        {/* Left: My Inventory */}
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', color: 'var(--color-teal)' }}>
            Your Inventory
          </h2>
          <div
            ref={myInventoryRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 'var(--space-3)',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto',
              padding: 'var(--space-2)',
            }}
          >
            {myInventory.map(item => (
              <div key={item.id} style={{ position: 'relative' }}>
                <ItemCard
                  item={item}
                  selected={myOffer.includes(item.id)}
                  onSelect={() => addToMyOffer(item.id)}
                  draggable={true}
                  onDragStart={(e) => {
                    handleDragStart(item.id, 'mine');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center: Trade Room */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Your Items */}
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-3)', color: 'var(--color-teal)' }}>
              Your Items
            </h3>
            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--color-teal-light)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '150px',
                border: draggedItem?.source === 'mine' ? '3px dashed var(--color-teal-dark)' : undefined,
                transition: 'border var(--transition-fast)',
              }}
              onDragOver={handleDragOver}
              onDrop={handleDropToMyOffer}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {myOffer.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-teal-dark)', opacity: 0.6 }}>
                    Click items from your inventory to add
                  </div>
                ) : (
                  myOffer.map(itemId => {
                    const item = myInventory.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} data-offer-item={itemId}>
                        <OfferItemCard
                          item={item}
                          onRemove={() => removeFromMyOffer(itemId)}
                          side="yours"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Their Items */}
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-3)', color: 'var(--color-lilac)' }}>
              {theirUser?.username}'s Items
            </h3>
            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--color-lilac-light)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '150px',
                border: draggedItem?.source === 'theirs' ? '3px dashed var(--color-lilac-dark)' : undefined,
                transition: 'border var(--transition-fast)',
              }}
              onDragOver={handleDragOver}
              onDrop={handleDropToTheirOffer}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {theirOffer.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-lilac-dark)', opacity: 0.6 }}>
                    Click items from their inventory to add
                  </div>
                ) : (
                  theirOffer.map(itemId => {
                    const item = theirInventory.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} data-offer-item={itemId}>
                        <OfferItemCard
                          item={item}
                          onRemove={() => removeFromTheirOffer(itemId)}
                          side="theirs"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
            <div
              style={{
                padding: 'var(--space-4)',
              background: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
            <label
              style={{
              display: 'flex',
              alignItems: 'center',
                gap: 'var(--space-3)',
                cursor: 'pointer',
                fontSize: 'var(--text-base)',
              }}
            >
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontWeight: 'var(--font-medium)' }}>
                I confirm this trade offer
              </span>
            </label>
            </div>

          {/* Make Offer Button */}
              <Button
                variant="primary"
                onClick={handleConfirmTrade}
            disabled={!canSendOffer}
                style={{
                  width: '100%',
              background: canSendOffer ? 'var(--color-success)' : undefined,
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-bold)',
                }}
              >
            {calculating ? <LoadingSpinner /> : 'Make Offer'}
              </Button>
        </div>

        {/* Right: Their Inventory */}
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', color: 'var(--color-lilac)' }}>
            Their Inventory
          </h2>
          <div
            ref={theirInventoryRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 'var(--space-3)',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto',
              padding: 'var(--space-2)',
            }}
          >
            {theirInventory.map(item => (
              <div key={item.id} style={{ position: 'relative' }}>
                <ItemCard
                  item={item}
                  selected={theirOffer.includes(item.id)}
                  onSelect={() => addToTheirOffer(item.id)}
                  draggable={true}
                  onDragStart={(e) => {
                    handleDragStart(item.id, 'theirs');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="mobile-layout" style={{ display: 'none' }}>
        {/* Inventory Tabs */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Button
              variant={mobileInventoryTab === 'mine' ? 'primary' : 'secondary'}
              onClick={() => setMobileInventoryTab('mine')}
              style={{ flex: 1 }}
            >
              Your Inventory
            </Button>
            <Button
              variant={mobileInventoryTab === 'theirs' ? 'primary' : 'secondary'}
              onClick={() => setMobileInventoryTab('theirs')}
              style={{ flex: 1 }}
            >
              Their Inventory
            </Button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 'var(--space-3)',
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            {mobileInventoryTab === 'mine'
              ? myInventory.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selected={myOffer.includes(item.id)}
                    onSelect={() => addToMyOffer(item.id)}
                  />
                ))
              : theirInventory.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selected={theirOffer.includes(item.id)}
                    onSelect={() => addToTheirOffer(item.id)}
                  />
                ))
            }
          </div>
        </div>

        {/* Offer Tabs */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Button
              variant={mobileOfferTab === 'mine' ? 'primary' : 'secondary'}
              onClick={() => setMobileOfferTab('mine')}
              style={{ flex: 1 }}
            >
              Your Items ({myOffer.length})
            </Button>
            <Button
              variant={mobileOfferTab === 'theirs' ? 'primary' : 'secondary'}
              onClick={() => setMobileOfferTab('theirs')}
              style={{ flex: 1 }}
            >
              {theirUser?.username}'s Items ({theirOffer.length})
            </Button>
          </div>

          <div style={{
            padding: 'var(--space-4)',
            background: mobileOfferTab === 'mine' ? 'var(--color-teal-light)' : 'var(--color-lilac-light)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '200px',
          }}>
            {mobileOfferTab === 'mine' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {myOffer.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-teal-dark)', opacity: 0.6 }}>
                      No items in your offer
                    </div>
                  ) : (
                    myOffer.map(itemId => {
                      const item = myInventory.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                        <OfferItemCard
                          key={itemId}
                          item={item}
                          onRemove={() => removeFromMyOffer(itemId)}
                          side="yours"
                        />
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {theirOffer.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-lilac-dark)', opacity: 0.6 }}>
                      No items in their offer
                    </div>
                  ) : (
                    theirOffer.map(itemId => {
                      const item = theirInventory.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                        <OfferItemCard
                          key={itemId}
                          item={item}
                          onRemove={() => removeFromTheirOffer(itemId)}
                          side="theirs"
                        />
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Event Log */}
        {events.length > 0 && <EventLog events={events} />}

        {/* Sticky Bottom Bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--color-white)',
            padding: 'var(--space-4)',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            zIndex: 100,
          }}
        >
          {/* Confirmation Checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
              }}
            />
            <span style={{ fontWeight: 'var(--font-medium)' }}>
              I confirm this trade offer
                </span>
          </label>

              <Button
                variant="primary"
                onClick={handleConfirmTrade}
            disabled={!canSendOffer}
            style={{
              width: '100%',
              background: canSendOffer ? 'var(--color-success)' : undefined,
              fontWeight: 'var(--font-bold)',
              fontSize: 'var(--text-lg)',
            }}
          >
            {calculating ? <LoadingSpinner /> : 'Make Offer'}
              </Button>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-layout {
            display: none !important;
          }
          .mobile-layout {
            display: block !important;
          }
        }

        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
          }
        }

        .highlight-pulse {
          animation: highlightPulse 0.5s ease-out;
        }

        @keyframes highlightPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(16, 185, 129, 0);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        /* Focus indicators for accessibility */
        .card:focus-visible,
        .offer-item:focus-visible {
          outline: 3px solid var(--color-primary);
          outline-offset: 2px;
        }

        button:focus-visible {
          outline: 3px solid var(--color-primary);
          outline-offset: 2px;
        }

        /* Dragging styles */
        [draggable="true"] {
          cursor: grab;
        }

        [draggable="true"]:active {
          cursor: grabbing;
          opacity: 0.7;
        }
      `}</style>
        </>
      )}
    </div>
  );
}
