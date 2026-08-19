import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'campusfind.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const INITIAL_SEED_DATA = {
  users: [
    {
      id: 'usr-student-1',
      email: 'alex@campus.edu',
      password: 'password123',
      full_name: 'Alex Johnson',
      college_id: 'CS-2024-042',
      phone: '+1 (555) 019-2834',
      role: 'student',
      avatar_url: null,
      created_at: '2026-08-10T09:00:00.000Z'
    },
    {
      id: 'usr-admin-1',
      email: 'admin@campus.edu',
      password: 'adminpassword',
      full_name: 'Dr. Sarah Mitchell',
      college_id: 'STAFF-ADMIN-01',
      phone: '+1 (555) 012-9988',
      role: 'admin',
      avatar_url: null,
      created_at: '2026-08-01T08:00:00.000Z'
    },
    {
      id: 'usr-student-2',
      email: 'emily@campus.edu',
      password: 'password123',
      full_name: 'Emily Davis',
      college_id: 'BIO-2023-119',
      phone: '+1 (555) 014-7721',
      role: 'student',
      avatar_url: null,
      created_at: '2026-08-12T10:00:00.000Z'
    }
  ],
  lost_items: [
    {
      id: 'lost-item-1',
      user_id: 'usr-student-1',
      title: 'Black Leather Bifold Wallet',
      description: 'Contains university student card, driver license, and metro pass.',
      category: 'Wallets & Bags',
      subcategory: 'Bifold Wallet',
      color: 'Black',
      location: 'Central Campus Library (1st/2nd Floor)',
      lost_date: '2026-08-18',
      lost_time: '14:30',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
      status: 'matched',
      created_at: '2026-08-18T15:00:00.000Z'
    },
    {
      id: 'lost-item-2',
      user_id: 'usr-student-2',
      title: 'Apple AirPods Pro (2nd Gen)',
      description: 'White charging case with red silicone carabiner clip.',
      category: 'Electronics & Gadgets',
      subcategory: 'Headphones & Earbuds',
      color: 'White',
      location: 'Science Block (Room 302 / Labs)',
      lost_date: '2026-08-17',
      lost_time: '11:15',
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
      status: 'active',
      created_at: '2026-08-17T12:00:00.000Z'
    }
  ],
  found_items: [
    {
      id: 'found-item-1',
      user_id: 'usr-admin-1',
      title: 'Black Leather Wallet with Student ID',
      description: 'Black leather wallet found on a study desk. Handed to librarian desk staff.',
      category: 'Wallets & Bags',
      subcategory: 'Bifold Wallet',
      color: 'Black',
      location: 'Central Campus Library (1st/2nd Floor)',
      custody: 'Library Front Desk',
      found_date: '2026-08-19',
      found_time: '10:00',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
      status: 'matched',
      created_at: '2026-08-19T10:30:00.000Z'
    },
    {
      id: 'found-item-2',
      user_id: 'usr-admin-1',
      title: 'Cobalt Blue Hydro Flask 32oz',
      description: 'Found near basketball court bleachers.',
      category: 'Water Bottles & Flasks',
      subcategory: 'Stainless Steel Flask',
      color: 'Blue',
      location: 'Campus Sports Complex',
      custody: 'Security Main Desk',
      found_date: '2026-08-18',
      found_time: '16:45',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
      status: 'active',
      created_at: '2026-08-18T17:00:00.000Z'
    }
  ],
  matches: [
    {
      id: 'match-1',
      lost_item_id: 'lost-item-1',
      found_item_id: 'found-item-1',
      match_score: 94,
      category_score: 100,
      description_score: 88,
      location_score: 100,
      date_score: 95,
      color_score: 100,
      image_score: 90,
      match_reason: [
        'Identical Category (Wallets & Bags)',
        'Matching / Adjacent Location (Central Campus Library)',
        'Dates align within 24–72 hours',
        'Matching color profile (Black)',
        'Textual description & keyword correlation'
      ],
      status: 'suggested',
      created_at: '2026-08-19T10:35:00.000Z'
    }
  ],
  claims: [
    {
      id: 'claim-1',
      match_id: 'match-1',
      found_item_id: 'found-item-1',
      claimant_id: 'usr-student-1',
      proof_message: 'The black leather wallet contains an active university student ID with name Alex Johnson and roll number CS-2024-042, along with a transit card.',
      proof_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60',
      status: 'pending',
      admin_note: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: '2026-08-19T11:00:00.000Z'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      user_id: 'usr-student-1',
      title: 'High-Confidence Match (94%) Found!',
      message: 'A Black Leather Wallet found at Central Campus Library matches your lost report.',
      type: 'match_found',
      reference_id: '/matches?id=match-1',
      is_read: false,
      created_at: '2026-08-19T10:36:00.000Z'
    },
    {
      id: 'notif-2',
      user_id: 'usr-student-1',
      title: 'Claim Submitted Successfully',
      message: 'Your claim for Black Leather Wallet is currently under administrative review.',
      type: 'claim_submitted',
      reference_id: '/claims',
      is_read: false,
      created_at: '2026-08-19T11:01:00.000Z'
    }
  ],
  admin_actions: [
    {
      id: 'log-1',
      admin_id: 'usr-admin-1',
      admin_name: 'Dr. Sarah Mitchell',
      action: 'SYSTEM_INITIALIZATION',
      target_type: 'system',
      target_id: 'sys',
      description: 'CampusFind AI database schema initialized with persistent storage.',
      timestamp: '2026-08-19T08:00:00.000Z'
    }
  ]
};

export const db = {
  read() {
    if (!fs.existsSync(DB_FILE)) {
      this.write(INITIAL_SEED_DATA);
      return INITIAL_SEED_DATA;
    }
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading database file, resetting to seed:', err);
      this.write(INITIAL_SEED_DATA);
      return INITIAL_SEED_DATA;
    }
  },

  write(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  },

  getCollection(name) {
    const data = this.read();
    return data[name] || [];
  },

  setCollection(name, items) {
    const data = this.read();
    data[name] = items;
    this.write(data);
  },

  insert(collectionName, item) {
    const data = this.read();
    if (!data[collectionName]) {
      data[collectionName] = [];
    }
    const newItem = {
      id: item.id || `${collectionName.slice(0, 4)}-${Date.now()}`,
      created_at: item.created_at || new Date().toISOString(),
      ...item
    };
    data[collectionName].unshift(newItem);
    this.write(data);
    return newItem;
  },

  update(collectionName, id, updates) {
    const data = this.read();
    if (!data[collectionName]) return null;
    const index = data[collectionName].findIndex((i) => i.id === id);
    if (index === -1) return null;
    data[collectionName][index] = {
      ...data[collectionName][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.write(data);
    return data[collectionName][index];
  },

  delete(collectionName, id) {
    const data = this.read();
    if (!data[collectionName]) return false;
    data[collectionName] = data[collectionName].filter((i) => i.id !== id);
    this.write(data);
    return true;
  }
};
