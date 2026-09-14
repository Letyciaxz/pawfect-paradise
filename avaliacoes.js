// routes/avaliacoes.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { exigirLogin } = require('../middleware/auth');

// GET /api/avaliacoes?produto_id=1
router.get('/', (req, res) => {
  const { produto_id } = req.query;
  let sql = `SELECT avaliacoes.*, usuarios.nome AS usuario_nome
             FROM avaliacoes JOIN usuarios ON usuarios.id = avaliacoes.usuario_id`;
  const params = [];
  if (produto_id) {
    sql += ' WHERE produto_id = ?';
    params.push(produto_id);
  }
  sql += ' ORDER BY avaliacoes.id DESC';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/avaliacoes -> cliente logado avalia um produto
router.post('/', exigirLogin, (req, res) => {
  const { produto_id, nota, comentario } = req.body;
  if (!produto_id || !nota) return res.status(400).json({ erro: 'Produto e nota são obrigatórios.' });
  if (nota < 1 || nota > 5) return res.status(400).json({ erro: 'A nota deve ser entre 1 e 5.' });

  const produto = db.prepare('SELECT id FROM produtos WHERE id = ?').get(produto_id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

  const info = db
    .prepare('INSERT INTO avaliacoes (usuario_id, produto_id, nota, comentario) VALUES (?, ?, ?, ?)')
    .run(req.session.usuario.id, produto_id, nota, comentario || '');

  res.status(201).json({ mensagem: 'Avaliação enviada com sucesso!', id: info.lastInsertRowid });
});

module.exports = router;
