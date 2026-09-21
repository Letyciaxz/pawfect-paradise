// server.js
// Ponto de entrada da aplicação Pawfect Paradise.

const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'pawfect-paradise-segredo-de-desenvolvimento', // em produção, use variável de ambiente
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 horas
  })
);

// Arquivos estáticos do frontend (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname)));

// Este projeto usa um frontend estático com dados em localStorage.
// A API REST externa não é necessária para a experiência de loja e compra sem login.
app.get('/health', (req, res) => {
  res.json({ ok: true, mode: 'static-storefront' });
});

app.listen(PORT, () => {
  console.log(`Pawfect Paradise rodando em http://localhost:${PORT}`);
});
