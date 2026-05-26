# Manual do Usuário — Ateliê Santo Terço

Sistema de gestão para o **Ateliê Santo Terço**. Permite控制ar clientes, produtos, pedidos e gerar relatórios de vendas.

**Acesso:** [santoterco.vercel.app](https://santoterco.vercel.app)

---

## 1. Login

1. Abra o sistema no navegador
2. Informe seu **email** e **senha**
3. Clique em **"Entrar"**

### Primeiro acesso

| Email | Senha |
|-------|-------|
| `profajurocha@gmail.com` | `admin123` |
| `admin@atelie.com` | `admin` |
| `jordaosneto@hotmail.com` | `180203` |

### Esqueci minha senha

1. Na tela de login, clique em **"Esqueceu sua senha?"**
2. Digite seu email e clique em **"Enviar link"**
3. Um link de redefinição aparecerá na tela (como o sistema não envia email, o link é exibido ali mesmo)
4. Clique no link e defina uma nova senha

---

## 2. Painel (Dashboard)

Ao entrar, você vê o painel com:
- **Total de Pedidos** — quantidade de pedidos registrados
- **Faturamento Total** — soma de todos os pedidos
- **Clientes Ativos** — total de clientes cadastrados
- **Produtos Ativos** — total de produtos disponíveis
- Botões de acesso rápido para criar cliente, produto ou pedido

---

## 3. Produtos

### Cadastrar Produto

1. No menu lateral, clique em **"Produtos"**
2. Clique no botão **"+ Novo Produto"**
3. Preencha:
   - **Nome** (obrigatório)
   - **Preço de venda** (obrigatório)
   - **Custo**
   - **Categoria**
   - **Crucifixo, Entremeio, Contas** — tipos utilizados
   - **Resina** — marque se o produto possui banho de resina
   - **Tipo de Banho** — especificação do banho
   - **Detalhes** — informações complementares
   - **Estoque** — quantidade disponível
   - **Status** — Ativo, Inativo ou Arquivado
4. Clique em **"Criar"**

### Editar / Remover

- Na lista de produtos, use os botões **"Editar"** ou **"Remover"** ao lado de cada produto

### Buscar Produtos

- Use o campo de busca para filtrar por nome
- Use o filtro de **Status** para ver Ativos, Inativos ou Arquivados

### Status dos Produtos

| Status | Significado |
|--------|-------------|
| Ativo | Produto disponível para venda |
| Inativo | Produto temporariamente indisponível |
| Arquivado | Produto descontinuado |

---

## 4. Clientes

### Cadastrar Cliente

1. No menu lateral, clique em **"Clientes"**
2. Clique em **"+ Novo Cliente"**
3. O primeiro campo é **CPF** — digite apenas números. Ao completar 11 dígitos, o sistema consulta a base da Receita Federal e preenche o nome automaticamente
4. Preencha os demais campos:
   - **Nome** (obrigatório)
   - **Email**
   - **Telefone**
   - **Instagram** (@ do cliente)
5. Na seção **Endereço**, comece pelo **CEP** — digite 8 números e o sistema preenche automaticamente a rua, bairro, cidade e UF via ViaCEP
6. Complete com **Número** e demais informações se necessário
7. Adicione **Observações** se desejar
8. Clique em **"Criar"**

### Editar / Remover

- Na lista, use os botões **"Editar"** ou **"Remover"**

### Buscar Clientes

- Digite o termo desejado e clique em **"Buscar"**
- Para limpar a busca e ver todos, clique em **"Limpar"**
- A busca encontra por: nome, email, telefone ou CPF

### Visualização

- **Desktop:** tabela com nome, email, telefone, cidade/UF, Instagram
- **Celular:** cards com as mesmas informações

---

## 5. Pedidos

### Criar Pedido

1. No menu lateral, clique em **"Pedidos"**
2. Clique em **"+ Novo Pedido"**
3. Selecione o **Cliente** (é obrigatório ter clientes cadastrados)
4. Adicione **Itens**:
   - Selecione um **Produto**
   - Informe a **Quantidade**
   - O valor unitário é preenchido automaticamente
5. O **Total** é calculado automaticamente
6. Adicione **Observações** se necessário
7. Clique em **"Criar Pedido"**

### Status dos Pedidos

O pedido segue este fluxo:

```
Pendente → Confirmado → Impressão → Enviado → Entregue
```

Qualquer status pode ir para **Cancelado**.

Para alterar o status, clique no botão de status na lista e selecione o novo status.

### Editar / Remover

- Use **"Editar"** para alterar cliente, itens ou observações
- Use **"Remover"** para excluir (apenas pedidos sem movimentação)

### Filtros

- **Status** — filtre por situação do pedido
- **Cliente** — filtre por cliente específico
- **Busca** — pesquisa geral

---

## 6. Relatórios

### Acessar

1. No menu lateral, clique em **"Relatórios"**

### Filtrar

- **Cliente** — selecione um cliente específico
- **Categoria** — filtre por categoria de produto
- **Data Início / Data Fim** — período desejado

Após selecionar os filtros, clique em **"Gerar Relatório"**.

### Visões

| Aba | O que mostra |
|-----|-------------|
| **Por Produto** | Ranking dos produtos mais vendidos (gráfico + tabela) |
| **Por Cliente** | Ranking dos clientes que mais compraram |
| **Por Categoria** | Desempenho por categoria |

### Cards de Resumo

No topo do relatório:
- **Pedidos** — total de pedidos no período
- **Itens Vendidos** — quantidade total de itens
- **Receita Total** — valor total em R$

---

## 7. Usuários (Apenas Administradores)

1. No menu lateral, clique em **"Usuários"**
2. É possível:
   - **Criar** novo usuário (nome, email, senha)
   - **Editar** dados de um usuário existente
   - **Remover** usuário

---

## 8. Instagram

Página dedicada ao perfil **@atelie_santotercoo**:
- Card com foto, nome e bio
- Feed de publicações incorporado
- Lista de clientes que têm Instagram preenchido (links diretos)

---

## 9. Alterar Senha

1. No menu lateral, clique em **"Senha"** (ícone de cadeado)
2. Informe:
   - **Senha atual**
   - **Nova senha**
   - **Confirmar nova senha**
3. Clique em **"Alterar Senha"**

---

## 10. Dicas Rápidas

- **CPF:** Digite apenas 11 números. O nome é preenchido automaticamente.
- **CEP:** Digite 8 números. Rua, bairro, cidade e UF são preenchidos automaticamente.
- **Busca de clientes:** Clique em "Buscar" após digitar — não busca sozinho.
- **Relatórios:** Clique em "Gerar Relatório" para aplicar os filtros.
- **Responsivo:** O sistema funciona em celulares — tabelas viram cards em telas pequenas.
- **Registros compartilhados:** Todos os usuários veem os mesmos clientes, produtos e pedidos. O sistema mostra quem criou cada registro.
- **Sair:** Use o botão de logout no menu lateral (desktop) ou no cabeçalho (celular).

---

## 11. Suporte

Em caso de dúvidas ou problemas, entre em contato com o desenvolvedor pelo repositório:

[github.com/jordaoneto-oss/atelie-santo-terco](https://github.com/jordaoneto-oss/atelie-santo-terco)
