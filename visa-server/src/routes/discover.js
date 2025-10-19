const express = require('express');
const { ensureUser } = require('../db/memory');
const { findUserById, getAllUsers, getUserInventory } = require('../db/filedb');
const router = express.Router();

// Discover/browse endpoint - returns items from all users' inventories
// GET /api/discover?category=&condition=&tradeValue=&search=
router.get('/', async (req, res) => {
  const { category, condition, tradeValue, search, sort } = req.query;

  try {
    console.log('[Discover API] Fetching all users and their inventories');
    
    // Get all users
    const usersData = await getAllUsers();
    const users = Object.values(usersData);
    
    console.log('[Discover API] Found', users.length, 'users');
    
    // Collect all items from all users
    let allItems = [];
    
    for (const user of users) {
      try {
        const inventory = await getUserInventory(user.id);
        // getUserInventory returns an array directly, not { items: [] }
        if (inventory && Array.isArray(inventory) && inventory.length > 0) {
          console.log('[Discover API] User', user.username, 'has', inventory.length, 'items');
          // Add user info to each item
          const itemsWithUser = inventory.map(item => ({
            ...item,
            userId: user.id,
            user: {
              id: user.id,
              username: user.username,
              avatar: user.avatar || '😊',
              level: user.level || 1,
            }
          }));
          allItems = allItems.concat(itemsWithUser);
        } else {
          console.log('[Discover API] User', user.username, 'has no items');
        }
      } catch (err) {
        console.log('[Discover API] Error getting inventory for user', user.id, ':', err.message);
      }
    }
    
    console.log('[Discover API] Total items found:', allItems.length);
    
    // Apply filters
    let filteredItems = allItems;
    
    // Filter by category
    if (category && category !== '') {
      filteredItems = filteredItems.filter(item => 
        item.category && item.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by condition
    if (condition && condition !== '') {
      filteredItems = filteredItems.filter(item => 
        item.condition === condition
      );
    }
    
    // Filter by search term
    if (search && search !== '') {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.category && item.category.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort items
    if (sort === 'newest') {
      filteredItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    } else if (sort === 'value-high') {
      filteredItems.sort((a, b) => 
        (b.valuation?.estimate?.mid || 0) - (a.valuation?.estimate?.mid || 0)
      );
    } else if (sort === 'value-low') {
      filteredItems.sort((a, b) => 
        (a.valuation?.estimate?.mid || 0) - (b.valuation?.estimate?.mid || 0)
      );
    }
    
    console.log('[Discover API] Returning', filteredItems.length, 'filtered items');
    
    res.json({ ok: true, items: filteredItems });
  } catch (error) {
    console.error('[Discover API] Error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch items' });
  }
});

module.exports = router;
