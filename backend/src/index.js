import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import marketplaceRoutes from './routes/marketplaces.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = join(__dirname, '..', 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/marketplaces', marketplaceRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/__migrate', async (req, res) => {
  try {
    const { runSeed } = await import('./seed.js');
    await runSeed();
    res.json({ message: 'Migração executada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
