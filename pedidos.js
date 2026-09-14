// routes/pedidos.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { exigirLogin, exigirTipo } = require('../middleware/auth');

function podeAcessarPedido(req, pedido) {
  if (!pedido) return false;
  const { usuario } = req.session;
  return usuario.tipo === 'admin' || usuario.tipo === 'funcionario' || pedido.usuario_id === usuario.id;
}

// GET /api/pedidos -> cliente vê os seus; admin/funcionario veem todos
router.get('/', exigirLogin, (req, res) => {
  const { usuario } = req.session;
  let pedidos;
  if (usuario.tipo === 'admin' || usuario.tipo === 'funcionario') {
    pedidos = db
      .prepare(
        `SELECT pedidos.*, usuarios.nome AS cliente_nome
         FROM pedidos JOIN usuarios ON usuarios.id = pedidos.usuario_id
         ORDER BY pedidos.id DESC`
      )
      .all();
  } else {
    pedidos = db.prepare('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY id DESC').all(usuario.id);
  }

  const itensStmt = db.prepare(
    `SELECT itens_pedido.*, produtos.nome AS produto_nome, produtos.imagem AS produto_imagem
     FROM itens_pedido JOIN produtos ON produtos.id = itens_pedido.produto_id
     WHERE pedido_id = ?`
  );
  const pedidosComItens = pedidos.map((p) => ({ ...p, itens: itensStmt.all(p.id) }));
  res.json(pedidosComItens);
});

router.get('/:id', exigirLogin, (req, res) => {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  if (!podeAcessarPedido(req, pedido)) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  const itens = db
    .prepare(
      `SELECT itens_pedido.*, produtos.nome AS produto_nome, produtos.imagem AS produto_imagem
       FROM itens_pedido JOIN produtos ON produtos.id = itens_pedido.produto_id
       WHERE pedido_id = ?`
    )
    .all(pedido.id);

  res.json({ ...pedido, itens });
});

// POST /api/pedidos -> finaliza uma compra (carrinho vem do frontend)
// body: { itens: [{ produto_id, quantidade }, ...] }
router.post('/', exigirLogin, (req, res) => {
  const { itens } = req.body;
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'O carrinho está vazio.' });
  }

  const buscarProduto = db.prepare('SELECT * FROM produtos WHERE id = ?');
  const criarPedido = db.prepare('INSERT INTO pedidos (usuario_id, valor_total, status) VALUES (?, ?, ?)');
  const inserirItem = db.prepare(
    'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco) VALUES (?, ?, ?, ?)'
  );
  const atualizarEstoque = db.prepare('UPDATE produtos SET estoque = estoque - ? WHERE id = ?');

  // Usamos uma transação: ou tudo é salvo com sucesso, ou nada é alterado no banco.
  const criarPedidoCompleto = db.transaction((itensCarrinho) => {
    let valorTotal = 0;
    const itensValidados = [];

    for (const item of itensCarrinho) {
      const produto = buscarProduto.get(item.produto_id);
      if (!produto) throw new Error(`Produto ${item.produto_id} não encontrado.`);
      if (produto.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para "${produto.nome}".`);
      }
      valorTotal += produto.preco * item.quantidade;
      itensValidados.push({ produto, quantidade: item.quantidade });
    }

    const info = criarPedido.run(req.session.usuario.id, valorTotal, 'Pendente');
    const pedidoId = info.lastInsertRowid;

    for (const { produto, quantidade } of itensValidados) {
      inserirItem.run(pedidoId, produto.id, quantidade, produto.preco);
      atualizarEstoque.run(quantidade, produto.id);
    }

    return { pedidoId, valorTotal };
  });

  try {
    const resultado = criarPedidoCompleto(itens);
    res.status(201).json({ mensagem: 'Pedido realizado com sucesso!', ...resultado });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// PUT /api/pedidos/:id -> apenas admin/funcionario atualizam status
router.put('/:id', exigirTipo('admin', 'funcionario'), (req, res) => {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  const { status = pedido.status } = req.body;
  db.prepare('UPDATE pedidos SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ mensagem: 'Status do pedido atualizado com sucesso!' });
});

module.exports = router;
