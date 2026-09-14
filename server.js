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
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API REST
app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/servicos', require('./routes/servicos'));
app.use('/api/agendamentos', require('./routes/agendamentos'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/avaliacoes', require('./routes/avaliacoes'));

// Tratamento de erros genérico da API
app.use('/api', (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// Qualquer rota não encontrada dentro de /api retorna JSON (não HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota da API não encontrada.' });
});

app.listen(PORT, () => {
  console.log(`Pawfect Paradise rodando em http://localhost:${PORT}`);
});
