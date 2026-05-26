import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  let sql = 'SELECT p.*, u.name as created_by_name FROM products p LEFT JOIN users u ON u.id = p.user_id WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND p.status = ?'; params.push(status); }
  if (search) { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY p.created_at DESC';

  const products = await db.prepare(sql).all(...params);
  const stmt = db.prepare('SELECT * FROM product_variants WHERE product_id = ?');

  const result = await Promise.all(products.map(async p => ({
    ...p,
    variants: await stmt.all(p.id),
  })));
  res.json(result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await db.prepare('SELECT p.*, u.name as created_by_name FROM products p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  product.variants = await db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id);
  res.json(product);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }
  const result = await db.prepare(`
    INSERT INTO products (user_id, name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, name, description || '', price, cost || 0, dimensions || '', weight || 0, crucifixo || '', entremeio || '', contas || '', resina ? 1 : 0, tipo_banho || '', detalhes_memo || '', categoria || '', stock || 0, status || 'active');

  const product = await db.prepare('SELECT p.*, u.name as created_by_name FROM products p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

  const { name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status, image_url } = req.body;
  await db.prepare(`
    UPDATE products SET name=?, description=?, price=?, cost=?, dimensions=?, weight=?, crucifixo=?, entremeio=?, contas=?, resina=?, tipo_banho=?, detalhes_memo=?, categoria=?, stock=?, status=?, image_url=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    name ?? product.name, description ?? product.description, price ?? product.price,
    cost ?? product.cost, dimensions ?? product.dimensions,
    weight ?? product.weight, crucifixo ?? product.crucifixo, entremeio ?? product.entremeio,
    contas ?? product.contas, resina !== undefined ? (resina ? 1 : 0) : product.resina,
    tipo_banho ?? product.tipo_banho, detalhes_memo ?? product.detalhes_memo,
    categoria ?? product.categoria, stock ?? product.stock, status ?? product.status,
    image_url ?? product.image_url, req.params.id
  );

  const updated = await db.prepare('SELECT p.*, u.name as created_by_name FROM products p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = ?').get(req.params.id);
  res.json(updated);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json({ message: 'Produto removido' });
}));

router.post('/:id/variants', asyncHandler(async (req, res) => {
  const product = await db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  const { name, color, material, price_modifier, stock } = req.body;
  const result = await db.prepare(`
    INSERT INTO product_variants (product_id, name, color, material, price_modifier, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.id, name || '', color || '', material || '', price_modifier || 0, stock || 0);
  const variant = await db.prepare('SELECT * FROM product_variants WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(variant);
}));

router.delete('/variants/:id', asyncHandler(async (req, res) => {
  const result = await db.prepare('DELETE FROM product_variants WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Variante não encontrada' });
  res.json({ message: 'Variante removida' });
}));

export default router;
