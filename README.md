# 🐾 Pawfect Paradise — Pet Shop Project

Pawfect Paradise is an academic pet shop project built as a polished storefront with guest-friendly shopping, product browsing, booking services, and an admin dashboard.

## 1. Architecture

```
pawfect-paradise/
├── *.html                 → storefront pages (Home, Shop, Product, Cart, Services, etc.)
├── app.js                 → frontend logic, localStorage data layer, cart and header behavior
├── server.js              → Express server entry point
├── style.css              → visual design and responsive layout
├── routes/                → API route modules
│   ├── produtos.js
│   ├── categorias.js
│   ├── usuarios.js
│   ├── pets.js
│   ├── servicos.js
│   ├── agendamentos.js
│   ├── pedidos.js
│   └── avaliacoes.js
├── middleware/
│   └── auth.js            → session/auth checks and access rules
├── database/
│   ├── seed.js            → demo data and test users
│   └── pawfect.db         → SQLite database generated at runtime
├── package.json
├── README.md
└── .gitignore
```

### Stack
- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js + Express
- Data layer: SQLite via better-sqlite3
- Auth: express-session + bcryptjs
- Cart persistence: browser localStorage

> Customers do not need an account or login to browse products, add items to the cart, place an order, or submit service requests. Admin and staff authentication remains available for management views.

## 2. Installation

Requirements: [Node.js](https://nodejs.org) 18+

```bash
cd pawfect-paradise
npm install
```

## 3. Run the app

```bash
npm start
```

Open: http://localhost:3000

## 4. Demo accounts

All demo passwords are: 123456

| Email | Role | Permissions |
|---|---|---|
| admin@pawfect.com | admin | Full admin access |
| funcionario@pawfect.com | staff | Manage orders and bookings |
| cliente@pawfect.com | customer | Optional account access |

## 5. Features

- Product catalog with search, filters, sorting and pagination
- Product detail page with review cards
- Guest-friendly shopping flow with no login required
- Cart with add/remove/quantity updates
- Order placement and simple order history
- Service booking flow for pet care appointments
- Admin dashboard for products, categories and services
- Staff/admin order and booking management
- Responsive storefront and mobile navigation

## 6. API endpoints

Base path: /api

### Products
```bash
GET /api/produtos?busca=&categoria_id=&ordenar=&pagina=&porPagina=
GET /api/produtos/:id
POST /api/produtos          (admin)
PUT /api/produtos/:id       (admin)
DELETE /api/produtos/:id    (admin)
```

### Categories
```bash
GET /api/categorias
GET /api/categorias/:id
POST /api/categorias       (admin)
PUT /api/categorias/:id     (admin)
DELETE /api/categorias/:id  (admin)
```

### Users
```bash
POST /api/usuarios
POST /api/usuarios/login
POST /api/usuarios/logout
GET /api/usuarios/me
GET /api/usuarios          (admin)
PUT /api/usuarios/:id       (owner or admin)
DELETE /api/usuarios/:id    (admin)
```

### Pets
```bash
GET /api/pets
GET /api/pets/:id
POST /api/pets
PUT /api/pets/:id
DELETE /api/pets/:id
```

### Services
```bash
GET /api/servicos
GET /api/servicos/:id
POST /api/servicos         (admin)
PUT /api/servicos/:id      (admin)
DELETE /api/servicos/:id   (admin)
```

### Bookings
```bash
GET /api/agendamentos
GET /api/agendamentos/:id
POST /api/agendamentos
PUT /api/agendamentos/:id
DELETE /api/agendamentos/:id
```

### Orders
```bash
GET /api/pedidos
GET /api/pedidos/:id
POST /api/pedidos
PUT /api/pedidos/:id       (admin/staff)
```

### Reviews
```bash
GET /api/avaliacoes?produto_id=
POST /api/avaliacoes
```

## 7. Academic note

This project is designed as a classroom-ready storefront prototype. Some flows are intentionally simulated in the browser via localStorage and demo data rather than using a real payment provider or email service.

## 8. Quick testing

1. Run `npm install`
2. Run `npm start`
3. Open http://localhost:3000
4. Browse the Home and Shop pages without signing in
5. Add products to the cart and place an order
6. Open the Admin page with admin credentials to manage catalog and staff actions
