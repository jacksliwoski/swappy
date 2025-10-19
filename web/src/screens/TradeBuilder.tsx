import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ai, api } from '../utils/api';
import { estimateTradeXP } from '../utils/xp';
import { getBalancingSuggestion } from '../utils/tradeRating';
import ItemCard from '../components/cards/ItemCard';
import OfferItemCard from '../components/trade/OfferItemCard';
import ReadyIndicator from '../components/trade/ReadyIndicator';
import EventLog from '../components/trade/EventLog';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Confetti from '../components/ui/Confetti';
import type { InventoryItem, FairnessResponse, User } from '../types';

type TradeEvent = {
  id: string;
  type: 'item_add' | 'item_remove' | 'ready' | 'not_ready' | 'both_ready' | 'confirmed';
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

  // Offers
  const [myOffer, setMyOffer] = useState<string[]>([]);
  const [theirOffer, setTheirOffer] = useState<string[]>([]);

  // Ready states
  const [myReady, setMyReady] = useState(false);
  const [theirReady, setTheirReady] = useState(false);

  // UI state
  const [fairness, setFairness] = useState<FairnessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOfferChangedNotice, setShowOfferChangedNotice] = useState(false);
  const [events, setEvents] = useState<TradeEvent[]>([]);
  
  // Mobile tabs
  const [mobileInventoryTab, setMobileInventoryTab] = useState<'mine' | 'theirs'>('mine');
  const [mobileOfferTab, setMobileOfferTab] = useState<'mine' | 'theirs'>('mine');

  // Refs for keyboard navigation
  const myInventoryRef = useRef<HTMLDivElement>(null);
  const theirInventoryRef = useRef<HTMLDivElement>(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ id: string; source: 'mine' | 'theirs' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (preselectedItemId && myInventory.length > 0) {
      addToMyOffer(preselectedItemId);
    }
  }, [preselectedItemId, myInventory]);

  useEffect(() => {
    calculateFairness();
  }, [myOffer, theirOffer]);

  async function loadData() {
    setLoading(true);
    try {
      const [myData, discoverData, userData] = await Promise.all([
        api.users.getInventory('user-1'),
        api.discover.browse({}),
        api.users.get('user-1'),
      ]);
      
      setMyInventory(myData.items || []);
      setMyUser(userData);
      
      // Mock their items and user (in real app, this would be specific user)
      setTheirInventory((discoverData.items || []).slice(0, 8));
      setTheirUser({
        id: 'user-2',
        username: 'TradingBuddy',
        avatar: '🎮',
        level: 3,
        xp: 250,
        xpToNextLevel: 500,
        hasGuardian: true,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function calculateFairness() {
    if (myOffer.length === 0 || theirOffer.length === 0) {
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

  function clearReadiness() {
    if (myReady || theirReady) {
      setMyReady(false);
      setTheirReady(false);
      setShowOfferChangedNotice(true);
      addEvent('not_ready', 'Offer changed — readiness cleared');
      setTimeout(() => setShowOfferChangedNotice(false), 3000);
    }
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
    clearReadiness();
  }

  function removeFromMyOffer(itemId: string) {
    setMyOffer(prev => prev.filter(id => id !== itemId));
    const item = myInventory.find(i => i.id === itemId);
    if (item) {
      addEvent('item_remove', `You removed: ${item.title}`);
    }
    clearReadiness();
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
    clearReadiness();
  }

  function removeFromTheirOffer(itemId: string) {
    setTheirOffer(prev => prev.filter(id => id !== itemId));
    const item = theirInventory.find(i => i.id === itemId);
    if (item) {
      addEvent('item_remove', `They removed: ${item.title}`);
    }
    clearReadiness();
  }

  function toggleMyReady() {
    const newState = !myReady;
    setMyReady(newState);
    addEvent(newState ? 'ready' : 'not_ready', newState ? 'You are ready' : 'You are not ready');
    
    if (newState && theirReady) {
      addEvent('both_ready', 'Both ready — confirm available');
    }
  }

  function toggleTheirReady() {
    // Simulate their ready toggle (in real app, this comes from backend/websocket)
    const newState = !theirReady;
    setTheirReady(newState);
    addEvent(newState ? 'ready' : 'not_ready', newState ? 'They are ready' : 'They are not ready');
    
    if (newState && myReady) {
      addEvent('both_ready', 'Both ready — confirm available');
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

  function handleDragEnd() {
    setDraggedItem(null);
  }

  async function handleConfirmTrade() {
    if (!fairness || !myUser || !theirUser) return;

    try {
      await api.trades.propose({
        fromUserId: 'user-1',
        toUserId: 'user-2',
        offerA: {
          items: myOffer.map(id => myInventory.find(i => i.id === id)).filter(Boolean),
          totalValue: fairness.A,
        },
        offerB: {
          items: theirOffer.map(id => theirInventory.find(i => i.id === id)).filter(Boolean),
          totalValue: fairness.B,
        },
        fairness,
      });

      addEvent('confirmed', 'Trade confirmed!');
      setShowConfetti(true);
      setTimeout(() => {
        navigate('/messages');
      }, 2000);
    } catch (error) {
      console.error('Failed to propose trade:', error);
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only handle if not in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space: toggle ready (when offers are not empty)
      if (e.key === ' ' || e.key === 'Spacebar') {
        if (myOffer.length > 0 && theirOffer.length > 0) {
          e.preventDefault();
          toggleMyReady();
        }
      }

      // Enter: confirm trade if both ready
      if (e.key === 'Enter' && canConfirm && !calculating) {
        e.preventDefault();
        handleConfirmTrade();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [myReady, canConfirm, calculating, myOffer.length, theirOffer.length]);

  const myTotal = myOffer.reduce((sum, id) => {
    const item = myInventory.find(i => i.id === id);
    return sum + (item?.valuation.estimate.mid || 0);
  }, 0);

  const theirTotal = theirOffer.reduce((sum, id) => {
    const item = theirInventory.find(i => i.id === id);
    return sum + (item?.valuation.estimate.mid || 0);
  }, 0);

  const diff = theirTotal - myTotal;
  const balancingSuggestion = fairness && fairness.warn ? getBalancingSuggestion(diff) : null;
  const bothReady = myReady && theirReady;
  const canConfirm = bothReady && myOffer.length > 0 && theirOffer.length > 0;

  if (loading || !myUser || !theirUser) {
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
        marginBottom: 'var(--space-2)',
        textAlign: 'center',
        fontFamily: 'var(--font-family-display)',
      }}>
        🔄 Trading Room
      </h1>

      {/* Keyboard shortcuts hint */}
      <div style={{
        textAlign: 'center',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-gray-600)',
        marginBottom: 'var(--space-6)',
      }}>
        ⌨️ <strong>Keyboard:</strong> Click or Enter to add items • Delete to remove • Space to toggle ready • Enter to confirm
      </div>

      {/* Offer Changed Notice */}
      {showOfferChangedNotice && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-warning)',
            color: 'var(--color-white)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          ⚠️ Offer changed — readiness cleared
        </div>
      )}

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
          {/* Event Log */}
          {events.length > 0 && <EventLog events={events} />}

          {/* Your Offer */}
          <div>
            <ReadyIndicator user={myUser} ready={myReady} side="yours" />
            <div
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-4)',
                background: 'var(--color-teal-light)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '200px',
                border: draggedItem?.source === 'mine' ? '3px dashed var(--color-teal-dark)' : undefined,
                transition: 'border var(--transition-fast)',
              }}
              onDragOver={handleDragOver}
              onDrop={handleDropToMyOffer}
            >
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-3)', color: 'var(--color-teal-dark)' }}>
                Your Offer
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {myOffer.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-teal-dark)', opacity: 0.6 }}>
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

          {/* Their Offer */}
          <div>
            <ReadyIndicator user={theirUser} ready={theirReady} side="theirs" />
            <div
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-4)',
                background: 'var(--color-lilac-light)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '200px',
                border: draggedItem?.source === 'theirs' ? '3px dashed var(--color-lilac-dark)' : undefined,
                transition: 'border var(--transition-fast)',
              }}
              onDragOver={handleDragOver}
              onDrop={handleDropToTheirOffer}
            >
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-3)', color: 'var(--color-lilac-dark)' }}>
                Their Offer
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {theirOffer.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-lilac-dark)', opacity: 0.6 }}>
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

          {/* Totals & Fairness */}
          {(myOffer.length > 0 || theirOffer.length > 0) && (
            <div
              style={{
                background: 'var(--color-white)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-1)' }}>
                    Your Total
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-teal)' }}>
                    ${myTotal}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-1)' }}>
                    Their Total
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-lilac)' }}>
                    ${theirTotal}
                  </div>
                </div>
              </div>

              {fairness && (
                <>
                  <div style={{
                    height: '12px',
                    background: 'var(--color-gray-200)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    marginBottom: 'var(--space-2)',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${fairness.fairness * 100}%`,
                      background: fairness.warn
                        ? 'var(--color-rating-bad)'
                        : fairness.fairness >= 0.9
                        ? 'var(--color-rating-great)'
                        : 'var(--color-rating-fair)',
                      transition: 'all var(--transition-base)',
                    }} />
                  </div>

                  <div style={{
                    fontSize: 'var(--text-sm)',
                    textAlign: 'center',
                    color: fairness.warn
                      ? 'var(--color-rating-bad)'
                      : fairness.fairness >= 0.9
                      ? 'var(--color-rating-great)'
                      : 'var(--color-rating-fair)',
                    fontWeight: 'var(--font-semibold)',
                    marginBottom: 'var(--space-2)',
                  }}>
                    {fairness.warn ? 'bad' : fairness.fairness >= 0.9 ? 'great' : 'fair'}
                  </div>

                  {balancingSuggestion && (
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-gray-700)',
                      textAlign: 'center',
                      padding: 'var(--space-2)',
                      background: 'var(--color-gray-100)',
                      borderRadius: 'var(--radius-md)',
                    }}>
                      💡 {balancingSuggestion}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Ready Toggle */}
          <Button
            variant={myReady ? 'secondary' : 'primary'}
            onClick={toggleMyReady}
            disabled={myOffer.length === 0 || theirOffer.length === 0}
            style={{ width: '100%' }}
          >
            {myReady ? '❌ Not Ready' : '✓ Ready to Trade'}
          </Button>

          {/* Simulate their ready (for demo) */}
          <Button
            variant="ghost"
            onClick={toggleTheirReady}
            style={{ fontSize: 'var(--text-sm)', opacity: 0.6 }}
          >
            [Demo: Toggle Their Ready]
          </Button>

          {/* Confirm Trade */}
          {canConfirm && (
            <div
              style={{
                background: 'var(--color-success)',
                color: 'var(--color-white)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                animation: 'pulse 1s infinite',
              }}
            >
              <Button
                variant="primary"
                onClick={handleConfirmTrade}
                disabled={calculating}
                style={{
                  width: '100%',
                  background: 'var(--color-white)',
                  color: 'var(--color-success)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-bold)',
                }}
              >
                {calculating ? <LoadingSpinner /> : '🎉 Confirm Trade'}
              </Button>
            </div>
          )}
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
              Your Offer ({myOffer.length})
            </Button>
            <Button
              variant={mobileOfferTab === 'theirs' ? 'primary' : 'secondary'}
              onClick={() => setMobileOfferTab('theirs')}
              style={{ flex: 1 }}
            >
              Their Offer ({theirOffer.length})
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
                <ReadyIndicator user={myUser} ready={myReady} side="yours" />
                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
                <ReadyIndicator user={theirUser} ready={theirReady} side="theirs" />
                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
          {fairness && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <span>You: ${myTotal}</span>
                <span style={{
                  color: fairness.warn
                    ? 'var(--color-rating-bad)'
                    : fairness.fairness >= 0.9
                    ? 'var(--color-rating-great)'
                    : 'var(--color-rating-fair)',
                  fontWeight: 'var(--font-bold)',
                }}>
                  {fairness.warn ? 'bad' : fairness.fairness >= 0.9 ? 'great' : 'fair'}
                </span>
                <span>Them: ${theirTotal}</span>
              </div>
              {balancingSuggestion && (
                <div style={{ fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--color-gray-600)' }}>
                  {balancingSuggestion}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant={myReady ? 'secondary' : 'primary'}
              onClick={toggleMyReady}
              disabled={myOffer.length === 0 || theirOffer.length === 0}
              style={{ flex: 1 }}
            >
              {myReady ? '❌ Not Ready' : '✓ Ready'}
            </Button>
            {canConfirm && (
              <Button
                variant="primary"
                onClick={handleConfirmTrade}
                style={{ flex: 2, background: 'var(--color-success)', fontWeight: 'var(--font-bold)' }}
              >
                🎉 Confirm
              </Button>
            )}
          </div>
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
    </div>
  );
}
