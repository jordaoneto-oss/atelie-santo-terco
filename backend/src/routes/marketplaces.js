import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const integrations = await db.prepare('SELECT * FROM marketplace_integrations WHERE user_id = ?').all(req.user.id);
  res.json(integrations);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { marketplace, access_token, refresh_token, seller_id, store_name, client_id, client_secret } = req.body;
  if (!marketplace) return res.status(400).json({ error: 'Marketplace é obrigatório' });
  const existing = await db.prepare('SELECT id FROM marketplace_integrations WHERE user_id = ? AND marketplace = ?').get(req.user.id, marketplace);
  if (existing) {
    await db.prepare('UPDATE marketplace_integrations SET access_token=?, refresh_token=?, seller_id=?, store_name=?, client_id=?, client_secret=?, is_active=1, updated_at=datetime("now") WHERE id=?')
      .run(access_token || '', refresh_token || '', seller_id || '', store_name || '', client_id || '', client_secret || '', existing.id);
    const updated = await db.prepare('SELECT * FROM marketplace_integrations WHERE id = ?').get(existing.id);
    return res.json(updated);
  }
  const result = await db.prepare('INSERT INTO marketplace_integrations (user_id, marketplace, access_token, refresh_token, seller_id, store_name, client_id, client_secret, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)')
    .run(req.user.id, marketplace, access_token || '', refresh_token || '', seller_id || '', store_name || '', client_id || '', client_secret || '');
  const integration = await db.prepare('SELECT * FROM marketplace_integrations WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(integration);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const integration = await db.prepare('SELECT * FROM marketplace_integrations WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!integration) return res.status(404).json({ error: 'Integração não encontrada' });
  const { access_token, refresh_token, seller_id, store_name, client_id, client_secret, is_active } = req.body;
  await db.prepare('UPDATE marketplace_integrations SET access_token=?, refresh_token=?, seller_id=?, store_name=?, client_id=?, client_secret=?, is_active=?, updated_at=datetime("now") WHERE id=?')
    .run(access_token ?? integration.access_token, refresh_token ?? integration.refresh_token, seller_id ?? integration.seller_id, store_name ?? integration.store_name, client_id ?? integration.client_id, client_secret ?? integration.client_secret, is_active ?? integration.is_active, req.params.id);
  const updated = await db.prepare('SELECT * FROM marketplace_integrations WHERE id = ?').get(req.params.id);
  res.json(updated);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await db.prepare('DELETE FROM marketplace_integrations WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Integração não encontrada' });
  res.json({ message: 'Integração removida' });
}));

export default router;
