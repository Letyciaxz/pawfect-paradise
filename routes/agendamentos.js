// routes/agendamentos.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { exigirLogin, exigirTipo } = require('../middleware/auth');

function podeAcessarAgendamento(req, agendamento) {
  if (!agendamento) return false;
  const { usuario } = req.session;
  return usuario.tipo === 'admin' || usuario.tipo === 'funcionario' || agendamento.usuario_id === usuario.id;
}

// GET /api/agendamentos -> cliente vê os seus; admin/funcionario veem todos
router.get('/', exigirLogin, (req, res) => {
  const { usuario } = req.session;
  const sqlBase = `
    SELECT agendamentos.*, pets.nome AS pet_nome, servicos.nome AS servico_nome,
           servicos.preco AS servico_preco, usuarios.nome AS cliente_nome
    FROM agendamentos
    JOIN pets ON pets.id = agendamentos.pet_id
    JOIN servicos ON servicos.id = agendamentos.servico_id
    JOIN usuarios ON usuarios.id = agendamentos.usuario_id
  `;
  let agendamentos;
  if (usuario.tipo === 'admin' || usuario.tipo === 'funcionario') {
    agendamentos = db.prepare(sqlBase + ' ORDER BY agendamentos.data DESC, agendamentos.horario DESC').all();
  } else {
    agendamentos = db
      .prepare(sqlBase + ' WHERE agendamentos.usuario_id = ? ORDER BY agendamentos.data DESC, agendamentos.horario DESC')
      .all(usuario.id);
  }
  res.json(agendamentos);
});

router.get('/:id', exigirLogin, (req, res) => {
  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(req.params.id);
  if (!podeAcessarAgendamento(req, agendamento)) {
    return res.status(404).json({ erro: 'Agendamento não encontrado.' });
  }
  res.json(agendamento);
});

// POST /api/agendamentos -> cliente agenda um serviço para um pet seu
router.post('/', exigirLogin, (req, res) => {
  const { pet_id, servico_id, data, horario } = req.body;
  if (!pet_id || !servico_id || !data || !horario) {
    return res.status(400).json({ erro: 'Pet, serviço, data e horário são obrigatórios.' });
  }

  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(pet_id);
  if (!pet || pet.usuario_id !== req.session.usuario.id) {
    return res.status(403).json({ erro: 'Você só pode agendar serviços para os seus próprios pets.' });
  }
  const servico = db.prepare('SELECT * FROM servicos WHERE id = ?').get(servico_id);
  if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado.' });

  const info = db
    .prepare(
      `INSERT INTO agendamentos (usuario_id, pet_id, servico_id, data, horario, status)
       VALUES (?, ?, ?, ?, ?, 'Agendado')`
    )
    .run(req.session.usuario.id, pet_id, servico_id, data, horario);

  res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!', id: info.lastInsertRowid });
});

// PUT /api/agendamentos/:id -> cliente pode remarcar/cancelar o seu; funcionario/admin podem mudar status de qualquer um
router.put('/:id', exigirLogin, (req, res) => {
  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(req.params.id);
  if (!podeAcessarAgendamento(req, agendamento)) {
    return res.status(404).json({ erro: 'Agendamento não encontrado.' });
  }

  const { usuario } = req.session;
  const souDono = agendamento.usuario_id === usuario.id;
  const souStaff = usuario.tipo === 'admin' || usuario.tipo === 'funcionario';

  let { data = agendamento.data, horario = agendamento.horario, status = agendamento.status } = req.body;

  // Cliente comum só pode remarcar data/horário ou cancelar o próprio agendamento
  if (!souStaff) {
    if (status && status !== 'Cancelado') {
      return res.status(403).json({ erro: 'Você só pode cancelar seu agendamento, não alterar o status.' });
    }
  }

  db.prepare('UPDATE agendamentos SET data=?, horario=?, status=? WHERE id=?').run(
    data,
    horario,
    status,
    req.params.id
  );

  res.json({ mensagem: 'Agendamento atualizado com sucesso!' });
});

router.delete('/:id', exigirLogin, (req, res) => {
  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(req.params.id);
  if (!podeAcessarAgendamento(req, agendamento)) {
    return res.status(404).json({ erro: 'Agendamento não encontrado.' });
  }
  db.prepare('DELETE FROM agendamentos WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Agendamento excluído com sucesso!' });
});

module.exports = router;
