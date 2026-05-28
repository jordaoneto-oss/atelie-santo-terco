import bcrypt from 'bcryptjs';

async function seedPg(pool) {
  const hash = bcrypt.hashSync('admin123', 10);

  async function upsertUser(name, email, password, role, phone) {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      const h = bcrypt.hashSync(password, 10);
      await pool.query('INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5)', [name, email, phone || null, h, role]);
    }
  }

  await upsertUser('Juliana Rocha', 'profajurocha@gmail.com', 'admin123', 'admin', '11999990001');
  await upsertUser('Administrador', 'admin@atelie.com', 'admin', 'admin', '11999990002');
  await upsertUser('Jordão Neto', 'jordaosneto@hotmail.com', '180203', 'admin');

  const uid = (await pool.query("SELECT id FROM users WHERE email = 'profajurocha@gmail.com'")).rows[0].id;

  await pool.query(`
    INSERT INTO products (id, user_id, name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status)
    VALUES ($1, $2, 'Terço de Nossa Senhora Aparecida', 'Terço artesanal com contas em tom azul e branco, medalha de Nossa Senhora Aparecida', 79.90, 25.00, '50cm', 35, 'Cruz de Nossa Senhora', 'Medalha Aparecida', 'Azul e Branco', 1, 'Dourado', 'Memo personalizado', 'Premium', 20, 'active')
    ON CONFLICT (id) DO NOTHING
  `, [1, uid]);
  await pool.query(`
    INSERT INTO products (id, user_id, name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status)
    VALUES ($1, $2, 'Terço de São Bento', 'Terço com medalha de São Bento e contas em marrom e dourado', 89.90, 30.00, '50cm', 38, 'Cruz de São Bento', 'Medalha São Bento', 'Marrom e Dourado', 1, 'Ouro Velho', '', 'Luxo', 25, 'active')
    ON CONFLICT (id) DO NOTHING
  `, [2, uid]);
  await pool.query(`
    INSERT INTO products (id, user_id, name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status)
    VALUES ($1, $2, 'Terço do Divino Pai Eterno', 'Terço nas cores vermelho e branco com medalha do Divino Pai Eterno', 74.90, 22.00, '50cm', 32, 'Cruz Divino Pai Eterno', 'Medalha Pai Eterno', 'Vermelho e Branco', 1, 'Níquel', '', 'Dia a Dia', 30, 'active')
    ON CONFLICT (id) DO NOTHING
  `, [3, uid]);
  await pool.query(`
    INSERT INTO products (id, user_id, name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status)
    VALUES ($1, $2, 'Imagem de Santo Expedito', 'Imagem ornamentada de Santo Expedito em resina - 15cm', 69.90, 20.00, '8x8x15cm', 120, '', '', '', 1, 'Dourado', '', 'Premium', 15, 'active')
    ON CONFLICT (id) DO NOTHING
  `, [4, uid]);
  await pool.query(`
    INSERT INTO products (id, user_id, name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status)
    VALUES ($1, $2, 'Imagem de São Jorge', 'Imagem de São Jorge com detalhes em dourado - 20cm', 99.90, 35.00, '10x8x20cm', 180, '', '', '', 1, 'Ouro Velho', '', 'Luxo', 12, 'active')
    ON CONFLICT (id) DO NOTHING
  `, [5, uid]);
  await pool.query(`
    INSERT INTO products (id, user_id, name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status)
    VALUES ($1, $2, 'Terço de Santa Rita', 'Terço delicado em tom rosa com medalha de Santa Rita dos Impossíveis', 84.90, 28.00, '50cm', 36, 'Cruz Santa Rita', 'Medalha Santa Rita', 'Rosa e Branco', 1, 'Dourado', '', 'Noiva', 18, 'active')
    ON CONFLICT (id) DO NOTHING
  `, [6, uid]);

  await pool.query(`
    INSERT INTO product_variants (id, product_id, name, color, material, price_modifier, stock) VALUES (1, 1, 'Azul Claro', 'Azul', 'Resina', 0, 10) ON CONFLICT (id) DO NOTHING
  `);
  await pool.query(`
    INSERT INTO product_variants (id, product_id, name, color, material, price_modifier, stock) VALUES (2, 1, 'Azul Escuro', 'Azul Escuro', 'Resina', 5, 8) ON CONFLICT (id) DO NOTHING
  `);
  await pool.query(`
    INSERT INTO product_variants (id, product_id, name, color, material, price_modifier, stock) VALUES (3, 2, 'Marrom Escuro', 'Marrom', 'Resina', 0, 12) ON CONFLICT (id) DO NOTHING
  `);
  await pool.query(`
    INSERT INTO product_variants (id, product_id, name, color, material, price_modifier, stock) VALUES (4, 2, 'Marrom Claro', 'Marrom Claro', 'Resina', 0, 10) ON CONFLICT (id) DO NOTHING
  `);
  await pool.query(`
    INSERT INTO product_variants (id, product_id, name, color, material, price_modifier, stock) VALUES (5, 3, 'Vermelho', 'Vermelho', 'Resina', 0, 15) ON CONFLICT (id) DO NOTHING
  `);
  await pool.query(`
    INSERT INTO product_variants (id, product_id, name, color, material, price_modifier, stock) VALUES (6, 3, 'Branco', 'Branco', 'Resina', 0, 15) ON CONFLICT (id) DO NOTHING
  `);

  await pool.query(`
    INSERT INTO customers (id, user_id, name, email, phone, address, address_street, address_number, address_neighborhood, address_city, address_state, address_zipcode, instagram)
    VALUES (1, $1, 'João Silva', 'joao@email.com', '(11) 99999-0001', 'Rua das Flores, 123 - Centro - São Paulo/SP (CEP: 01001-000)', 'Rua das Flores', '123', 'Centro', 'São Paulo', 'SP', '01001-000', '@joaosilva')
    ON CONFLICT (id) DO NOTHING
  `, [uid]);
  await pool.query(`
    INSERT INTO customers (id, user_id, name, email, phone, address, address_street, address_number, address_neighborhood, address_city, address_state, address_zipcode, instagram)
    VALUES (2, $1, 'Maria Santos', 'maria@email.com', '(11) 99999-0002', 'Av. Paulista, 456 - Bela Vista - São Paulo/SP (CEP: 01311-000)', 'Av. Paulista', '456', 'Bela Vista', 'São Paulo', 'SP', '01311-000', '@mariaarts')
    ON CONFLICT (id) DO NOTHING
  `, [uid]);
  await pool.query(`
    INSERT INTO customers (id, user_id, name, email, phone, address, address_street, address_number, address_neighborhood, address_city, address_state, address_zipcode, instagram)
    VALUES (3, $1, 'Carlos Pereira', 'carlos@email.com', '(11) 99999-0003', 'Rua XV de Novembro, 789 - Centro - Curitiba/PR (CEP: 80020-000)', 'Rua XV de Novembro', '789', 'Centro', 'Curitiba', 'PR', '80020-000', '@carlinhos3d')
    ON CONFLICT (id) DO NOTHING
  `, [uid]);

  await pool.query(`
    INSERT INTO orders (id, user_id, customer_id, status, total) VALUES (1, $1, 1, 'delivered', 49.90) ON CONFLICT (id) DO NOTHING
  `, [uid]);
  await pool.query(`
    INSERT INTO orders (id, user_id, customer_id, status, total) VALUES (2, $1, 2, 'printing', 79.70) ON CONFLICT (id) DO NOTHING
  `, [uid]);
  await pool.query(`
    INSERT INTO orders (id, user_id, customer_id, status, total) VALUES (3, $1, 1, 'pending', 29.90) ON CONFLICT (id) DO NOTHING
  `, [uid]);

  await pool.query('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (1, 1, 1, 1, 49.90) ON CONFLICT (id) DO NOTHING');
  await pool.query('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (2, 2, 1, 1, 49.90) ON CONFLICT (id) DO NOTHING');
  await pool.query('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (3, 2, 2, 1, 29.80) ON CONFLICT (id) DO NOTHING');
  await pool.query('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (4, 3, 2, 1, 29.90) ON CONFLICT (id) DO NOTHING');

  console.log('Banco de dados PostgreSQL populado com dados iniciais.');
}

async function main() {
  if (process.env.DATABASE_URL) {
    const pg = await import('pg');
    const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
    await seedPg(pool);
    await pool.end();
    return;
  }

  const db = (await import('./database.js')).default;
  const hash = bcrypt.hashSync('admin123', 10);

  if (!db.prepare('SELECT id FROM users WHERE email = ?').get('profajurocha@gmail.com')) {
    db.exec(`INSERT INTO users (name, email, phone, password_hash, role) VALUES ('Juliana Rocha', 'profajurocha@gmail.com', '11999990001', '${hash}', 'admin')`);
  }
  if (!db.prepare('SELECT id FROM users WHERE email = ?').get('admin@atelie.com')) {
    db.exec(`INSERT INTO users (name, email, phone, password_hash, role) VALUES ('Administrador', 'admin@atelie.com', '11999990002', '${bcrypt.hashSync('admin', 10)}', 'admin')`);
  }
  if (!db.prepare('SELECT id FROM users WHERE email = ?').get('jordaosneto@hotmail.com')) {
    db.exec(`INSERT INTO users (name, email, password_hash, role) VALUES ('Jordão Neto', 'jordaosneto@hotmail.com', '${bcrypt.hashSync('180203', 10)}', 'admin')`);
  }

  const uid = db.prepare('SELECT id FROM users WHERE email = ?').get('profajurocha@gmail.com').id;

  db.exec(`
    INSERT OR IGNORE INTO products (id, user_id, name, description, price, cost, dimensions, weight, crucifixo, entremeio, contas, resina, tipo_banho, detalhes_memo, categoria, stock, status) VALUES
      (1, ${uid}, 'Terço de Nossa Senhora Aparecida', 'Terço artesanal com contas em tom azul e branco, medalha de Nossa Senhora Aparecida', 79.90, 25.00, '50cm', 35, 'Cruz de Nossa Senhora', 'Medalha Aparecida', 'Azul e Branco', 1, 'Dourado', 'Memo personalizado', 'Premium', 20, 'active'),
      (2, ${uid}, 'Terço de São Bento', 'Terço com medalha de São Bento e contas em marrom e dourado', 89.90, 30.00, '50cm', 38, 'Cruz de São Bento', 'Medalha São Bento', 'Marrom e Dourado', 1, 'Ouro Velho', '', 'Luxo', 25, 'active'),
      (3, ${uid}, 'Terço do Divino Pai Eterno', 'Terço nas cores vermelho e branco com medalha do Divino Pai Eterno', 74.90, 22.00, '50cm', 32, 'Cruz Divino Pai Eterno', 'Medalha Pai Eterno', 'Vermelho e Branco', 1, 'Níquel', '', 'Dia a Dia', 30, 'active'),
      (4, ${uid}, 'Imagem de Santo Expedito', 'Imagem ornamentada de Santo Expedito em resina - 15cm', 69.90, 20.00, '8x8x15cm', 120, '', '', '', 1, 'Dourado', '', 'Premium', 15, 'active'),
      (5, ${uid}, 'Imagem de São Jorge', 'Imagem de São Jorge com detalhes em dourado - 20cm', 99.90, 35.00, '10x8x20cm', 180, '', '', '', 1, 'Ouro Velho', '', 'Luxo', 12, 'active'),
      (6, ${uid}, 'Terço de Santa Rita', 'Terço delicado em tom rosa com medalha de Santa Rita dos Impossíveis', 84.90, 28.00, '50cm', 36, 'Cruz Santa Rita', 'Medalha Santa Rita', 'Rosa e Branco', 1, 'Dourado', '', 'Noiva', 18, 'active');

    INSERT OR IGNORE INTO product_variants (id, product_id, name, color, material, price_modifier, stock) VALUES
      (1, 1, 'Azul Claro', 'Azul', 'Resina', 0, 10),
      (2, 1, 'Azul Escuro', 'Azul Escuro', 'Resina', 5, 8),
      (3, 2, 'Marrom Escuro', 'Marrom', 'Resina', 0, 12),
      (4, 2, 'Marrom Claro', 'Marrom Claro', 'Resina', 0, 10),
      (5, 3, 'Vermelho', 'Vermelho', 'Resina', 0, 15),
      (6, 3, 'Branco', 'Branco', 'Resina', 0, 15);

    INSERT OR IGNORE INTO customers (id, user_id, name, email, phone, address, address_street, address_number, address_neighborhood, address_city, address_state, address_zipcode, instagram) VALUES
      (1, ${uid}, 'João Silva', 'joao@email.com', '(11) 99999-0001', 'Rua das Flores, 123 - Centro - São Paulo/SP (CEP: 01001-000)', 'Rua das Flores', '123', 'Centro', 'São Paulo', 'SP', '01001-000', '@joaosilva'),
      (2, ${uid}, 'Maria Santos', 'maria@email.com', '(11) 99999-0002', 'Av. Paulista, 456 - Bela Vista - São Paulo/SP (CEP: 01311-000)', 'Av. Paulista', '456', 'Bela Vista', 'São Paulo', 'SP', '01311-000', '@mariaarts'),
      (3, ${uid}, 'Carlos Pereira', 'carlos@email.com', '(11) 99999-0003', 'Rua XV de Novembro, 789 - Centro - Curitiba/PR (CEP: 80020-000)', 'Rua XV de Novembro', '789', 'Centro', 'Curitiba', 'PR', '80020-000', '@carlinhos3d');

    INSERT OR IGNORE INTO orders (id, user_id, customer_id, status, total) VALUES
      (1, ${uid}, 1, 'delivered', 49.90),
      (2, ${uid}, 2, 'printing', 79.70),
      (3, ${uid}, 1, 'pending', 29.90);

    INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
      (1, 1, 1, 1, 49.90),
      (2, 2, 1, 1, 49.90),
      (3, 2, 2, 1, 29.80),
      (4, 3, 2, 1, 29.90);
  `);

  console.log('Banco de dados SQLite populado com dados iniciais.');
}

export async function runSeed() {
  const dbUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL || Object.entries(process.env).find(([k]) => k.endsWith('_POSTGRES_URL'))?.[1] || '').replace(/sslmode=[^&]*&?/, '');
  if (dbUrl) {
    const saved = process.env.DATABASE_URL;
    process.env.DATABASE_URL = dbUrl;
    await main();
    if (!saved) delete process.env.DATABASE_URL;
    return;
  }
  await main();
}

main();
