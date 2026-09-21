// app.js
// Versão frontend puro para Vercel: tudo fica em localStorage e não depende
// de servidor Node/Express nem de banco SQLite.

const API_BASE = '';

const STORAGE_KEYS = {
  usuarios: 'pawfect_usuarios',
  usuarioAtual: 'pawfect_usuario',
  produtos: 'pawfect_produtos',
  categorias: 'pawfect_categorias',
  servicos: 'pawfect_servicos',
  pets: 'pawfect_pets',
  agendamentos: 'pawfect_agendamentos',
  pedidos: 'pawfect_pedidos',
  avaliacoes: 'pawfect_avaliacoes',
  carrinho: 'pawfect_carrinho',
};

const usuariosOffline = [
  { id: 1, nome: 'Administrator', email: 'admin@pawfect.com', senha: '123456', tipo: 'admin' },
  { id: 2, nome: 'Employee', email: 'funcionario@pawfect.com', senha: '123456', tipo: 'funcionario' },
  { id: 3, nome: 'Demo Customer', email: 'cliente@pawfect.com', senha: '123456', tipo: 'cliente' },
];

const produtosOffline = [
  { id: 1, nome: 'Pink Round Bed', descricao: 'Soft and round bed, ideal for small dogs and cats', preco: 129.9, estoque: 12, imagem: 'https://placedog.net/500/400?id=20', categoria_id: 1, status: 'ativo' },
  { id: 2, nome: 'Premium Hygiene Mat', descricao: 'Pack of 30 units with high absorption', preco: 59.9, estoque: 20, imagem: 'https://placedog.net/500/400?id=21', categoria_id: 1, status: 'ativo' },
  { id: 3, nome: 'Plush Dinosaur', descricao: 'Durable chew toy for active pets', preco: 39.9, estoque: 18, imagem: 'https://placedog.net/500/400?id=22', categoria_id: 2, status: 'ativo' },
  { id: 4, nome: 'Interactive Ball', descricao: 'Jingle ball to keep your pet engaged', preco: 24.9, estoque: 30, imagem: 'https://placedog.net/500/400?id=23', categoria_id: 2, status: 'ativo' },
  { id: 5, nome: 'Pink Pet Hoodie', descricao: 'Cozy sweatshirt for chilly days', preco: 79.9, estoque: 15, imagem: 'https://placedog.net/500/400?id=24', categoria_id: 3, status: 'ativo' },
  { id: 6, nome: 'Printed Bandana', descricao: 'Adjustable bandana in one size', preco: 19.9, estoque: 25, imagem: 'https://placedog.net/500/400?id=25', categoria_id: 3, status: 'ativo' },
  { id: 7, nome: 'Premium Food 10kg', descricao: 'Complete dry food for adult dogs', preco: 189.9, estoque: 10, imagem: 'https://placedog.net/500/400?id=26', categoria_id: 4, status: 'ativo' },
  { id: 8, nome: 'Double Stainless Bowl', descricao: 'Two-compartment bowl for food and water', preco: 49.9, estoque: 14, imagem: 'https://placedog.net/500/400?id=27', categoria_id: 4, status: 'ativo' },
  { id: 9, nome: 'Neutral Shampoo 500ml', descricao: 'Hypoallergenic shampoo for sensitive skin', preco: 34.9, estoque: 16, imagem: 'https://placedog.net/500/400?id=28', categoria_id: 5, status: 'ativo' },
  { id: 10, nome: 'Hair Removal Brush', descricao: 'Removes loose fur without irritating the coat', preco: 44.9, estoque: 22, imagem: 'https://placedog.net/500/400?id=29', categoria_id: 5, status: 'ativo' },
];

const categoriasOffline = [
  { id: 1, nome: 'Beds & Mats', descricao: 'Comfort and rest essentials', imagem: 'https://placedog.net/400/300?id=10' },
  { id: 2, nome: 'Toys', descricao: 'Fun and stimulation for your pet', imagem: 'https://placedog.net/400/300?id=11' },
  { id: 3, nome: 'Clothing', descricao: 'Cute and functional pet looks', imagem: 'https://placedog.net/400/300?id=12' },
  { id: 4, nome: 'Feeding', descricao: 'Food, bowls, and daily essentials', imagem: 'https://placedog.net/400/300?id=13' },
  { id: 5, nome: 'Hygiene', descricao: 'Bath and wellness essentials', imagem: 'https://placedog.net/400/300?id=14' },
];

const servicosOffline = [
  { id: 1, nome: 'Bath', descricao: 'Full bath with hypoallergenic products', preco: 60, duracao: 60, imagem: 'https://placedog.net/400/300?id=30' },
  { id: 2, nome: 'Grooming', descricao: 'Hygienic trim or scissors cut, as needed', preco: 80, duracao: 90, imagem: 'https://placedog.net/400/300?id=31' },
  { id: 3, nome: 'Veterinary Consultation', descricao: 'Routine consultation with a partner veterinarian', preco: 150, duracao: 30, imagem: 'https://placedog.net/400/300?id=32' },
  { id: 4, nome: 'Vaccination', descricao: 'Essential vaccine application', preco: 90, duracao: 20, imagem: 'https://placedog.net/400/300?id=33' },
];

const petsOffline = [
  { id: 1, usuario_id: 3, nome: 'Luna', tipo: 'Dog', raca: 'Shih Tzu', idade: '2 years', observacoes: 'Very calm and affectionate' },
  { id: 2, usuario_id: 3, nome: 'Mimi', tipo: 'Cat', raca: 'Siamese', idade: '1 year', observacoes: 'Loves to play' },
];

function parseStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizarDadosIngles() {
  const produtos = parseStorage(STORAGE_KEYS.produtos, produtosOffline);
  const categorias = parseStorage(STORAGE_KEYS.categorias, categoriasOffline);
  const servicos = parseStorage(STORAGE_KEYS.servicos, servicosOffline);
  const usuarios = parseStorage(STORAGE_KEYS.usuarios, usuariosOffline);

  const remapProdutos = {
    'Cama Redonda Rosa': 'Pink Round Bed',
    'Tapete Higiênico Premium': 'Premium Hygiene Mat',
    'Dinossauro de Pelúcia': 'Plush Dinosaur',
    'Bolinha Interativa': 'Interactive Ball',
    'Moletom Pet Rosa': 'Pink Pet Hoodie',
    'Bandana Estampada': 'Printed Bandana',
    'Ração Premium 10kg': 'Premium Food 10kg',
    'Pote Duplo Inox': 'Double Stainless Bowl',
    'Shampoo Neutro 500ml': 'Neutral Shampoo 500ml',
    'Escova Removedora de Pelos': 'Hair Removal Brush',
  };

  const remapCategorias = {
    'Camas e Tapetes': 'Beds & Mats',
    'Brinquedos': 'Toys',
    'Roupinhas': 'Clothing',
    'Alimentação': 'Feeding',
    'Higiene': 'Hygiene',
  };

  const remapServicos = {
    Banho: 'Bath',
    Tosa: 'Grooming',
    'Consulta Veterinária': 'Veterinary Consultation',
    Vacinação: 'Vaccination',
  };

  const remapUsuarios = {
    Administrador: 'Administrator',
    Funcionário: 'Employee',
    'Cliente Demo': 'Demo Customer',
  };

  const produtosAtualizados = produtos.map((item) => ({
    ...item,
    nome: remapProdutos[item.nome] || item.nome,
    descricao: item.descricao || '',
  }));

  const categoriasAtualizadas = categorias.map((item) => ({
    ...item,
    nome: remapCategorias[item.nome] || item.nome,
    descricao: item.descricao || '',
  }));

  const servicosAtualizados = servicos.map((item) => ({
    ...item,
    nome: remapServicos[item.nome] || item.nome,
    descricao: item.descricao || '',
  }));

  const usuariosAtualizados = usuarios.map((item) => ({
    ...item,
    nome: remapUsuarios[item.nome] || item.nome,
  }));

  if (JSON.stringify(produtos) !== JSON.stringify(produtosAtualizados)) setStorage(STORAGE_KEYS.produtos, produtosAtualizados);
  if (JSON.stringify(categorias) !== JSON.stringify(categoriasAtualizadas)) setStorage(STORAGE_KEYS.categorias, categoriasAtualizadas);
  if (JSON.stringify(servicos) !== JSON.stringify(servicosAtualizados)) setStorage(STORAGE_KEYS.servicos, servicosAtualizados);
  if (JSON.stringify(usuarios) !== JSON.stringify(usuariosAtualizados)) setStorage(STORAGE_KEYS.usuarios, usuariosAtualizados);
}

function seedLocalStorage() {
  normalizarDadosIngles();

  if (!localStorage.getItem(STORAGE_KEYS.usuarios)) {
    setStorage(STORAGE_KEYS.usuarios, usuariosOffline);
  }
  if (!localStorage.getItem(STORAGE_KEYS.produtos)) {
    setStorage(STORAGE_KEYS.produtos, produtosOffline);
  }
  if (!localStorage.getItem(STORAGE_KEYS.categorias)) {
    setStorage(STORAGE_KEYS.categorias, categoriasOffline);
  }
  if (!localStorage.getItem(STORAGE_KEYS.servicos)) {
    setStorage(STORAGE_KEYS.servicos, servicosOffline);
  }
  if (!localStorage.getItem(STORAGE_KEYS.pets)) {
    setStorage(STORAGE_KEYS.pets, petsOffline);
  }
  if (!localStorage.getItem(STORAGE_KEYS.agendamentos)) {
    setStorage(STORAGE_KEYS.agendamentos, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.pedidos)) {
    setStorage(STORAGE_KEYS.pedidos, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.avaliacoes)) {
    setStorage(STORAGE_KEYS.avaliacoes, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.usuarioAtual)) {
    localStorage.removeItem(STORAGE_KEYS.usuarioAtual);
  }
}

function normalizeUsuario(usuario) {
  if (!usuario) return null;
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo || 'cliente' };
}

function obterUsuarioAtual() {
  const usuario = parseStorage(STORAGE_KEYS.usuarioAtual, null);
  return normalizeUsuario(usuario);
}

function salvarUsuarioAtual(usuario) {
  if (!usuario) {
    localStorage.removeItem(STORAGE_KEYS.usuarioAtual);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.usuarioAtual, JSON.stringify(usuario));
}

function proximoId(lista) {
  return lista.reduce((maior, item) => Math.max(maior, Number(item.id || 0)), 0) + 1;
}

function listarCategorias() {
  return parseStorage(STORAGE_KEYS.categorias, categoriasOffline);
}

function listarProdutos() {
  return parseStorage(STORAGE_KEYS.produtos, produtosOffline);
}

function listarServicos() {
  return parseStorage(STORAGE_KEYS.servicos, servicosOffline);
}

function listarAvaliacoes() {
  return parseStorage(STORAGE_KEYS.avaliacoes, []);
}

function montarProduto(item) {
  const categoria = listarCategorias().find((c) => Number(c.id) === Number(item.categoria_id));
  return { ...item, categoria_nome: categoria ? categoria.nome : '' };
}

function montarAvaliacao(item) {
  const usuario = parseStorage(STORAGE_KEYS.usuarios, usuariosOffline).find((u) => Number(u.id) === Number(item.usuario_id));
  return { ...item, usuario_nome: usuario ? usuario.nome : 'Usuário' };
}

function exigirLogin() {
  const usuario = obterUsuarioAtual();
  if (!usuario) {
    throw new Error('You need to be logged in to access this resource.');
  }
  return usuario;
}

function exigirTipo(...tiposPermitidos) {
  const usuario = exigirLogin();
  if (!tiposPermitidos.includes(usuario.tipo)) {
    throw new Error('You do not have permission to access this resource.');
  }
  return usuario;
}

function getRouteAndQuery(caminho) {
  const url = new URL(caminho, 'https://local.test');
  return {
    route: url.pathname,
    query: url.searchParams,
  };
}

async function api(caminho, opcoes = {}) {
  seedLocalStorage();

  const method = (opcoes.method || 'GET').toUpperCase();
  const body = opcoes.body ? JSON.parse(opcoes.body) : undefined;
  const { route, query } = getRouteAndQuery(caminho);
  const partes = route.split('/').filter(Boolean);

  if (route === '/produtos' || route.startsWith('/produtos?')) {
    const produtos = listarProdutos();
    if (method === 'GET') {
      let lista = produtos.map(montarProduto);
      const busca = (query.get('busca') || '').toLowerCase();
      const categoriaId = query.get('categoria_id');
      const ordenar = query.get('ordenar') || '';
      if (busca) lista = lista.filter((item) => item.nome.toLowerCase().includes(busca) || (item.descricao || '').toLowerCase().includes(busca));
      if (categoriaId) lista = lista.filter((item) => String(item.categoria_id) === String(categoriaId));
      if (ordenar === 'preco_asc') lista.sort((a, b) => Number(a.preco) - Number(b.preco));
      if (ordenar === 'preco_desc') lista.sort((a, b) => Number(b.preco) - Number(a.preco));
      if (ordenar === 'nome_asc') lista.sort((a, b) => a.nome.localeCompare(b.nome));
      if (ordenar === 'nome_desc') lista.sort((a, b) => b.nome.localeCompare(a.nome));
      const pagina = Number(query.get('pagina') || 1);
      const porPagina = Number(query.get('porPagina') || lista.length || 12);
      const inicio = (pagina - 1) * porPagina;
      const itens = lista.slice(inicio, inicio + porPagina);
      return { produtos: itens, pagina, porPagina, total: lista.length };
    }
    if (method === 'POST') {
      exigirTipo('admin');
      const novoProduto = {
        id: proximoId(produtos),
        nome: body.nome,
        descricao: body.descricao || '',
        preco: Number(body.preco || 0),
        estoque: Number(body.estoque || 0),
        imagem: body.imagem || 'https://placedog.net/500/400?id=99',
        categoria_id: Number(body.categoria_id || 1),
        status: body.status || 'ativo',
      };
      produtos.push(novoProduto);
      setStorage(STORAGE_KEYS.produtos, produtos);
      return montarProduto(novoProduto);
    }
    throw new Error('Operação não suportada para produtos.');
  }

  if (route.startsWith('/produtos/')) {
    const produtos = listarProdutos();
    const id = Number(partes[1]);
    const produto = produtos.find((item) => Number(item.id) === id);
    if (!produto) throw new Error('Product not found.');
    if (method === 'GET') {
      const avaliacoes = listarAvaliacoes().filter((a) => Number(a.produto_id) === id).map(montarAvaliacao);
      return { ...montarProduto(produto), avaliacoes };
    }
    if (method === 'PUT') {
      exigirTipo('admin');
      Object.assign(produto, {
        nome: body.nome || produto.nome,
        descricao: body.descricao ?? produto.descricao,
        preco: Number(body.preco ?? produto.preco),
        estoque: Number(body.estoque ?? produto.estoque),
        imagem: body.imagem || produto.imagem,
        categoria_id: Number(body.categoria_id ?? produto.categoria_id),
        status: body.status || produto.status,
      });
      setStorage(STORAGE_KEYS.produtos, produtos);
      return montarProduto(produto);
    }
    if (method === 'DELETE') {
      exigirTipo('admin');
      const filtrados = produtos.filter((item) => Number(item.id) !== id);
      setStorage(STORAGE_KEYS.produtos, filtrados);
      return { ok: true };
    }
  }

  if (route === '/categorias' || route.startsWith('/categorias?')) {
    const categorias = listarCategorias();
    if (method === 'GET') return categorias;
    if (method === 'POST') {
      exigirTipo('admin');
      const nova = { id: proximoId(categorias), nome: body.nome, descricao: body.descricao || '', imagem: body.imagem || 'https://placedog.net/400/300?id=99' };
      categorias.push(nova);
      setStorage(STORAGE_KEYS.categorias, categorias);
      return nova;
    }
    throw new Error('Operação não suportada para categorias.');
  }

  if (route.startsWith('/categorias/')) {
    const categorias = listarCategorias();
    const id = Number(partes[1]);
    const categoria = categorias.find((item) => Number(item.id) === id);
    if (!categoria) throw new Error('Categoria não encontrada.');
    if (method === 'PUT') {
      exigirTipo('admin');
      Object.assign(categoria, {
        nome: body.nome || categoria.nome,
        descricao: body.descricao ?? categoria.descricao,
        imagem: body.imagem || categoria.imagem,
      });
      setStorage(STORAGE_KEYS.categorias, categorias);
      return categoria;
    }
    if (method === 'DELETE') {
      exigirTipo('admin');
      const filtrados = categorias.filter((item) => Number(item.id) !== id);
      setStorage(STORAGE_KEYS.categorias, filtrados);
      return { ok: true };
    }
  }

  if (route === '/servicos' || route.startsWith('/servicos?')) {
    const servicos = listarServicos();
    if (method === 'GET') return servicos;
    if (method === 'POST') {
      exigirTipo('admin');
      const novo = { id: proximoId(servicos), nome: body.nome, descricao: body.descricao || '', preco: Number(body.preco || 0), duracao: Number(body.duracao || 0), imagem: body.imagem || 'https://placedog.net/400/300?id=99' };
      servicos.push(novo);
      setStorage(STORAGE_KEYS.servicos, servicos);
      return novo;
    }
    throw new Error('Operação não suportada para serviços.');
  }

  if (route.startsWith('/servicos/')) {
    const servicos = listarServicos();
    const id = Number(partes[1]);
    const servico = servicos.find((item) => Number(item.id) === id);
    if (!servico) throw new Error('Serviço não encontrado.');
    if (method === 'PUT') {
      exigirTipo('admin');
      Object.assign(servico, {
        nome: body.nome || servico.nome,
        descricao: body.descricao ?? servico.descricao,
        preco: Number(body.preco ?? servico.preco),
        duracao: Number(body.duracao ?? servico.duracao),
        imagem: body.imagem || servico.imagem,
      });
      setStorage(STORAGE_KEYS.servicos, servicos);
      return servico;
    }
    if (method === 'DELETE') {
      exigirTipo('admin');
      const filtrados = servicos.filter((item) => Number(item.id) !== id);
      setStorage(STORAGE_KEYS.servicos, filtrados);
      return { ok: true };
    }
  }

  if (route === '/usuarios' || route.startsWith('/usuarios?')) {
    const usuarios = parseStorage(STORAGE_KEYS.usuarios, usuariosOffline);
    if (method === 'GET') {
      return { usuarios: usuarios.map((usuario) => normalizeUsuario(usuario)) };
    }
    if (method === 'POST') {
      const existente = usuarios.find((u) => u.email.toLowerCase() === String(body.email || '').toLowerCase());
      if (existente) throw new Error('Já existe um usuário com este e-mail.');
      const novo = {
        id: proximoId(usuarios),
        nome: body.nome,
        email: body.email,
        senha: body.senha,
        tipo: 'cliente',
      };
      usuarios.push(novo);
      setStorage(STORAGE_KEYS.usuarios, usuarios);
      return { usuario: normalizeUsuario(novo), mensagem: 'Cadastro realizado com sucesso!' };
    }
    throw new Error('Operação não suportada para usuários.');
  }

  if (route === '/usuarios/me') {
    if (method === 'GET') {
      const usuario = obterUsuarioAtual();
      return { usuario: usuario ? normalizeUsuario(usuario) : null };
    }
    throw new Error('Operação não suportada em /usuarios/me.');
  }

  if (route === '/usuarios/login') {
    if (method === 'POST') {
      const usuarios = parseStorage(STORAGE_KEYS.usuarios, usuariosOffline);
      const usuario = usuarios.find((item) => item.email.toLowerCase() === String(body.email || '').toLowerCase() && item.senha === String(body.senha || ''));
      if (!usuario) throw new Error('Invalid email or password.');
      const usuarioSemSenha = normalizeUsuario(usuario);
      salvarUsuarioAtual(usuarioSemSenha);
      return { usuario: usuarioSemSenha, mensagem: 'Login successful!' };
    }
    throw new Error('Operação não suportada para login.');
  }

  if (route === '/usuarios/logout') {
    if (method === 'POST') {
      salvarUsuarioAtual(null);
      return { ok: true };
    }
    throw new Error('Operação não suportada para logout.');
  }

  if (route.startsWith('/usuarios/')) {
    const usuarios = parseStorage(STORAGE_KEYS.usuarios, usuariosOffline);
    const id = Number(partes[1]);
    const usuario = usuarios.find((item) => Number(item.id) === id);
    if (!usuario) throw new Error('Usuário não encontrado.');
    if (method === 'PUT') {
      const atual = obterUsuarioAtual();
      if (!atual || (atual.id !== id && atual.tipo !== 'admin')) {
        throw new Error('Você não pode editar este usuário.');
      }
      if (body.nome) usuario.nome = body.nome;
      if (body.email) usuario.email = body.email;
      if (body.senha) usuario.senha = body.senha;
      if (body.tipo && atual.tipo === 'admin') usuario.tipo = body.tipo;
      setStorage(STORAGE_KEYS.usuarios, usuarios);
      return { usuario: normalizeUsuario(usuario) };
    }
    if (method === 'DELETE') {
      exigirTipo('admin');
      const filtrados = usuarios.filter((item) => Number(item.id) !== id);
      setStorage(STORAGE_KEYS.usuarios, filtrados);
      return { ok: true };
    }
  }

  if (route === '/pets' || route.startsWith('/pets?')) {
    const pets = parseStorage(STORAGE_KEYS.pets, petsOffline);
    const usuarioAtual = obterUsuarioAtual();
    if (method === 'GET') {
      if (!usuarioAtual) return { pets: [] };
      const lista = usuarioAtual.tipo === 'admin' || usuarioAtual.tipo === 'funcionario'
        ? pets
        : pets.filter((pet) => Number(pet.usuario_id) === Number(usuarioAtual.id));
      return { pets: lista };
    }
    if (method === 'POST') {
      const usuario = exigirLogin();
      const novoPet = {
        id: proximoId(pets),
        usuario_id: usuario.id,
        nome: body.nome,
        tipo: body.tipo,
        raca: body.raca,
        idade: body.idade,
        observacoes: body.observacoes || '',
      };
      pets.push(novoPet);
      setStorage(STORAGE_KEYS.pets, pets);
      return novoPet;
    }
    throw new Error('Operação não suportada para pets.');
  }

  if (route.startsWith('/pets/')) {
    const pets = parseStorage(STORAGE_KEYS.pets, petsOffline);
    const id = Number(partes[1]);
    const pet = pets.find((item) => Number(item.id) === id);
    if (!pet) throw new Error('Pet não encontrado.');
    const usuario = exigirLogin();
    if (usuario.id !== pet.usuario_id && usuario.tipo !== 'admin' && usuario.tipo !== 'funcionario') {
      throw new Error('Você não pode alterar este pet.');
    }
    if (method === 'PUT') {
      Object.assign(pet, {
        nome: body.nome || pet.nome,
        tipo: body.tipo || pet.tipo,
        raca: body.raca || pet.raca,
        idade: body.idade || pet.idade,
        observacoes: body.observacoes ?? pet.observacoes,
      });
      setStorage(STORAGE_KEYS.pets, pets);
      return pet;
    }
    if (method === 'DELETE') {
      const filtrados = pets.filter((item) => Number(item.id) !== id);
      setStorage(STORAGE_KEYS.pets, filtrados);
      return { ok: true };
    }
  }

  if (route === '/agendamentos' || route.startsWith('/agendamentos?')) {
    const agendamentos = parseStorage(STORAGE_KEYS.agendamentos, []);
    const usuario = obterUsuarioAtual();
    if (method === 'GET') {
      if (!usuario) return { agendamentos: agendamentos };
      const lista = usuario.tipo === 'admin' || usuario.tipo === 'funcionario'
        ? agendamentos
        : agendamentos.filter((item) => Number(item.usuario_id) === Number(usuario.id));
      return { agendamentos: lista };
    }
    if (method === 'POST') {
      const novoAgendamento = {
        id: proximoId(agendamentos),
        usuario_id: usuario ? usuario.id : 0,
        pet_id: Number(body.pet_id || 0),
        servico_id: Number(body.servico_id || 0),
        servico_nome: body.servico_nome || 'Service',
        pet_nome: body.pet_nome || 'Pet',
        nome: body.nome || 'Customer',
        contato: body.contato || '',
        data: body.data,
        horario: body.horario || '09:00',
        status: 'Pending',
      };
      agendamentos.push(novoAgendamento);
      setStorage(STORAGE_KEYS.agendamentos, agendamentos);
      return novoAgendamento;
    }
    throw new Error('Operação não suportada para agendamentos.');
  }

  if (route.startsWith('/agendamentos/')) {
    const agendamentos = parseStorage(STORAGE_KEYS.agendamentos, []);
    const id = Number(partes[1]);
    const agendamento = agendamentos.find((item) => Number(item.id) === id);
    if (!agendamento) throw new Error('Agendamento não encontrado.');
    const usuario = exigirLogin();
    if (usuario.id !== agendamento.usuario_id && usuario.tipo !== 'admin' && usuario.tipo !== 'funcionario') {
      throw new Error('Você não pode alterar este agendamento.');
    }
    if (method === 'PUT') {
      if (body.status) agendamento.status = body.status;
      if (body.data) agendamento.data = body.data;
      if (body.horario) agendamento.horario = body.horario;
      setStorage(STORAGE_KEYS.agendamentos, agendamentos);
      return agendamento;
    }
    if (method === 'DELETE') {
      const filtrados = agendamentos.filter((item) => Number(item.id) !== id);
      setStorage(STORAGE_KEYS.agendamentos, filtrados);
      return { ok: true };
    }
  }

  if (route === '/pedidos' || route.startsWith('/pedidos?')) {
    const pedidos = parseStorage(STORAGE_KEYS.pedidos, []);
    const usuario = obterUsuarioAtual();
    if (method === 'GET') {
      if (!usuario) return { pedidos: pedidos };
      const lista = usuario.tipo === 'admin' || usuario.tipo === 'funcionario'
        ? pedidos
        : pedidos.filter((item) => Number(item.usuario_id) === Number(usuario.id));
      return { pedidos: lista };
    }
    if (method === 'POST') {
      const itens = body.itens || [];
      const total = itens.reduce((soma, item) => soma + Number(item.preco || 0) * Number(item.quantidade || 0), 0);
      const novoPedido = {
        id: proximoId(pedidos),
        usuario_id: usuario ? usuario.id : 0,
        data: new Date().toISOString(),
        total,
        status: 'Pending',
        itens,
      };
      pedidos.push(novoPedido);
      setStorage(STORAGE_KEYS.pedidos, pedidos);
      return novoPedido;
    }
    throw new Error('Operação não suportada para pedidos.');
  }

  if (route.startsWith('/pedidos/')) {
    const pedidos = parseStorage(STORAGE_KEYS.pedidos, []);
    const id = Number(partes[1]);
    const pedido = pedidos.find((item) => Number(item.id) === id);
    if (!pedido) throw new Error('Pedido não encontrado.');
    const usuario = exigirLogin();
    if (usuario.id !== pedido.usuario_id && usuario.tipo !== 'admin' && usuario.tipo !== 'funcionario') {
      throw new Error('Você não pode alterar este pedido.');
    }
    if (method === 'PUT') {
      pedido.status = body.status || pedido.status;
      setStorage(STORAGE_KEYS.pedidos, pedidos);
      return pedido;
    }
  }

  if (route === '/avaliacoes' || route.startsWith('/avaliacoes?')) {
    const avaliacoes = listarAvaliacoes();
    if (method === 'GET') {
      const produtoId = Number(query.get('produto_id'));
      if (produtoId) {
        return avaliacoes.filter((a) => Number(a.produto_id) === produtoId).map(montarAvaliacao);
      }
      return avaliacoes.map(montarAvaliacao).slice(0, 6);
    }
    if (method === 'POST') {
      const usuario = obterUsuarioAtual();
      const novaAvaliacao = {
        id: proximoId(avaliacoes),
        produto_id: Number(body.produto_id),
        usuario_id: usuario ? usuario.id : 0,
        nota: Number(body.nota || 0),
        comentario: body.comentario || '',
      };
      avaliacoes.push(novaAvaliacao);
      setStorage(STORAGE_KEYS.avaliacoes, avaliacoes);
      return montarAvaliacao(novaAvaliacao);
    }
    throw new Error('Operação não suportada para avaliações.');
  }

  throw new Error('Rota não encontrada no modo frontend estático.');
}

const get = (caminho) => api(caminho, { method: 'GET' });
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

function formatarPreco(valor) {
  return Number(valor).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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

const CHAVE_CARRINHO = STORAGE_KEYS.carrinho;

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

async function inicializarCabecalho() {
  atualizarContadorCarrinho();
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const linkUsuario = document.querySelector('#link-usuario');
  if (!linkUsuario) return;

  linkUsuario.setAttribute('href', 'perfil.html');
  linkUsuario.setAttribute('title', 'Profile');

  try {
    const { usuario } = await get('/usuarios/me');
    if (usuario) {
      const nome = usuario.nome || 'Customer';
      linkUsuario.setAttribute('title', `Hello, ${nome}`);
      const linkAdmin = document.querySelector('#link-admin');
      if (linkAdmin && (usuario.tipo === 'admin' || usuario.tipo === 'funcionario')) {
        linkAdmin.style.display = 'inline-block';
      }
    }
  } catch {
    // Customer pages remain open without login.
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
  seedLocalStorage();
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
