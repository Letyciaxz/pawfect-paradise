// routes/produtos.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { exigirTipo } = require('../middleware/auth');

// GET /api/produtos
// Suporta: ?busca=texto  ?categoria_id=1  ?ordenar=preco_asc|preco_desc|nome_asc|nome_desc
//          ?pagina=1  ?porPagina=12
router.get('/', (req, res) => {
  const { busca, categoria_id, ordenar, pagina, porPagina } = req.query;

  let sql = `SELECT produtos.*, categorias.nome AS categoria_nome
             FROM produtos
             LEFT JOIN categorias ON categorias.id = produtos.categoria_id
             WHERE produtos.status = 'ativo'`;
  const params = [];

  if (busca) {
    sql += ' AND (produtos.nome LIKE ? OR produtos.descricao LIKE ?)';
    params.push(`%${busca}%`, `%${busca}%`);
  }
  if (categoria_id) {
    sql += ' AND produtos.categoria_id = ?';
    params.push(categoria_id);
  }

  const ordenacoes = {
    preco_asc: ' ORDER BY produtos.preco ASC',
    preco_desc: ' ORDER BY produtos.preco DESC',
    nome_asc: ' ORDER BY produtos.nome ASC',
    nome_desc: ' ORDER BY produtos.nome DESC',
  };
  sql += ordenacoes[ordenar] || ' ORDER BY produtos.id DESC';

  const pageNum = Math.max(parseInt(pagina) || 1, 1);
  const perPage = Math.max(parseInt(porPagina) || 12, 1);
  sql += ' LIMIT ? OFFSET ?';
  params.push(perPage, (pageNum - 1) * perPage);

  try {
    const produtos = db.prepare(sql).all(...params);
    res.json({ produtos, pagina: pageNum, porPagina: perPage });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos.', detalhe: err.message });
  }
});

// GET /api/produtos/:id
router.get('/:id', (req, res) => {
  const produto = db
    .prepare(
      `SELECT produtos.*, categorias.nome AS categoria_nome
       FROM produtos LEFT JOIN categorias ON categorias.id = produtos.categoria_id
       WHERE produtos.id = ?`
    )
    .get(req.params.id);

  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

  const avaliacoes = db
    .prepare(
      `SELECT avaliacoes.*, usuarios.nome AS usuario_nome
       FROM avaliacoes JOIN usuarios ON usuarios.id = avaliacoes.usuario_id
       WHERE produto_id = ? ORDER BY avaliacoes.id DESC`
    )
    .all(req.params.id);

  res.json({ ...produto, avaliacoes });
});

// POST /api/produtos (somente admin)
router.post('/', exigirTipo('admin'), (req, res) => {
  const { nome, descricao, preco, estoque, imagem, categoria_id } = req.body;
  if (!nome || preco === undefined) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
  }
  const info = db
    .prepare(
      `INSERT INTO produtos (nome, descricao, preco, estoque, imagem, categoria_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(nome, descricao || '', preco, estoque || 0, imagem || '', categoria_id || null);

  res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', id: info.lastInsertRowid });
});

// PUT /api/produtos/:id (somente admin)
router.put('/:id', exigirTipo('admin'), (req, res) => {
  const existente = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Produto não encontrado.' });

  const {
    nome = existente.nome,
    descricao = existente.descricao,
    preco = existente.preco,
    estoque = existente.estoque,
    imagem = existente.imagem,
    categoria_id = existente.categoria_id,
    status = existente.status,
  } = req.body;

  db.prepare(
    `UPDATE produtos SET nome=?, descricao=?, preco=?, estoque=?, imagem=?, categoria_id=?, status=?
     WHERE id=?`
  ).run(nome, descricao, preco, estoque, imagem, categoria_id, status, req.params.id);

  res.json({ mensagem: 'Produto atualizado com sucesso!' });
});

// DELETE /api/produtos/:id (somente admin)
router.delete('/:id', exigirTipo('admin'), (req, res) => {
  const existente = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Produto não encontrado.' });

  db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Produto excluído com sucesso!' });
});

module.exports = router;
