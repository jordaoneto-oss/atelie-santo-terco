import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbDir = existsSync('/data') ? '/data' : join(__dirname, '..', 'data');
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const db = new Database(join(dbDir, '3dprint.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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
    cpf TEXT,
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
    payment_method TEXT DEFAULT 'pix',
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
    expires_at TIMESTAMP NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

try { db.exec('ALTER TABLE customers ADD COLUMN delivery_address TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN instagram TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN address_street TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN address_number TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN address_neighborhood TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN address_city TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN address_state TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN address_zipcode TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN delivery_street TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN delivery_number TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN delivery_neighborhood TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN delivery_city TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN delivery_state TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN delivery_zipcode TEXT'); } catch {}
try { db.exec('ALTER TABLE customers ADD COLUMN cpf TEXT'); } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN crucifixo TEXT'); } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN entremeio TEXT'); } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN contas TEXT'); } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN resina INTEGER DEFAULT 0'); } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN tipo_banho TEXT'); } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN detalhes_memo TEXT'); } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN categoria TEXT'); } catch {}
try { db.exec("ALTER TABLE customers ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"); } catch {}
try { db.exec("ALTER TABLE orders ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"); } catch {}
try { db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'pix'"); } catch {}

export default db;