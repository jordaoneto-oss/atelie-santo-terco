import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authMiddleware);

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito a administradores' });
  next();
}

router.get('/', adminOnly, asyncHandler(async (req, res) => {
  const users = await db.prepare('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
}));

router.post('/', adminOnly, asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email já cadastrado' });
  const hash = bcrypt.hashSync(password, 10);
  const result = await db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(name, email, phone || null, hash, role || 'viewer');
  const user = await db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(user);
}));

router.put('/:id', adminOnly, asyncHandler(async (req, res) => {
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  const { name, email, password, phone, role } = req.body;
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    await db.prepare('UPDATE users SET name=?, email=?, phone=?, password_hash=?, role=? WHERE id=?').run(name ?? user.name, email ?? user.email, phone ?? user.phone, hash, role ?? user.role, req.params.id);
  } else {
    await db.prepare('UPDATE users SET name=?, email=?, phone=?, role=? WHERE id=?').run(name ?? user.name, email ?? user.email, phone ?? user.phone, role ?? user.role, req.params.id);
  }
  const updated = await db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
}));

router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Não é possível remover o próprio usuário' });
  const result = await db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ message: 'Usuário removido' });
}));

export default router;
