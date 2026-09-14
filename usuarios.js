// routes/usuarios.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/database');
const { exigirLogin, exigirTipo } = require('../middleware/auth');

function usuarioPublico(usuario) {
  // Nunca devolvemos a senha (nem o hash) para o frontend
  const { senha, ...resto } = usuario;
  return resto;
}

// POST /api/usuarios  -> cadastro de novo cliente
router.post('/', (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const existente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existente) return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });

  const hash = bcrypt.hashSync(senha, 10);
  const info = db
    .prepare('INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)')
    .run(nome, email, hash, 'cliente');

  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(info.lastInsertRowid);
  req.session.usuario = usuarioPublico(usuario);
  res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!', usuario: usuarioPublico(usuario) });
});

// POST /api/login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha.' });

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }

  req.session.usuario = usuarioPublico(usuario);
  res.json({ mensagem: 'Login realizado com sucesso!', usuario: usuarioPublico(usuario) });
});

// POST /api/usuarios/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ mensagem: 'Sessão encerrada com sucesso!' });
  });
});

// GET /api/usuarios/me -> retorna o usuário logado (útil para o frontend saber o estado da sessão)
router.get('/me', (req, res) => {
  if (!req.session.usuario) return res.status(200).json({ usuario: null });
  res.json({ usuario: req.session.usuario });
});

// GET /api/usuarios (somente admin) -> lista todos os usuários
router.get('/', exigirTipo('admin'), (req, res) => {
  const usuarios = db.prepare('SELECT id, nome, email, tipo, criado_em FROM usuarios ORDER BY id DESC').all();
  res.json(usuarios);
});

// PUT /api/usuarios/:id -> o próprio usuário edita seu perfil (ou admin edita qualquer um)
router.put('/:id', exigirLogin, (req, res) => {
  const alvo = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (!alvo) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const souEuMesmo = req.session.usuario.id === alvo.id;
  const souAdmin = req.session.usuario.tipo === 'admin';
  if (!souEuMesmo && !souAdmin) {
    return res.status(403).json({ erro: 'Você não pode editar este usuário.' });
  }

  const { nome = alvo.nome, email = alvo.email } = req.body;
  let tipo = alvo.tipo;
  if (souAdmin && req.body.tipo) tipo = req.body.tipo; // só admin pode mudar tipo/permissão

  let senhaHash = alvo.senha;
  if (req.body.senha) {
    if (req.body.senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    senhaHash = bcrypt.hashSync(req.body.senha, 10);
  }

  db.prepare('UPDATE usuarios SET nome=?, email=?, senha=?, tipo=? WHERE id=?').run(
    nome,
    email,
    senhaHash,
    tipo,
    req.params.id
  );

  const atualizado = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (souEuMesmo) req.session.usuario = usuarioPublico(atualizado);
  res.json({ mensagem: 'Perfil atualizado com sucesso!', usuario: usuarioPublico(atualizado) });
});

// DELETE /api/usuarios/:id (somente admin)
router.delete('/:id', exigirTipo('admin'), (req, res) => {
  const alvo = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (!alvo) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Usuário excluído com sucesso!' });
});

module.exports = router;
