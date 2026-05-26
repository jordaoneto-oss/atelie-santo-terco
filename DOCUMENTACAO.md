# Documentação do Projeto — Ateliê Santo Terço

## 1. Visão Geral

Sistema full-stack SaaS para gestão de vendas do **Ateliê Santo Terço**, especializado em terços católicos e imagens de santos. Permite cadastro de clientes, produtos, pedidos, relatórios, e gerenciamento de usuários.

- **Frontend:** React + Vite + Tailwind CSS → [santoterco.vercel.app](https://santoterco.vercel.app)
- **Backend:** Node.js + Express → [atelie-santo-terco-backend.onrender.com](https://atelie-santo-terco-backend.onrender.com)
- **Repositório:** [github.com/jordaoneto-oss/atelie-santo-terco](https://github.com/jordaoneto-oss/atelie-santo-terco)

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 18 |
| | Vite | 5 |
| | Tailwind CSS | 3 |
| | React Router DOM | 6 |
| Backend | Node.js | 20+ |
| | Express | 4 |
| | JSON Web Token | 9 |
| | bcryptjs | 2 |
| Banco | SQLite (dev) / PostgreSQL (supabase/produção) | |
| ORM | Nenhum (SQL raw) | |
| Deploy FE | Vercel | |
| Deploy BE | Render | |

---

## 3. Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  React SPA  │────▶│  Express API │────▶│ SQLite / Postgres│
│  :5173 (dev)│     │  :3001 (dev) │     │                  │
│ Vercel (prd)│     │ Render (prd) │     │                  │
└─────────────┘     └──────────────┘     └──────────────────┘
```

### Fluxo de autenticação
1. Usuário faz login → backend gera JWT
2. JWT armazenado no `localStorage` do navegador
3. Toda requisição autenticada envia `Authorization: Bearer <token>`
4. Middleware `auth.js` valida o token e anexa `req.user`

### Modo dual de banco
O arquivo `backend/src/database.js` detecta a variável `DATABASE_URL`:
- **Com `DATABASE_URL`:** usa `pg` (PostgreSQL) com `?` → `$1` e `datetime('now')` → `CURRENT_TIMESTAMP`
- **Sem `DATABASE_URL`:** usa `better-sqlite3` local

---

## 4. Estrutura de Diretórios

```
/
├── backend/
│   └── src/
│       ├── index.js          # Servidor Express, rotas, CORS
│       ├── database.js       # Conexão dual SQLite/PostgreSQL, schema DDL
│       ├── seed.js           # Seed de dados iniciais
│       ├── middleware/
│       │   ├── auth.js       # Middleware JWT
│       │   └── asyncHandler.js
│       └── routes/
│           ├── auth.js       # Login, registro, esqueci senha, resetar
│           ├── products.js   # CRUD produtos
│           ├── customers.js  # CRUD clientes
│           ├── orders.js     # CRUD pedidos + status
│           ├── reports.js    # Relatórios de vendas
│           └── users.js      # CRUD usuários (admin apenas)
├── frontend/
│   └── src/
│       ├── main.jsx          # Entry point React
│       ├── App.jsx           # Rotas protegidas/públicas
│       ├── api/index.js      # Cliente HTTP (fetch wrapper)
│       ├── index.css         # Tailwind + fonts
│       ├── components/
│       │   └── Layout.jsx    # Sidebar + header responsivo
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Products.jsx
│           ├── ProductForm.jsx
│           ├── Customers.jsx
│           ├── Orders.jsx
│           ├── OrderForm.jsx
│           ├── Reports.jsx
│           ├── Instagram.jsx
│           ├── Senha.jsx
│           ├── ResetarSenha.jsx
│           └── Users.jsx
│       public/
│           └── logo.jpg      # Foto do perfil Instagram
├── DOCUMENTACAO.md
└── MANUAL_USUARIO.md
```

---

## 5. Banco de Dados

### Diagrama de Entidades

```
users (1) ──→ (N) products
users (1) ──→ (N) customers
users (1) ──→ (N) orders
customers (1) ──→ (N) orders
orders (1) ──→ (N) order_items
products (1) ──→ (N) order_items
products (1) ──→ (N) product_variants
users (1) ──→ (N) reset_tokens
```

### Tabela: `users`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL/PK | |
| name | TEXT | Nome completo |
| email | TEXT UNIQUE | Email de login |
| password_hash | TEXT | bcrypt hash |
| role | TEXT | `admin` |
| created_at | TIMESTAMP | |

### Tabela: `products`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL/PK | |
| user_id | INTEGER FK | Criador |
| name | TEXT | Nome do produto |
| description | TEXT | Descrição |
| price | REAL | Preço de venda |
| cost | REAL | Custo |
| crucifixo | TEXT | Tipo de crucifixo |
| entremeio | TEXT | Tipo de entremeio |
| contas | TEXT | Tipo de contas |
| resina | INTEGER | Possui resina (0/1) |
| tipo_banho | TEXT | Tipo de banho |
| detalhes_memo | TEXT | Detalhes opcionais |
| categoria | TEXT | Categoria |
| image_url | TEXT | URL da imagem |
| stock | INTEGER | Estoque |
| status | TEXT | `active`, `inactive`, `archived` |
| dimensions | TEXT | Dimensões |
| weight | REAL | Peso |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Tabela: `product_variants`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL/PK | |
| product_id | INTEGER FK | Produto pai |
| name | TEXT | Nome da variação |
| color | TEXT | Cor |
| material | TEXT | Material |
| price_modifier | REAL | Ajuste de preço |
| stock | INTEGER | Estoque da variação |

### Tabela: `customers`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL/PK | |
| user_id | INTEGER FK | Criador |
| cpf | TEXT | CPF (opcional) |
| name | TEXT | Nome |
| email | TEXT | Email |
| phone | TEXT | Telefone |
| address | TEXT | Endereço completo (composição) |
| address_street | TEXT | Rua |
| address_number | TEXT | Número |
| address_neighborhood | TEXT | Bairro |
| address_city | TEXT | Cidade |
| address_state | TEXT | UF |
| address_zipcode | TEXT | CEP |
| instagram | TEXT | @ Instagram |
| notes | TEXT | Observações |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Tabela: `orders`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL/PK | |
| user_id | INTEGER FK | Criador |
| customer_id | INTEGER FK | Cliente |
| status | TEXT | `pending`, `confirmed`, `printing`, `shipped`, `delivered`, `cancelled` |
| total | REAL | Valor total |
| notes | TEXT | Observações |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Tabela: `order_items`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL/PK | |
| order_id | INTEGER FK | Pedido |
| product_id | INTEGER FK | Produto |
| variant_id | INTEGER | Variação |
| quantity | INTEGER | Quantidade |
| unit_price | REAL | Preço unitário |

### Tabela: `reset_tokens`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL/PK | |
| user_id | INTEGER FK | |
| token | TEXT UNIQUE | Token UUID |
| expires_at | TIMESTAMP | Data de expiração |
| used | INTEGER | 0/1 |
| created_at | TIMESTAMP | |

---

## 6. API — Endpoints

### Auth (`/api/auth`)

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| POST | `/login` | Não | Login (email + senha → JWT) |
| POST | `/register` | Não | Registrar novo usuário |
| GET | `/me` | Sim | Dados do usuário logado |
| POST | `/forgot-password` | Não | Gera token de reset, retorna `dev_link` |
| POST | `/reset-password/:token` | Não | Redefine senha com token |
| PUT | `/reset-password` | Sim | Alterar senha (autenticado) |

### Produtos (`/api/products`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar (filtro: `search`, `status`) |
| GET | `/:id` | Detalhes + variações |
| POST | `/` | Criar |
| PUT | `/:id` | Atualizar |
| DELETE | `/:id` | Remover |

### Clientes (`/api/customers`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar (filtro: `search`) |
| GET | `/:id` | Detalhes + pedidos |
| POST | `/` | Criar |
| PUT | `/:id` | Atualizar |
| DELETE | `/:id` | Remover |

### Pedidos (`/api/orders`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar (filtros: `search`, `status`, `customer_id`, `start_date`, `end_date`) |
| GET | `/:id` | Detalhes + itens |
| POST | `/` | Criar |
| PUT | `/:id` | Atualizar |
| DELETE | `/:id` | Remover |

### Relatórios (`/api/reports`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/sales` | Relatório de vendas (filtros: `start_date`, `end_date`, `category`, `customer_id`) |

### Usuários (`/api/users`) — só admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar |
| POST | `/` | Criar |
| PUT | `/:id` | Atualizar |
| DELETE | `/:id` | Remover |

---

## 7. Frontend — Rotas e Páginas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Dashboard | Painel com métricas resumidas |
| `/login` | Login | Autenticação |
| `/reset-password/:token` | ResetarSenha | Redefinição de senha (público) |
| `/produtos` | Products | Lista de produtos |
| `/produtos/novo` | ProductForm | Cadastrar produto |
| `/produtos/:id/editar` | ProductForm | Editar produto |
| `/clientes` | Customers | Lista de clientes |
| `/pedidos` | Orders | Lista de pedidos |
| `/pedidos/novo` | OrderForm | Novo pedido |
| `/pedidos/:id/editar` | OrderForm | Editar pedido |
| `/relatorios` | Reports | Relatórios de vendas |
| `/instagram` | Instagram | Perfil Instagram @atelie_santotercoo |
| `/senha` | Senha | Alterar senha (autenticado) |
| `/admin/usuarios` | Users | Gerenciar usuários (admin) |

### Layout

O componente `Layout.jsx` fornece:
- **Desktop:** Sidebar fixa à esquerda com links, header com nome do usuário
- **Mobile:** Header fixo com logo + hamburger toggle
- Off-white (`#f5f0e8`) como fundo geral
- Títulos em Playfair Display, corpo em Inter

### Tema (Tailwind)

Cores personalizadas em `tailwind.config.js`:
- `gold`: { 50 → 700 } → #fdf8e8 ... #8a6d2b
- `brown`: { 50 → 800 } → #f5f0e8 ... #4a3320
- `rose`: { 50 → 800 } → #fdf2f4 ... #7a2e3a
- `offwhite`: #f5f0e8

### Responsividade

Todas as listas usam:
- `hidden md:block` — tabela em desktop
- `md:hidden` — cards em mobile

---

## 8. Autenticação e Usuários

### Usuários padrão (seed)

| Email | Senha | Nome | Role |
|-------|-------|------|------|
| `profajurocha@gmail.com` | `admin123` | Juliana Rocha | admin |
| `admin@atelie.com` | `admin` | Administrador | admin |
| `jordaosneto@hotmail.com` | `180203` | Jordão Neto | admin |

### Fluxo de "Esqueci Senha"

1. Usuário informa email em `/login`
2. Backend gera token UUID, armazena em `reset_tokens` com expiração de 1 hora
3. Retorna `dev_link` no JSON (simula envio de email)
4. Usuário acessa o link com token
5. Formulário `ResetarSenha.jsx` coleta nova senha e confirmação
6. Token é marcado como usado

---

## 9. Integrações

### ViaCEP (cadastro de clientes)
- Campo CEP consulta `https://viacep.com.br/ws/{cep}/json/`
- Preenche automaticamente: Rua, Bairro, Cidade, UF

### ReceitaWS (cadastro de clientes)
- Campo CPF consulta `https://www.receitaws.com.br/v1/cpf/{cpf}`
- Preenche automaticamente: Nome
- Limitação: email e telefone não são retornados por APIs públicas governamentais

### Instagram
- Página `/instagram` exibe perfil @atelie_santotercoo
- Embed do feed do Instagram via iframe (instagram.com/p/{id}/embed)
- Lista de clientes vinculados ao Instagram

---

## 10. Deploy

### Frontend (Vercel)

- Projeto: `santoterco`
- URL: `https://santoterco.vercel.app`
- Build: `vite build`
- Variável de ambiente: `VITE_API_URL=https://atelie-santo-terco-backend.onrender.com`

### Backend (Render)

- Serviço: `atelie-santo-terco-backend`
- URL: `https://atelie-santo-terco-backend.onrender.com`
- Root: `backend`
- Build: `npm install`
- Start: `node src/index.js`
- Banco: SQLite (data/3dprint.db) — sem `DATABASE_URL` configurada

### Git

```bash
git remote add origin https://github.com/jordaoneto-oss/atelie-santo-terco.git
git push -u origin main
```

---

## 11. Variáveis de Ambiente

### Backend

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Não | Porta (padrão 3001) |
| `DATABASE_URL` | Não | URL PostgreSQL (ausente → SQLite) |
| `JWT_SECRET` | Não | Segredo JWT (fallback interno) |

### Frontend

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | Sim | URL do backend |

---

## 12. Desenvolvimento Local

```bash
# Backend
cd backend
npm install
npm run seed    # Popula dados iniciais
npm start       # http://localhost:3001

# Frontend
cd frontend
npm install
npm run dev     # http://localhost:5173
```

---

## 13. Regras de Negócio

1. **Registros unificados:** Produtos, clientes e pedidos são compartilhados entre todos os usuários. Cada registro mostra `created_by_name` para identificar quem criou.
2. **Status de pedidos:** Pendente → Confirmado → Impressão → Enviado → Entregue. Qualquer status pode ir para Cancelado.
3. **Status de produtos:** Ativo (visível), Inativo, Arquivado.
4. **Relatórios:** Filtros por cliente, categoria, data início/fim. Três visões: por produto, por cliente, por categoria.
5. **Redefinição de senha:** Sem serviço de email — o link de reset é exibido no console do backend e retornado como `dev_link` na resposta da API.

---

## 14. Manutenção

### Migração de schema
Alterações no banco são feitas via:
1. Adicionar coluna no `CREATE TABLE IF NOT EXISTS` no `database.js`
2. Adicionar `ALTER TABLE` com `try/catch` para bancos existentes
3. Atualizar queries INSERT/UPDATE nas rotas

### Seed
```bash
cd backend
npm run seed
```
Reexecutar é seguro — usa `INSERT OR IGNORE` (SQLite) ou `ON CONFLICT DO NOTHING` (PostgreSQL).
