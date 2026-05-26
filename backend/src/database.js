import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

const dbUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL || Object.entries(process.env).find(([k]) => k.endsWith('_POSTGRES_URL'))?.[1] || '').replace(/sslmode=[^&]*&?/, '');
if (dbUrl) {
  const pg = await import('pg');
  const pool = new pg.default.Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const prepare = (sql) => {
    let i = 0;
    let pgSql = sql
      .replace(/\?/g, () => `$${++i}`)
      .replace(/datetime\('now'\)/g, 'CURRENT_TIMESTAMP');
    return {
      get: (...params) => pool.query(pgSql, params).then(r => r.rows[0] ?? null),
      all: (...params) => pool.query(pgSql, params).then(r => r.rows),
      run: (...params) => pool.query(pgSql, params).then(r => ({ lastInsertRowid: r.rows[0]?.id, changes: r.rowCount })),
    };
  };

  const exec = (sql) => pool.query(sql);

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      cost REAL DEFAULT 0,
      dimensions TEXT,
      weight REAL,
      crucifixo TEXT,
      entremeio TEXT,
      contas TEXT,
      resina INTEGER DEFAULT 0,
      tipo_banho TEXT,
      detalhes_memo TEXT,
      categoria TEXT,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS product_variants (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT,
      color TEXT,
      material TEXT,
      price_modifier REAL DEFAULT 0,
      stock INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      address_street TEXT,
      address_number TEXT,
      address_neighborhood TEXT,
      address_city TEXT,
      address_state TEXT,
      address_zipcode TEXT,
      delivery_address TEXT,
      delivery_street TEXT,
      delivery_number TEXT,
      delivery_neighborhood TEXT,
      delivery_city TEXT,
      delivery_state TEXT,
      delivery_zipcode TEXT,
      instagram TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      customer_id INTEGER REFERENCES customers(id),
      status TEXT DEFAULT 'pending',
      total REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      variant_id INTEGER,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS marketplace_integrations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      marketplace TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      seller_id TEXT,
      store_name TEXT,
      client_id TEXT,
      client_secret TEXT,
      is_active INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(schema);

  db = { prepare, exec };
} else {
  const Database = (await import('better-sqlite3')).default;
  const { mkdirSync, existsSync } = await import('fs');
  const dbDir = join(__dirname, '..', 'data');
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
  const s = new Database(join(dbDir, '3dprint.db'));
  s.pragma('journal_mode = WAL');
  s.pragma('foreign_keys = ON');

  s.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      cost REAL DEFAULT 0,
      dimensions TEXT,
      weight REAL,
      crucifixo TEXT,
      entremeio TEXT,
      contas TEXT,
      resina INTEGER DEFAULT 0,
      tipo_banho TEXT,
      detalhes_memo TEXT,
      categoria TEXT,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      name TEXT,
      color TEXT,
      material TEXT,
      price_modifier REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      address_street TEXT,
      address_number TEXT,
      address_neighborhood TEXT,
      address_city TEXT,
      address_state TEXT,
      address_zipcode TEXT,
      delivery_address TEXT,
      delivery_street TEXT,
      delivery_number TEXT,
      delivery_neighborhood TEXT,
      delivery_city TEXT,
      delivery_state TEXT,
      delivery_zipcode TEXT,
      instagram TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_id INTEGER,
      status TEXT DEFAULT 'pending',
      total REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  try { s.exec('ALTER TABLE customers ADD COLUMN delivery_address TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN instagram TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN address_street TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN address_number TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN address_neighborhood TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN address_city TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN address_state TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN address_zipcode TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN delivery_street TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN delivery_number TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN delivery_neighborhood TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN delivery_city TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN delivery_state TEXT'); } catch {}
  try { s.exec('ALTER TABLE customers ADD COLUMN delivery_zipcode TEXT'); } catch {}
  try { s.exec('ALTER TABLE products ADD COLUMN crucifixo TEXT'); } catch {}
  try { s.exec('ALTER TABLE products ADD COLUMN entremeio TEXT'); } catch {}
  try { s.exec('ALTER TABLE products ADD COLUMN contas TEXT'); } catch {}
  try { s.exec('ALTER TABLE products ADD COLUMN resina INTEGER DEFAULT 0'); } catch {}
  try { s.exec('ALTER TABLE products ADD COLUMN tipo_banho TEXT'); } catch {}
  try { s.exec('ALTER TABLE products ADD COLUMN detalhes_memo TEXT'); } catch {}
  try { s.exec('ALTER TABLE products ADD COLUMN categoria TEXT'); } catch {}
  try { s.exec("ALTER TABLE customers ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"); } catch {}
  try { s.exec("ALTER TABLE orders ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"); } catch {}

  db = s;
}

export default db;
