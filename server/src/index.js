import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Event from './models/Event.js';

// Load the shared project-root .env even when npm starts this workspace from server/.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const app = express();
const port = Number(process.env.PORT || 4000);
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/events', async (req, res, next) => {
  try {
    const { sessionId, type, pageUrl, timestamp, x, y, viewportWidth, viewportHeight } = req.body || {};
    if (typeof sessionId !== 'string' || !sessionId.trim() || !['page_view', 'click'].includes(type) || typeof pageUrl !== 'string' || !pageUrl.trim()) {
      return res.status(400).json({ error: 'sessionId, pageUrl, and a valid event type are required.' });
    }
    if (type === 'click' && (![x, y].every(Number.isFinite) || x < 0 || y < 0)) {
      return res.status(400).json({ error: 'Click events require non-negative x and y coordinates.' });
    }
    const event = await Event.create({
      sessionId: sessionId.trim(), type, pageUrl: pageUrl.trim(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      ...(type === 'click' ? { x, y, viewportWidth, viewportHeight } : {})
    });
    res.status(201).json({ id: event.id, message: 'Event stored.' });
  } catch (error) { next(error); }
});

app.get('/api/sessions', async (_req, res, next) => {
  try {
    const sessions = await Event.aggregate([
      { $group: { _id: '$sessionId', eventCount: { $sum: 1 }, lastSeen: { $max: '$timestamp' } } },
      { $sort: { lastSeen: -1 } },
      { $project: { _id: 0, sessionId: '$_id', eventCount: 1, lastSeen: 1 } }
    ]);
    res.json(sessions);
  } catch (error) { next(error); }
});

app.get('/api/sessions/:sessionId/events', async (req, res, next) => {
  try {
    const events = await Event.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 }).lean();
    res.json(events);
  } catch (error) { next(error); }
});

app.get('/api/pages', async (_req, res, next) => {
  try {
    const pages = await Event.distinct('pageUrl');
    res.json(pages.sort());
  } catch (error) { next(error); }
});

app.get('/api/clicks', async (req, res, next) => {
  try {
    if (!req.query.pageUrl) return res.status(400).json({ error: 'pageUrl query parameter is required.' });
    const clicks = await Event.find({ pageUrl: req.query.pageUrl, type: 'click' })
      .select('sessionId timestamp x y viewportWidth viewportHeight').sort({ timestamp: -1 }).lean();
    res.json(clicks);
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'The server could not complete the request.' });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/user_analytics')
  .then(() => app.listen(port, () => console.log(`Analytics API listening at http://localhost:${port}`)))
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
