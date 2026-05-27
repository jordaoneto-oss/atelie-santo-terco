import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

  const user = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'Email não encontrado' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000).toISOString();
  await db.prepare('INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expires);

  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const resetLink = `${appUrl}/reset-password/${token}`;
  console.log(`\n[EMAIL SIMULADO] Link de redefinição para ${email}:`);
  console.log(`  ${resetLink}\n`);

  res.json({ message: 'Se o email existir, você receberá um link para redefinir sua senha.', dev_link: resetLink });
}));

router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Nova senha é obrigatória' });
  if (password.length < 3) return res.status(400).json({ error: 'Senha deve ter pelo menos 3 caracteres' });

  const row = await db.prepare("SELECT * FROM reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')").get(token);
  if (!row) return res.status(400).json({ error: 'Token inválido ou expirado' });

  const hash = bcrypt.hashSync(password, 10);
  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id);
  await db.prepare('UPDATE reset_tokens SET used = 1 WHERE id = ?').run(row.id);

  res.json({ message: 'Senha redefinida com sucesso!' });
}));

router.put('/reset-password', authMiddleware, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
  }
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
