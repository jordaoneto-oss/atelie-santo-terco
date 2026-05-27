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
| Banco | SQLite (better-sqlite3) | |
| ORM | Nenhum (SQL raw) | |
| Deploy FE | Vercel (static SPA) | |
| Deploy BE | Render (web service + disco persistente) | |

---

## 3. Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  React SPA  │────▶│  Express API │────▶│  SQLite (disco)  │
│  :5173 (dev)│     │  :3001 (dev) │     │   /data/         │
│ Vercel (prd)│     │ Render (prd) │     │   3dprint.db     │
└─────────────┘     └──────────────┘     └──────────────────┘
```

### Fluxo de autenticação
1. Usuário faz login → backend gera JWT
2. JWT armazenado no `localStorage` do navegador
3. Toda requisição autenticada envia `Authorization: Bearer <token>`
4. Middleware `auth.js` valida o token e anexa `req.user`

### Banco de dados
Apenas SQLite via `better-sqlite3`. O arquivo fica em `/data/3dprint.db` no Render (disco persistente) ou `backend/data/3dprint.db` em ambiente local. Não há suporte a PostgreSQL.

---

## 4. Estrutura de Diretórios

```
/
├── backend/
│   └── src/
│       ├── index.js          # Servidor Express
│       ├── app.js            # Configuração Express (helmet, CORS, rate-limit, rotas, backup, seed)
│       ├── database.js       # Conexão SQLite puro, schema DDL
│       ├── backup.js         # Backup automático + manual do SQLite
│       ├── seed.js           # Seed de dados iniciais
│       ├── middleware/
│       │   ├── auth.js       # Middleware JWT
│       │   └── asyncHandler.js
│       └── routes/
│           ├── auth.js       # Login, registro, me, alterar senha
│           ├── products.js   # CRUD produtos + variantes
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
│           └── Users.jsx
├── vercel.json               # Configuração Vercel (SPA fallback)
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
```

### Tabela: `users`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK | autoincrement |
| name | TEXT | Nome completo |
| email | TEXT UNIQUE | Email de login |
| password_hash | TEXT | bcrypt hash |
| role | TEXT | `admin` |
| created_at | TEXT | ISO datetime |

### Tabela: `products`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK | |
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
| created_at | TEXT | |
| updated_at | TEXT | |

### Tabela: `product_variants`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK | |
| product_id | INTEGER FK | Produto pai |
| name | TEXT | Nome da variação |
| color | TEXT | Cor |
| material | TEXT | Material |
| price_modifier | REAL | Ajuste de preço |
| stock | INTEGER | Estoque da variação |

### Tabela: `customers`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK | |
| user_id | INTEGER FK | Criador |
| cpf | TEXT | CPF (opcional, sem validação) |
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
| created_at | TEXT | |
| updated_at | TEXT | |

### Tabela: `orders`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK | |
| user_id | INTEGER FK | Criador |
| customer_id | INTEGER FK | Cliente |
| status | TEXT | `pending`, `confirmed`, `printing`, `shipped`, `delivered`, `cancelled` |
| total | REAL | Valor total |
| notes | TEXT | Observações |
| created_at | TEXT | |
| updated_at | TEXT | |

### Tabela: `order_items`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK | |
| order_id | INTEGER FK | Pedido |
| product_id | INTEGER FK | Produto |
| variant_id | INTEGER | Variação |
| quantity | INTEGER | Quantidade |
| unit_price | REAL | Preço unitário |

---

## 6. API — Endpoints

### Auth (`/api/auth`)

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| POST | `/login` | Não | Login (email + senha → JWT). Rate-limit: 10 tentativas / 15 min |
| POST | `/register` | Não | Registrar novo usuário |
| GET | `/me` | Sim | Dados do usuário logado |
| PUT | `/reset-password` | Sim | Alterar senha (autenticado, requer senha atual) |

### Produtos (`/api/products`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar (filtro: `search`, `status`) |
| GET | `/:id` | Detalhes + variações |
| POST | `/` | Criar |
| PUT | `/:id` | Atualizar |
| DELETE | `/:id` | Remover |
| POST | `/:id/variants` | Adicionar variação |
| DELETE | `/variants/:id` | Remover variação |

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
| PUT | `/:id/status` | Atualizar status |
| GET | `/stats/summary` | Resumo para dashboard |

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

### Utilitários

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/seed` | Executar seed de dados iniciais |
| POST | `/api/backup` | Criar backup manual do SQLite |
| GET | `/api/backup` | Listar backups disponíveis |

---

## 7. Frontend — Rotas e Páginas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Dashboard | Painel com métricas resumidas |
| `/login` | Login | Autenticação |
| `/produtos` | Products | Lista de produtos |
| `/produtos/novo` | ProductForm | Cadastrar produto |
| `/produtos/:id` | ProductForm | Editar produto |
| `/clientes` | Customers | Lista de clientes |
| `/pedidos` | Orders | Lista de pedidos |
| `/pedidos/novo` | OrderForm | Novo pedido |
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

### Fluxo de alteração de senha

1. Usuário clica em "Senha" no menu lateral
2. Informa senha atual, nova senha e confirmação
3. Backend valida senha atual e atualiza o hash

Não há funcionalidade de "esqueci minha senha" — o recurso foi removido.

---

## 9. Segurança

- **helmet:** headers de segurança HTTP (X-Frame-Options, X-Content-Type-Options, etc.)
- **rate-limit global:** 200 requisições / 15 min por IP
- **rate-limit login:** 10 tentativas / 15 min por IP
- **CORS:** restrito ao origin do frontend (`https://santoterco.vercel.app` ou variável `CORS_ORIGIN`)
- **JWT:** tokens gerados com `JWT_SECRET` (configurado como env var no Render)
- **Validação de email:** regex de formato nos endpoints de login e registro

---

## 10. Backup do Banco de Dados

O sistema faz backup automático do SQLite:

- **Ao iniciar:** um backup é criado sempre que o servidor sobe
- **Agendado:** a cada 6 horas
- **Manual:** via `POST /api/backup`
- **Listagem:** via `GET /api/backup`
- **Retação:** mantém os últimos 7 backups, remove os mais antigos
- **Local:** `/data/backups/` no Render, `backend/data/backups/` localmente

---

## 11. Integrações

### ViaCEP (cadastro de clientes)
- Campo CEP consulta `https://viacep.com.br/ws/{cep}/json/`
- Preenche automaticamente: Rua, Bairro, Cidade, UF

### CPF
- Campo de texto livre, sem validação ou consulta a API externa

### Instagram
- Página `/instagram` exibe perfil @atelie_santotercoo
- Embed do feed do Instagram via iframe (instagram.com/p/{id}/embed)
- Lista de clientes vinculados ao Instagram

---

## 12. Deploy

### Frontend (Vercel)

- Projeto: `santoterco`
- URL: `https://santoterco.vercel.app`
- Build: `cd frontend && npm install && npm run build`
- Output: `frontend/dist`
- SPA fallback: todas as rotas → `index.html`
- Variável de ambiente: `VITE_API_URL=https://atelie-santo-terco-backend.onrender.com`

### Backend (Render)

- Serviço: `atelie-santo-terco-backend`
- URL: `https://atelie-santo-terco-backend.onrender.com`
- Root: `backend`
- Build: `npm install`
- Start: `node src/index.js`
- Disco persistente: `/data` montado no Render (contém `3dprint.db` e `backups/`)
- Auto-deploy: habilitado a partir do branch `main` do GitHub

### Git

```bash
git remote add origin https://github.com/jordaoneto-oss/atelie-santo-terco.git
git push -u origin main
```

---

## 13. Variáveis de Ambiente

### Backend (configuradas no Render)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Não | Porta (padrão 3001) |
| `JWT_SECRET` | Não | Segredo JWT (fallback interno) |
| `CORS_ORIGIN` | Não | Origin permitida (padrão `https://santoterco.vercel.app`) |
| `APP_URL` | Não | URL base do backend (usada internamente) |

### Frontend (configurada no Vercel)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | Sim | URL do backend |

---

## 14. Desenvolvimento Local

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

## 15. Regras de Negócio

1. **Registros unificados:** Produtos, clientes e pedidos são compartilhados entre todos os usuários. Cada registro mostra `created_by_name` para identificar quem criou.
2. **Status de pedidos:** Pendente → Confirmado → Impressão → Enviado → Entregue. Qualquer status pode ir para Cancelado.
3. **Status de produtos:** Ativo (visível), Inativo, Arquivado.
4. **Relatórios:** Filtros por cliente, categoria, data início/fim. Três visões: por produto, por cliente, por categoria.

---

## 16. Manutenção

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
Reexecutar é seguro — usa `INSERT OR IGNORE` (SQLite).

### Backup manual
```bash
curl -X POST https://atelie-santo-terco-backend.onrender.com/api/backup
curl https://atelie-santo-terco-backend.onrender.com/api/backup
```
