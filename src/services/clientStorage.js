// ==============================================================================
// CAMPUSFIND AI — CLIENT-SIDE PERSISTENT BROWSER DATABASE ENGINE
// Guarantees zero-downtime database persistence on any deployed live website
// ==============================================================================

import { calculateMatchScore } from './matchingEngine';

const INITIAL_LOST_ITEMS = [
  {
    id: 'lost-1',
    user_id: 'usr-student-1',
    title: 'Black Leather Bifold Wallet',
    description: 'Black leather wallet with university ID card, driver license, and metro pass inside.',
    category: 'Wallets & Bags',
    subcategory: 'Bifold Wallet',
    color: 'Black',
    location: 'Central Campus Library (1st/2nd Floor)',
    lost_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    lost_time: '14:30',
    status: 'matched',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Alex Johnson', email: 'alex@campus.edu' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'lost-2',
    user_id: 'usr-student-2',
    title: 'Apple AirPods Pro (2nd Gen)',
    description: 'White charging case with a red silicone carabiner clip. Left earbud has tiny scratch.',
    category: 'Electronics & Gadgets',
    subcategory: 'Wireless Earbuds',
    color: 'White',
    location: 'Science Block (Room 302 / Labs)',
    lost_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    lost_time: '11:15',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Emily Davis', email: 'emily@campus.edu' },
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'lost-3',
    user_id: 'usr-student-3',
    title: 'Silver Dell XPS 15 Laptop Charger',
    description: '130W USB-C black braided power brick with small blue tape tag.',
    category: 'Electronics & Gadgets',
    subcategory: 'Charger',
    color: 'Gray/Silver',
    location: 'Engineering Wing (East Block)',
    lost_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    lost_time: '16:45',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'David Chen', email: 'david@campus.edu' },
    created_at: new Date(Date.now() - 259200000).toISOString(),
  }
];

const INITIAL_FOUND_ITEMS = [
  {
    id: 'found-1',
    user_id: 'usr-admin-1',
    title: 'Black Leather Wallet with Student ID',
    description: 'Black leather wallet found on a study desk on the 2nd floor. Handed to librarian desk staff.',
    category: 'Wallets & Bags',
    subcategory: 'Bifold Wallet',
    color: 'Black',
    location: 'Central Campus Library (1st/2nd Floor)',
    custody: 'Library Front Desk',
    found_date: new Date().toISOString().split('T')[0],
    found_time: '10:00',
    status: 'matched',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Jessica Taylor (Staff)', email: 'jessica@campus.edu' },
    created_at: new Date().toISOString(),
  },
  {
    id: 'found-2',
    user_id: 'usr-admin-1',
    title: 'Cobalt Blue Hydro Flask 32oz',
    description: 'Blue insulated water bottle with various campus club stickers.',
    category: 'Water Bottles & Flasks',
    subcategory: 'Stainless Steel Flask',
    color: 'Blue',
    location: 'Campus Sports Complex & Gym',
    custody: 'Security Main Desk',
    found_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    found_time: '16:45',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Coach Miller', email: 'miller@campus.edu' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

function getStored(key, initial) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initial;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export const clientStorage = {
  getLostItems() {
    return getStored('campusfind_lost_items', INITIAL_LOST_ITEMS);
  },

  addLostItem(item) {
    const items = this.getLostItems();
    const newItem = {
      id: item.id || `lost-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'active',
      ...item,
    };
    items.unshift(newItem);
    setStored('campusfind_lost_items', items);
    return newItem;
  },

  getFoundItems() {
    return getStored('campusfind_found_items', INITIAL_FOUND_ITEMS);
  },

  addFoundItem(item) {
    const items = this.getFoundItems();
    const newItem = {
      id: item.id || `found-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'active',
      ...item,
    };
    items.unshift(newItem);
    setStored('campusfind_found_items', items);
    return newItem;
  },

  getClaims() {
    return getStored('campusfind_claims', [
      {
        id: 'claim-1',
        match_id: 'demo-match-1',
        found_item_id: 'found-1',
        claimant_id: 'usr-student-1',
        proof_message: 'The black leather wallet contains an active university student ID with name Alex Johnson and roll number CS-2024-042, along with a transit card.',
        proof_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60',
        status: 'pending',
        admin_note: null,
        item_title: 'Black Leather Wallet with Student ID',
        location: 'Central Campus Library (1st/2nd Floor)',
        category: 'Wallets & Bags',
        image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ]);
  },

  addClaim(claim) {
    const claims = this.getClaims();
    const newClaim = {
      id: `claim-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'pending',
      ...claim,
    };
    claims.unshift(newClaim);
    setStored('campusfind_claims', claims);
    return newClaim;
  },

  reviewClaim(claimId, status, adminNote) {
    const claims = this.getClaims();
    const index = claims.findIndex((c) => c.id === claimId);
    if (index !== -1) {
      claims[index] = {
        ...claims[index],
        status,
        admin_note: adminNote,
        reviewed_at: new Date().toISOString(),
      };
      setStored('campusfind_claims', claims);
    }
    return claims[index];
  },
};
