import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import { runSeed } from './seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
let uploadDir;
try {
  uploadDir = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
} catch {}

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'https://santoterco.vercel.app' }));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use(limiter);

app.use((req, res, next) => {
  if (req.path.startsWith('/_/backend')) {
    req.url = req.url.replace('/_/backend', '');
  }
  next();
});

if (uploadDir) app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/seed', async (req, res) => {
  try {
    await runSeed();
    res.json({ ok: true, message: 'Seed executado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

export default app;
