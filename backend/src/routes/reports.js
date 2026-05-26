import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authMiddleware);

router.get('/sales', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { customer_id, categoria, data_inicio, data_fim } = req.query;

  let where = 'WHERE o.user_id = ? AND o.status != ?';
  const params = [userId, 'cancelled'];

  if (customer_id) { where += ' AND o.customer_id = ?'; params.push(customer_id); }
  if (data_inicio) { where += ' AND o.created_at >= ?'; params.push(data_inicio); }
  if (data_fim) { where += ' AND o.created_at <= ?'; params.push(data_fim + ' 23:59:59'); }

  let productWhere = '';
  const productParams = [];
  if (categoria) { productWhere = ' AND p.categoria = ?'; productParams.push(categoria); }

  const ranking = await db.prepare(`
    SELECT
      p.id,
      p.name,
      p.categoria,
      SUM(oi.quantity) as total_qty,
      SUM(oi.quantity * oi.unit_price) as total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    ${where}${productWhere}
    GROUP BY p.id
    ORDER BY total_qty DESC
  `).all(...params, ...productParams);

  const summary = await db.prepare(`
    SELECT
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(oi.quantity), 0) as total_items_sold,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    ${where}
  `).get(...params);

  res.json({ ranking, summary });
}));

export default router;
