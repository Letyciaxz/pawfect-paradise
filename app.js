// public/js/app.js
// Funções compartilhadas por todas as páginas: chamadas à API, carrinho
// (guardado no localStorage do navegador) e comportamento do cabeçalho.

const API_BASE = '/api';

const produtosOffline = [
  { id: 1, nome: 'Cama Redonda Rosa', descricao: 'Cama macia e redonda, ideal para cães e gatos pequenos', preco: 129.9, imagem: 'https://placedog.net/500/400?id=20', categoria_id: 1, categoria_nome: 'Camas e Tapetes' },
  { id: 2, nome: 'Tapete Higiênico Premium', descricao: 'Pacote com 30 unidades, alta absorção', preco: 59.9, imagem: 'https://placedog.net/500/400?id=21', categoria_id: 1, categoria_nome: 'Camas e Tapetes' },
  { id: 3, nome: 'Dinossauro de Pelúcia', descricao: 'Brinquedo resistente para mastigar', preco: 39.9, imagem: 'https://placedog.net/500/400?id=22', categoria_id: 2, categoria_nome: 'Brinquedos' },
  { id: 4, nome: 'Bolinha Interativa', descricao: 'Bolinha com guizo para estimular o pet', preco: 24.9, imagem: 'https://placedog.net/500/400?id=23', categoria_id: 2, categoria_nome: 'Brinquedos' },
  { id: 5, nome: 'Moletom Pet Rosa', descricao: 'Moletom quentinho para dias frios', preco: 79.9, imagem: 'https://placedog.net/500/400?id=24', categoria_id: 3, categoria_nome: 'Roupinhas' },
  { id: 6, nome: 'Bandana Estampada', descricao: 'Bandana ajustável, tamanho único', preco: 19.9, imagem: 'https://placedog.net/500/400?id=25', categoria_id: 3, categoria_nome: 'Roupinhas' },
  { id: 7, nome: 'Ração Premium 10kg', descricao: 'Ração completa para cães adultos', preco: 189.9, imagem: 'https://placedog.net/500/400?id=26', categoria_id: 4, categoria_nome: 'Alimentação' },
  { id: 8, nome: 'Pote Duplo Inox', descricao: 'Pote duplo para água e ração', preco: 49.9, imagem: 'https://placedog.net/500/400?id=27', categoria_id: 4, categoria_nome: 'Alimentação' },
  { id: 9, nome: 'Shampoo Neutro 500ml', descricao: 'Shampoo hipoalergênico para pele sensível', preco: 34.9, imagem: 'https://placedog.net/500/400?id=28', categoria_id: 5, categoria_nome: 'Higiene' },
  { id: 10, nome: 'Escova Removedora de Pelos', descricao: 'Remove pelos soltos sem machucar', preco: 44.9, imagem: 'https://placedog.net/500/400?id=29', categoria_id: 5, categoria_nome: 'Higiene' },
];

const categoriasOffline = [
  { id: 1, nome: 'Camas e Tapetes', imagem: 'https://placedog.net/400/300?id=10' },
  { id: 2, nome: 'Brinquedos', imagem: 'https://placedog.net/400/300?id=11' },
  { id: 3, nome: 'Roupinhas', imagem: 'https://placedog.net/400/300?id=12' },
  { id: 4, nome: 'Alimentação', imagem: 'https://placedog.net/400/300?id=13' },
  { id: 5, nome: 'Higiene', imagem: 'https://placedog.net/400/300?id=14' },
];

const servicosOffline = [
  { id: 1, nome: 'Banho', descricao: 'Banho completo com produtos hipoalergênicos', preco: 60, duracao: 60, imagem: 'https://placedog.net/400/300?id=30' },
  { id: 2, nome: 'Tosa', descricao: 'Tosa higiênica ou na tesoura, conforme o pet', preco: 80, duracao: 90, imagem: 'https://placedog.net/400/300?id=31' },
  { id: 3, nome: 'Consulta Veterinária', descricao: 'Consulta de rotina com veterinário parceiro', preco: 150, duracao: 30, imagem: 'https://placedog.net/400/300?id=32' },
  { id: 4, nome: 'Vacinação', descricao: 'Aplicação de vacinas essenciais', preco: 90, duracao: 20, imagem: 'https://placedog.net/400/300?id=33' },
];

function dadosOffline(caminho) {
  if (caminho.startsWith('/produtos/')) {
    const produto = produtosOffline.find((item) => item.id === Number(caminho.split('/')[2]));
    return produto ? { ...produto, avaliacoes: [] } : Promise.reject(new Error('Produto não encontrado.'));
  }
  if (caminho.startsWith('/produtos')) return { produtos: produtosOffline, pagina: 1, porPagina: produtosOffline.length };
  if (caminho.startsWith('/categorias')) return categoriasOffline;
  if (caminho.startsWith('/servicos')) return servicosOffline;
  if (caminho.startsWith('/avaliacoes')) return [];
  throw new Error('Esta função precisa do servidor para funcionar.');
}

/* ---------- CHAMADAS À API ---------- */
async function api(caminho, opcoes = {}) {
  try {
    const resposta = await fetch(API_BASE + caminho, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // necessário para enviar o cookie de sessão
      ...opcoes,
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      throw new Error(dados.erro || 'Ocorreu um erro inesperado.');
    }
    return dados;
  } catch (erro) {
    if (opcoes.method && opcoes.method !== 'GET') throw erro;
    return dadosOffline(caminho);
  }
}

const get = (caminho) => api(caminho);
const post = (caminho, corpo) => api(caminho, { method: 'POST', body: JSON.stringify(corpo) });
const put = (caminho, corpo) => api(caminho, { method: 'PUT', body: JSON.stringify(corpo) });
const del = (caminho) => api(caminho, { method: 'DELETE' });

function navegarComTransicao(url) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.location.href = url;
    return;
  }
  document.body.classList.add('page-transitioning');
  window.setTimeout(() => { window.location.href = url; }, 220);
}

/* ---------- FORMATAÇÃO ---------- */
function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderEstrelas(nota) {
  const cheias = '★'.repeat(nota);
  const vazias = '☆'.repeat(5 - nota);
  return `<span class="estrelas">${cheias}${vazias}</span>`;
}

function mostrarMensagem(elemento, texto, tipo = 'sucesso') {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `mensagem ${tipo}`;
  elemento.style.display = 'block';
  elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- CARRINHO (localStorage) ---------- */
const CHAVE_CARRINHO = 'pawfect_carrinho';

function obterCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  atualizarContadorCarrinho();
}

function adicionarAoCarrinho(produtoId, quantidade = 1) {
  const carrinho = obterCarrinho();
  const item = carrinho.find((i) => i.produto_id === produtoId);
  if (item) {
    item.quantidade += quantidade;
  } else {
    carrinho.push({ produto_id: produtoId, quantidade });
  }
  salvarCarrinho(carrinho);
}

function removerDoCarrinho(produtoId) {
  const carrinho = obterCarrinho().filter((i) => i.produto_id !== produtoId);
  salvarCarrinho(carrinho);
}

function atualizarQuantidadeCarrinho(produtoId, quantidade) {
  let carrinho = obterCarrinho();
  if (quantidade <= 0) {
    carrinho = carrinho.filter((i) => i.produto_id !== produtoId);
  } else {
    const item = carrinho.find((i) => i.produto_id === produtoId);
    if (item) item.quantidade = quantidade;
  }
  salvarCarrinho(carrinho);
}

function limparCarrinho() {
  localStorage.removeItem(CHAVE_CARRINHO);
  atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
  const total = obterCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = total;
    el.style.display = total > 0 ? 'inline-block' : 'none';
  });
}

/* ---------- CABEÇALHO: estado de login e menu mobile ---------- */
async function inicializarCabecalho() {
  atualizarContadorCarrinho();

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const linkUsuario = document.querySelector('#link-usuario');
  if (!linkUsuario) return;

  try {
    const { usuario } = await get('/usuarios/me');
    if (usuario) {
      linkUsuario.setAttribute('href', 'perfil.html');
      linkUsuario.setAttribute('title', `Olá, ${usuario.nome}`);
      const linkAdmin = document.querySelector('#link-admin');
      if (linkAdmin && (usuario.tipo === 'admin' || usuario.tipo === 'funcionario')) {
        linkAdmin.style.display = 'inline-block';
      }
    } else {
      linkUsuario.setAttribute('href', 'login.html');
      linkUsuario.setAttribute('title', 'Entrar');
    }
  } catch {
    linkUsuario.setAttribute('href', 'login.html');
  }
}

async function exigirLoginOuRedirecionar() {
  try {
    const { usuario } = await get('/usuarios/me');
    if (!usuario) {
      window.location.href = 'login.html';
      return null;
    }
    return usuario;
  } catch {
    window.location.href = 'login.html';
    return null;
  }
}

async function exigirStaffOuRedirecionar() {
  const usuario = await exigirLoginOuRedirecionar();
  if (usuario && usuario.tipo !== 'admin' && usuario.tipo !== 'funcionario') {
    window.location.href = 'index.html';
    return null;
  }
  return usuario;
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarCabecalho();

  document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    if (link.origin !== window.location.origin || !link.href || link.hash) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    evento.preventDefault();
    navegarComTransicao(link.href);
  });
});
