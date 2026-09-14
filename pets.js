// routes/pets.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { exigirLogin, exigirTipo } = require('../middleware/auth');

// GET /api/pets -> cliente vê só os seus; admin/funcionario veem todos com ?todos=1
router.get('/', exigirLogin, (req, res) => {
  const { usuario } = req.session;
  let pets;
  if ((usuario.tipo === 'admin' || usuario.tipo === 'funcionario') && req.query.todos) {
    pets = db
      .prepare(
        `SELECT pets.*, usuarios.nome AS dono_nome
         FROM pets JOIN usuarios ON usuarios.id = pets.usuario_id
         ORDER BY pets.id DESC`
      )
      .all();
  } else {
    pets = db.prepare('SELECT * FROM pets WHERE usuario_id = ? ORDER BY id DESC').all(usuario.id);
  }
  res.json(pets);
});

function podeAcessarPet(req, pet) {
  if (!pet) return false;
  const { usuario } = req.session;
  return usuario.tipo === 'admin' || usuario.tipo === 'funcionario' || pet.usuario_id === usuario.id;
}

router.get('/:id', exigirLogin, (req, res) => {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id);
  if (!podeAcessarPet(req, pet)) return res.status(404).json({ erro: 'Pet não encontrado.' });
  res.json(pet);
});

router.post('/', exigirLogin, (req, res) => {
  const { nome, especie, raca, idade, sexo, peso, observacoes, foto } = req.body;
  if (!nome || !especie) {
    return res.status(400).json({ erro: 'Nome e espécie são obrigatórios.' });
  }
  const info = db
    .prepare(
      `INSERT INTO pets (usuario_id, nome, especie, raca, idade, sexo, peso, observacoes, foto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.session.usuario.id,
      nome,
      especie,
      raca || '',
      idade || null,
      sexo || '',
      peso || null,
      observacoes || '',
      foto || ''
    );
  res.status(201).json({ mensagem: 'Pet cadastrado com sucesso!', id: info.lastInsertRowid });
});

router.put('/:id', exigirLogin, (req, res) => {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id);
  if (!podeAcessarPet(req, pet)) return res.status(404).json({ erro: 'Pet não encontrado.' });

  const {
    nome = pet.nome,
    especie = pet.especie,
    raca = pet.raca,
    idade = pet.idade,
    sexo = pet.sexo,
    peso = pet.peso,
    observacoes = pet.observacoes,
    foto = pet.foto,
  } = req.body;

  db.prepare(
    `UPDATE pets SET nome=?, especie=?, raca=?, idade=?, sexo=?, peso=?, observacoes=?, foto=? WHERE id=?`
  ).run(nome, especie, raca, idade, sexo, peso, observacoes, foto, req.params.id);

  res.json({ mensagem: 'Pet atualizado com sucesso!' });
});

router.delete('/:id', exigirLogin, (req, res) => {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id);
  if (!podeAcessarPet(req, pet)) return res.status(404).json({ erro: 'Pet não encontrado.' });

  db.prepare('DELETE FROM pets WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Pet excluído com sucesso!' });
});

module.exports = router;
