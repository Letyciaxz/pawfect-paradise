// routes/servicos.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { exigirTipo } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM servicos ORDER BY nome ASC').all());
});

router.get('/:id', (req, res) => {
  const servico = db.prepare('SELECT * FROM servicos WHERE id = ?').get(req.params.id);
  if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado.' });
  res.json(servico);
});

router.post('/', exigirTipo('admin'), (req, res) => {
  const { nome, descricao, preco, duracao, imagem } = req.body;
  if (!nome || preco === undefined) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
  }
  const info = db
    .prepare('INSERT INTO servicos (nome, descricao, preco, duracao, imagem) VALUES (?, ?, ?, ?, ?)')
    .run(nome, descricao || '', preco, duracao || null, imagem || '');
  res.status(201).json({ mensagem: 'Serviço cadastrado com sucesso!', id: info.lastInsertRowid });
});

router.put('/:id', exigirTipo('admin'), (req, res) => {
  const existente = db.prepare('SELECT * FROM servicos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Serviço não encontrado.' });

  const {
    nome = existente.nome,
    descricao = existente.descricao,
    preco = existente.preco,
    duracao = existente.duracao,
    imagem = existente.imagem,
  } = req.body;

  db.prepare('UPDATE servicos SET nome=?, descricao=?, preco=?, duracao=?, imagem=? WHERE id=?').run(
    nome,
    descricao,
    preco,
    duracao,
    imagem,
    req.params.id
  );
  res.json({ mensagem: 'Serviço atualizado com sucesso!' });
});

router.delete('/:id', exigirTipo('admin'), (req, res) => {
  const existente = db.prepare('SELECT * FROM servicos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Serviço não encontrado.' });

  db.prepare('DELETE FROM servicos WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Serviço excluído com sucesso!' });
});

module.exports = router;
