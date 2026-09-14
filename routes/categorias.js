// routes/categorias.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { exigirTipo } = require('../middleware/auth');

router.get('/', (req, res) => {
  const categorias = db.prepare('SELECT * FROM categorias ORDER BY nome ASC').all();
  res.json(categorias);
});

router.get('/:id', (req, res) => {
  const categoria = db.prepare('SELECT * FROM categorias WHERE id = ?').get(req.params.id);
  if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });
  res.json(categoria);
});

router.post('/', exigirTipo('admin'), (req, res) => {
  const { nome, descricao, imagem } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });

  try {
    const info = db
      .prepare('INSERT INTO categorias (nome, descricao, imagem) VALUES (?, ?, ?)')
      .run(nome, descricao || '', imagem || '');
    res.status(201).json({ mensagem: 'Categoria cadastrada com sucesso!', id: info.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ erro: 'Já existe uma categoria com esse nome.' });
  }
});

router.put('/:id', exigirTipo('admin'), (req, res) => {
  const existente = db.prepare('SELECT * FROM categorias WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Categoria não encontrada.' });

  const { nome = existente.nome, descricao = existente.descricao, imagem = existente.imagem } = req.body;
  db.prepare('UPDATE categorias SET nome=?, descricao=?, imagem=? WHERE id=?').run(
    nome,
    descricao,
    imagem,
    req.params.id
  );
  res.json({ mensagem: 'Categoria atualizada com sucesso!' });
});

router.delete('/:id', exigirTipo('admin'), (req, res) => {
  const existente = db.prepare('SELECT * FROM categorias WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Categoria não encontrada.' });

  db.prepare('DELETE FROM categorias WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Categoria excluída com sucesso!' });
});

module.exports = router;
