import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM customers WHERE user_id = ?';
  const params = [req.user.id];
  if (search) { sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY created_at DESC';
  res.json(await db.prepare(sql).all(...params));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const customer = await db.prepare('SELECT * FROM customers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!customer) return res.status(404).json({ error: 'Cliente não encontrado' });
  customer.orders = await db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC').all(customer.id);
  res.json(customer);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, address, address_street, address_number, address_neighborhood, address_city, address_state, address_zipcode, delivery_address, delivery_street, delivery_number, delivery_neighborhood, delivery_city, delivery_state, delivery_zipcode, instagram, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
  const composed = address_street
    ? [address_street, address_number].filter(Boolean).join(', ') + (address_neighborhood ? ` - ${address_neighborhood}` : '') + (address_city ? ` - ${address_city}/${address_state || ''}` : '') + (address_zipcode ? ` (CEP: ${address_zipcode})` : '')
    : (address || '');
  const composedDelivery = delivery_street
    ? [delivery_street, delivery_number].filter(Boolean).join(', ') + (delivery_neighborhood ? ` - ${delivery_neighborhood}` : '') + (delivery_city ? ` - ${delivery_city}/${delivery_state || ''}` : '') + (delivery_zipcode ? ` (CEP: ${delivery_zipcode})` : '')
    : (delivery_address || '');
  const result = await db.prepare('INSERT INTO customers (user_id, name, email, phone, address, address_street, address_number, address_neighborhood, address_city, address_state, address_zipcode, delivery_address, delivery_street, delivery_number, delivery_neighborhood, delivery_city, delivery_state, delivery_zipcode, instagram, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(req.user.id, name, email || '', phone || '', composed, address_street || '', address_number || '', address_neighborhood || '', address_city || '', address_state || '', address_zipcode || '', composedDelivery, delivery_street || '', delivery_number || '', delivery_neighborhood || '', delivery_city || '', delivery_state || '', delivery_zipcode || '', instagram || '', notes || '');
  const customer = await db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(customer);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const customer = await db.prepare('SELECT * FROM customers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!customer) return res.status(404).json({ error: 'Cliente não encontrado' });
  const { name, email, phone, address, address_street, address_number, address_neighborhood, address_city, address_state, address_zipcode, delivery_address, delivery_street, delivery_number, delivery_neighborhood, delivery_city, delivery_state, delivery_zipcode, instagram, notes } = req.body;
  const composed = address_street
    ? [address_street, address_number].filter(Boolean).join(', ') + (address_neighborhood ? ` - ${address_neighborhood}` : '') + (address_city ? ` - ${address_city}/${address_state || ''}` : '') + (address_zipcode ? ` (CEP: ${address_zipcode})` : '')
    : (address ?? customer.address);
  const composedDelivery = delivery_street
    ? [delivery_street, delivery_number].filter(Boolean).join(', ') + (delivery_neighborhood ? ` - ${delivery_neighborhood}` : '') + (delivery_city ? ` - ${delivery_city}/${delivery_state || ''}` : '') + (delivery_zipcode ? ` (CEP: ${delivery_zipcode})` : '')
    : (delivery_address ?? customer.delivery_address);
  await db.prepare('UPDATE customers SET name=?, email=?, phone=?, address=?, address_street=?, address_number=?, address_neighborhood=?, address_city=?, address_state=?, address_zipcode=?, delivery_address=?, delivery_street=?, delivery_number=?, delivery_neighborhood=?, delivery_city=?, delivery_state=?, delivery_zipcode=?, instagram=?, notes=? WHERE id=?')
    .run(name ?? customer.name, email ?? customer.email, phone ?? customer.phone, composed, address_street ?? customer.address_street, address_number ?? customer.address_number, address_neighborhood ?? customer.address_neighborhood, address_city ?? customer.address_city, address_state ?? customer.address_state, address_zipcode ?? customer.address_zipcode, composedDelivery, delivery_street ?? customer.delivery_street, delivery_number ?? customer.delivery_number, delivery_neighborhood ?? customer.delivery_neighborhood, delivery_city ?? customer.delivery_city, delivery_state ?? customer.delivery_state, delivery_zipcode ?? customer.delivery_zipcode, instagram ?? customer.instagram, notes ?? customer.notes, req.params.id);
  const updated = await db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  res.json(updated);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await db.prepare('DELETE FROM customers WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
  res.json({ message: 'Cliente removido' });
}));

export default router;
