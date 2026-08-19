import express from 'express';
import cors from 'cors';
import authRoutes from '../server/routes/authRoutes.js';
import itemRoutes from '../server/routes/itemRoutes.js';
import matchRoutes from '../server/routes/matchRoutes.js';
import claimRoutes from '../server/routes/claimRoutes.js';
import notifRoutes from '../server/routes/notifRoutes.js';
import adminRoutes from '../server/routes/adminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CampusFind AI Serverless REST API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default app;
