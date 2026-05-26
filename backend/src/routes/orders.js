import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authMiddleware);

router.get('/stats/summary', asyncHandler(async (req, res) => {
  const totalOrders = (await db.prepare('SELECT COUNT(*) as count FROM orders').get()).count;
  const totalRevenue = (await db.prepare("SELECT COALESCE(SUM(total),0) as sum FROM orders WHERE status != 'cancelled'").get()).sum;
  const totalProducts = (await db.prepare('SELECT COUNT(*) as count FROM products').get()).count;
  const totalCustomers = (await db.prepare('SELECT COUNT(*) as count FROM customers').get()).count;
  const pendingOrders = (await db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get()).count;
  res.json({ totalOrders, totalRevenue, totalProducts, totalCustomers, pendingOrders });
}));

router.get('/', asyncHandler(async (req, res) => {
  const { status, customer_id } = req.query;
  let sql = 'SELECT o.*, u.name as created_by_name FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND o.status = ?'; params.push(status); }
  if (customer_id) { sql += ' AND o.customer_id = ?'; params.push(customer_id); }
  sql += ' ORDER BY o.created_at DESC';

  const orders = await db.prepare(sql).all(...params);
  const itemsStmt = db.prepare(`
    SELECT oi.*, p.name as product_name FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `);
  const customerStmt = db.prepare('SELECT id, name FROM customers WHERE id = ?');

  const result = await Promise.all(orders.map(async o => ({
    ...o,
    items: await itemsStmt.all(o.id),
    customer: o.customer_id ? await customerStmt.get(o.customer_id) : null,
  })));
  res.json(result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const order = await db.prepare('SELECT o.*, u.name as created_by_name FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  order.items = await db.prepare(`
    SELECT oi.*, p.name as product_name, p.image_url FROM order_items oi
    JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?
  `).all(order.id);
  order.customer = order.customer_id ? await db.prepare('SELECT id, name, email, phone FROM customers WHERE id = ?').get(order.customer_id) : null;
  res.json(order);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { customer_id, items, notes } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Pedido deve ter ao menos 1 item' });

  let total = 0;
  for (const item of items) {
    const product = await db.prepare('SELECT price FROM products WHERE id = ?').get(item.product_id);
    if (!product) return res.status(400).json({ error: `Produto ${item.product_id} não encontrado` });
    total += product.price * (item.quantity || 1);
  }

  const orderResult = await db.prepare('INSERT INTO orders (user_id, customer_id, total, notes) VALUES (?, ?, ?, ?)')
    .run(req.user.id, customer_id || null, total, notes || '');

  const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)');
  for (const item of items) {
    const product = await db.prepare('SELECT price FROM products WHERE id = ?').get(item.product_id);
    await insertItem.run(orderResult.lastInsertRowid, item.product_id, item.variant_id || null, item.quantity || 1, product.price);
  }

  const order = await db.prepare('SELECT o.*, u.name as created_by_name FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = ?').get(orderResult.lastInsertRowid);
  order.items = await db.prepare('SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?').all(order.id);
  res.status(201).json(order);
}));

router.put('/:id/status', asyncHandler(async (req, res) => {
  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Status inválido' });
  await db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
  const updated = await db.prepare('SELECT o.*, u.name as created_by_name FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = ?').get(req.params.id);
  res.json(updated);
}));

export default router;
