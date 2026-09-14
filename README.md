# 🐾 Pawfect Paradise — Sistema de Pet Shop

Projeto acadêmico completo de um sistema de pet shop, com frontend, backend,
banco de dados, API REST, CRUD e funcionalidades de usuário (cliente,
funcionário e administrador).

## 1. Arquitetura

```
pawfect-paradise/
│
├── public/                 → Frontend (HTML, CSS, JS puro)
│   ├── *.html               (16 páginas do sistema)
│   ├── css/style.css        (identidade visual rosa pastel)
│   └── js/app.js            (chamadas à API, carrinho, cabeçalho)
│
├── routes/                 → Rotas da API REST (uma por recurso)
│   ├── produtos.js
│   ├── categorias.js
│   ├── usuarios.js
│   ├── pets.js
│   ├── servicos.js
│   ├── agendamentos.js
│   ├── pedidos.js
│   └── avaliacoes.js
│
├── middleware/
│   └── auth.js              (controle de sessão e permissões)
│
├── database/
│   ├── database.js          (conexão + criação das tabelas)
│   ├── seed.js               (dados de exemplo e usuários de teste)
│   └── pawfect.db            (criado automaticamente na primeira execução)
│
├── server.js                (ponto de entrada da aplicação)
├── package.json
└── README.md
```

**Stack utilizada:**
- Frontend: HTML5, CSS3, JavaScript puro (sem frameworks)
- Backend: Node.js + Express
- Banco de dados: SQLite (via `better-sqlite3`)
- Autenticação: sessão de servidor (`express-session`) + senhas com hash (`bcryptjs`)
- Carrinho de compras: guardado no `localStorage` do navegador até a finalização do pedido

## 2. Como instalar

Pré-requisitos: [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

```bash
cd pawfect-paradise
npm install
```

## 3. Como criar o banco de dados

O banco SQLite é criado automaticamente (arquivo `database/pawfect.db`) na
primeira vez que o servidor roda ou que o comando de seed é executado.

Para popular o banco com categorias, produtos, serviços e usuários de teste:

```bash
npm run seed
```

> Rodar o seed mais de uma vez não duplica os dados — ele verifica se o banco
> já tem informação antes de inserir.

Para recomeçar do zero, apague o arquivo `database/pawfect.db` e rode `npm run seed` novamente.

## 4. Como executar

```bash
npm start
```

O servidor sobe em: **http://localhost:3000**

## 5. Usuários de teste

Todos com senha: **123456**

| E-mail                     | Tipo         | Permissões |
|-----------------------------|--------------|------------|
| admin@pawfect.com           | admin        | Acesso total à área administrativa |
| funcionario@pawfect.com     | funcionario  | Vê pedidos e agendamentos, atualiza status |
| cliente@pawfect.com         | cliente      | Compra produtos, cadastra pets, agenda serviços |

## 6. Rotas da API REST

Base: `/api`

**Produtos**
```
GET    /api/produtos?busca=&categoria_id=&ordenar=&pagina=&porPagina=
GET    /api/produtos/:id
POST   /api/produtos          (admin)
PUT    /api/produtos/:id      (admin)
DELETE /api/produtos/:id      (admin)
```

**Categorias**
```
GET    /api/categorias
GET    /api/categorias/:id
POST   /api/categorias        (admin)
PUT    /api/categorias/:id    (admin)
DELETE /api/categorias/:id    (admin)
```

**Usuários**
```
POST   /api/usuarios          (cadastro de cliente)
POST   /api/usuarios/login
POST   /api/usuarios/logout
GET    /api/usuarios/me       (usuário logado)
GET    /api/usuarios          (admin — lista todos)
PUT    /api/usuarios/:id      (dono da conta ou admin)
DELETE /api/usuarios/:id      (admin)
```

**Pets**
```
GET    /api/pets              (logado — próprios pets; ?todos=1 para staff)
GET    /api/pets/:id
POST   /api/pets
PUT    /api/pets/:id
DELETE /api/pets/:id
```

**Serviços**
```
GET    /api/servicos
GET    /api/servicos/:id
POST   /api/servicos          (admin)
PUT    /api/servicos/:id      (admin)
DELETE /api/servicos/:id      (admin)
```

**Agendamentos**
```
GET    /api/agendamentos      (logado — próprios; staff vê todos)
GET    /api/agendamentos/:id
POST   /api/agendamentos
PUT    /api/agendamentos/:id  (cliente cancela; staff muda status)
DELETE /api/agendamentos/:id
```

**Pedidos**
```
GET    /api/pedidos           (logado — próprios; staff vê todos)
GET    /api/pedidos/:id
POST   /api/pedidos           (finaliza a compra do carrinho)
PUT    /api/pedidos/:id       (admin/funcionario — muda status)
```

**Avaliações**
```
GET    /api/avaliacoes?produto_id=
POST   /api/avaliacoes        (logado)
```

## 7. Funcionalidades implementadas

- [x] Catálogo de produtos com busca, filtro por categoria, ordenação e paginação
- [x] Página de detalhes do produto com avaliações
- [x] Carrinho de compras funcional (adicionar, remover, alterar quantidade)
- [x] Finalização de pedido com baixa automática de estoque (transação no banco)
- [x] Cadastro e login de usuários com senha criptografada (bcrypt)
- [x] 3 níveis de acesso: cliente, funcionário e administrador
- [x] Cadastro, edição e exclusão de pets (CRUD completo)
- [x] Agendamento de serviços (banho, tosa, consulta, vacinação)
- [x] Histórico de pedidos e agendamentos do cliente
- [x] Área administrativa com CRUD de produtos, categorias e serviços
- [x] Gerenciamento de usuários e permissões (admin)
- [x] Atualização de status de pedidos e agendamentos (admin/funcionário)
- [x] Sistema de avaliações de produtos
- [x] Mensagens de sucesso/erro e confirmação antes de excluir (heurísticas de Nielsen)
- [x] Layout responsivo (computador, tablet e celular) com menu mobile
- [x] SEO básico: title, meta description, headings, alt em imagens
- [x] Proteção de rotas administrativas (backend valida o tipo do usuário, não apenas o frontend)
- [x] Queries parametrizadas em todo o banco (proteção contra SQL Injection)

**Fora do escopo (não implementado, para não simular funcionalidade falsa):**
- Envio real de e-mails (newsletter e formulário de contato apenas simulam sucesso)
- Pagamento real (o pedido é criado com status "Pendente", sem gateway de pagamento)
- Upload de arquivos de imagem (imagens são inseridas por URL)

## 8. Checklist de testes

- [ ] Home carrega categorias, produtos em destaque e avaliações
- [ ] Menu de navegação funciona em desktop e mobile (☰)
- [ ] Busca de produtos retorna resultados corretos
- [ ] Filtro por categoria e ordenação funcionam na página Shop
- [ ] Página de produto mostra detalhes e permite avaliar (logado)
- [ ] Adicionar/remover/alterar quantidade no carrinho atualiza o total
- [ ] Cadastro de novo cliente funciona e loga automaticamente
- [ ] Login com usuários de teste (admin, funcionário, cliente) funciona
- [ ] Cliente não consegue acessar `/admin.html` sem estar logado
- [ ] Funcionário não vê abas de Produtos/Categorias/Usuários no admin
- [ ] Cadastro, edição e exclusão de pet funcionam
- [ ] Agendamento de serviço aparece em "Meus Agendamentos"
- [ ] Cliente consegue cancelar um agendamento próprio
- [ ] Finalizar pedido reduz o estoque do produto e aparece em "Meus Pedidos"
- [ ] Admin consegue criar, editar e excluir produtos, categorias e serviços
- [ ] Admin consegue mudar status de pedidos e agendamentos
- [ ] Admin consegue mudar o tipo (permissão) de um usuário
- [ ] Mensagens de sucesso/erro aparecem nos formulários
- [ ] Confirmação é solicitada antes de excluir qualquer item
- [ ] Layout não quebra em telas pequenas (redimensione o navegador)

## 9. Como testar rapidamente

1. Rode `npm install`, depois `npm run seed`, depois `npm start`.
2. Acesse `http://localhost:3000`.
3. Navegue pela Home, Shop e abra um produto.
4. Faça login com `cliente@pawfect.com` / `123456`.
5. Cadastre um pet em "Meus Pets" e agende um serviço.
6. Adicione produtos ao carrinho e finalize um pedido.
7. Saia e entre com `admin@pawfect.com` / `123456`.
8. Acesse "Admin" no menu e teste o CRUD de produtos/categorias/serviços,
   além da atualização de status de pedidos e agendamentos.
