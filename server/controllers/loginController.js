const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Exemplo de blacklist para tokens revogados (em memória – para produção, considere usar um armazenamento persistente)
const tokenBlacklist = [];

// Carregamento dos usuários do arquivo JSON
let users;
try {
  users = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json')));
} catch (error) {
  console.error('Erro ao ler o arquivo de usuários:', error);
  users = [];
}

exports.login = (req, res) => {
  const { username, password } = req.body;

  // Localiza o usuário pelo username
  const user = users.find(u => u.username === username);
  if (!user) {
    console.error(`Tentativa de login: usuário "${username}" não encontrado.`);
    return res.status(400).json({ message: 'Usuário não encontrado' });
  }

  // Compara a senha informada com o hash armazenado
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) {
      console.error('Erro na comparação de senhas:', err);
      return res.status(500).json({ message: 'Erro ao processar a senha' });
    }

    if (!isMatch) {
      console.warn(`Tentativa de login: senha incorreta para o usuário "${username}".`);
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Gera o token JWT com expiração de 1 hora
    const token = jwt.sign({ username: user.username }, 'secret', { expiresIn: '1h' });
    console.log(`Login bem-sucedido para o usuário "${username}".`);
    res.json({ message: 'Logado com sucesso!', token });
  });
};

// Exemplo de função para revogar tokens (adiciona o token à blacklist)
// Em rotas protegidas, você deverá verificar se o token não está na blacklist.
exports.revokeToken = (token) => {
  tokenBlacklist.push(token);
};

// Exemplo de middleware para verificar se o token foi revogado (a ser usado em rotas protegidas)
exports.checkTokenNotRevoked = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (tokenBlacklist.includes(token)) {
    return res.status(401).json({ message: 'Token revogado' });
  }
  next();
};
