import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import db from '../database.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

  const hash = bcrypt.hashSync(password, 10);
  const result = await db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
  const user = await db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = generateToken(user);
  res.status(201).json({ user, token });
}));

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const token = generateToken(user);
  const { password_hash, ...safe } = user;
  res.json({ user: safe, token });
}));

router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
}));

router.put('/reset-password', authMiddleware, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
  if (new_password.length < 3) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 3 caracteres' });
  }
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }
  const hash = bcrypt.hashSync(new_password, 10);
  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ message: 'Senha alterada com sucesso' });
}));

export default router;
