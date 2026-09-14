// middleware/auth.js
// Funções simples de controle de acesso baseadas na sessão do usuário.
// A sessão é criada em routes/usuarios.js no momento do login.

function exigirLogin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ erro: 'Você precisa estar logado para acessar este recurso.' });
  }
  next();
}

// Recebe uma lista de tipos permitidos, ex: exigirTipo('admin', 'funcionario')
function exigirTipo(...tiposPermitidos) {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ erro: 'Você precisa estar logado para acessar este recurso.' });
    }
    if (!tiposPermitidos.includes(req.session.usuario.tipo)) {
      return res.status(403).json({ erro: 'Você não tem permissão para acessar este recurso.' });
    }
    next();
  };
}

module.exports = { exigirLogin, exigirTipo };
